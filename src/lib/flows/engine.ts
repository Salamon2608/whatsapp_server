import { prisma } from '@/lib/prisma'
import type { WASocket, proto } from '@whiskeysockets/baileys'
import type {
  FlowNodeType,
  ParsedInbound,
  SendButtonsNodeConfig,
  SendListNodeConfig,
  SendMessageNodeConfig,
  CollectInputNodeConfig,
  ConditionNodeConfig,
  HttpRequestNodeConfig,
  AiAgentNodeConfig,
  HandoffNodeConfig,
} from './types'
import { logger } from '@/lib/logger'
import { simulateHumanTyping } from '@/lib/anti-ban'
import { generateReply } from '@/lib/ai/generate'
import { buildSystemPrompt } from '@/lib/ai/defaults'

export interface DispatchFlowsInput {
  sock: WASocket
  sessionId: string
  userId: string
  remoteJid: string
  message: ParsedInbound
  msg?: proto.IWebMessageInfo
}

export interface DispatchFlowsResult {
  consumed: boolean
  flowRunId?: string
  outcome?: string
}

function cleanNewlines(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
}

export function resolveJsonPath(data: any, path: string): unknown {
  if (data == null || !path) return undefined
  const cleanPath = path.trim()
  if (!cleanPath) return data

  const normalizedPath = cleanPath.replace(/\[(\w+)\]/g, '.$1')
  const parts = normalizedPath.split('.')
  let current: any = data

  for (const part of parts) {
    if (current == null) return undefined
    current = current[part]
  }

  return current
}

function formatValueForWhatsApp(val: unknown): string {
  if (val === undefined || val === null) return ''
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val)
  }
  if (Array.isArray(val)) {
    return val
      .map((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, any>

          // 1. Time Slot formatting (if item is a timeslot)
          if (obj.label && (obj.start_time || obj.display_order !== undefined)) {
            return `⏰ *${obj.label}*`
          }

          // 2. Offer / Discount formatting (if item is an offer)
          if (obj.discount_percentage || obj.promo_code) {
            let res = `🎉 *${obj.title || 'Special Offer'}* (${Number(obj.discount_percentage)}% OFF)`
            if (obj.promo_code) res += `\n  🎟️ Promo Code: *${obj.promo_code}*`
            if (obj.description) res += `\n  _${obj.description}_`
            if (obj.end_date) res += `\n  ⏳ Valid until: ${new Date(obj.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
            return res
          }

          // 3. Location formatting (if item is a location)
          if (obj.name && (obj.slug || obj.description || obj.desc) && !obj.pricing_type && !obj.adult_price && !obj.flat_price) {
            const desc = obj.description || obj.desc
            return `📍 *${obj.name}*${desc ? `\n  _${desc}_` : ''}`
          }

          // 4. Package formatting (if item is a package or tour)
          const name = obj.name || obj.title || obj.package || obj.package_name || obj.label || `Option ${idx + 1}`
          const details: string[] = []

          // Pricing calculation
          if (obj.pricing_type === 'flat' && obj.flat_price) {
            details.push(`💰 Price: ₹${Number(obj.flat_price).toLocaleString('en-IN')} / trip`)
          } else if (obj.pricing_type === 'per_head' && obj.adult_price) {
            const childText = obj.child_price && Number(obj.child_price) > 0 ? ` (Child: ₹${Number(obj.child_price).toLocaleString('en-IN')})` : ''
            details.push(`💰 Price: ₹${Number(obj.adult_price).toLocaleString('en-IN')} / person${childText}`)
          } else if (obj.price || obj.cost || obj.amount) {
            details.push(`💰 Price: ₹${Number(obj.price || obj.cost || obj.amount).toLocaleString('en-IN')}`)
          }

          // Capacity & Duration
          if (obj.max_capacity) {
            details.push(`👥 Capacity: ${obj.max_capacity} Persons`)
          }
          if (obj.duration_minutes) {
            details.push(`⏱️ Duration: ${obj.duration_minutes} Mins`)
          } else if (obj.date || obj.duration) {
            details.push(`📅 ${obj.date || obj.duration}`)
          }

          let res = `• *${name}*`
          if (details.length > 0) {
            res += `\n  ${details.join(' | ')}`
          }
          if (obj.description) {
            res += `\n  _${obj.description}_`
          }
          return res
        }
        return `• ${String(item)}`
      })
      .join('\n\n')
  }
  if (typeof val === 'object') {
    return JSON.stringify(val)
  }
  return String(val)
}

function interpolateVars(text: string, vars: Record<string, unknown>): string {
  if (!text || typeof text !== 'string') return ''
  let result = text.replace(/\{\{\s*vars\.([\w.]+)\s*\}\}/g, (_, key) => {
    const val = vars[key] !== undefined ? vars[key] : resolveJsonPath(vars, key)
    return formatValueForWhatsApp(val)
  })
  return cleanNewlines(result)
}

export async function dispatchInboundToFlows(
  input: DispatchFlowsInput,
): Promise<DispatchFlowsResult> {
  const { sock, sessionId, userId, remoteJid, message, msg } = input

  try {
    // 1. Check for an active FlowRun for this contact
    const activeRun = await prisma.flowRun.findFirst({
      where: {
        userId,
        contactId: remoteJid,
        status: 'active',
      },
      include: {
        flow: {
          include: {
            nodes: true,
          },
        },
      },
    })

    if (activeRun) {
      return await advanceActiveRun({
        sock,
        sessionId,
        run: activeRun,
        message,
        remoteJid,
        msg,
      })
    }

    // 2. No active run: check entry triggers for active flows
    const activeFlows = await prisma.flow.findMany({
      where: {
        userId,
        status: 'active',
        OR: [
          { sessionId: null },
          { sessionId: sessionId }
        ],
      },
      include: {
        nodes: true,
      },
    })

    for (const flow of activeFlows) {
      if (matchesTrigger(flow, message)) {
        logger.info('FlowEngine', `Starting flow "${flow.name}" for ${remoteJid}`)
        const initialText = message.text || message.reply_title || message.reply_id || ''
        return await startNewFlowRun({
          sock,
          sessionId,
          userId,
          flow,
          remoteJid,
          msg,
          initialInput: initialText,
        })
      }
    }

    return { consumed: false, outcome: 'no_match' }
  } catch (err: any) {
    logger.error('FlowEngine', `Flow dispatch error: ${err?.message || err}`)
    return { consumed: false }
  }
}

function matchesTrigger(flow: any, message: ParsedInbound): boolean {
  // 1. Any incoming message / any word
  if (flow.triggerType === 'all_messages' || flow.triggerType === 'any_message') {
    return true
  }

  // 2. First inbound message
  if (flow.triggerType === 'first_inbound_message') {
    return true
  }

  // 3. Specific keyword match
  if (flow.triggerType === 'keyword') {
    const cfg = (flow.triggerConfig as any) || {}
    const keywords: string[] = cfg.keywords || []
    if (keywords.length === 0) return false

    // Wildcard '*' matches any incoming message
    if (keywords.includes('*')) return true

    const textToMatch = (message.text || message.reply_title || message.reply_id || '').toLowerCase().trim()
    return keywords.some((kw) => textToMatch.includes(kw.toLowerCase().trim()))
  }

  return false
}

async function startNewFlowRun(args: {
  sock: WASocket
  sessionId: string
  userId: string
  flow: any
  remoteJid: string
  msg?: proto.IWebMessageInfo
  initialInput?: string
}): Promise<DispatchFlowsResult> {
  const { sock, sessionId, userId, flow, remoteJid, msg, initialInput } = args

  const entryKey = flow.entryNodeId || 'start'
  const initialVars: Record<string, unknown> = initialInput ? { input: initialInput } : {}
  const run = await prisma.flowRun.create({
    data: {
      flowId: flow.id,
      userId,
      sessionId,
      contactId: remoteJid,
      status: 'active',
      currentNodeKey: entryKey,
      vars: initialVars as any,
    },
  })

  // Log started event
  await prisma.flowRunEvent.create({
    data: {
      runId: run.id,
      nodeKey: entryKey,
      nodeType: 'start',
      eventType: 'started',
      payload: { flow_name: flow.name },
    },
  })

  // Execute from entry node
  return await walkFlowGraph({
    sock,
    flow,
    runId: run.id,
    remoteJid,
    startNodeKey: entryKey,
    currentVars: initialVars,
    msg,
  })
}

async function advanceActiveRun(args: {
  sock: WASocket
  sessionId: string
  run: any
  message: ParsedInbound
  remoteJid: string
  msg?: proto.IWebMessageInfo
}): Promise<DispatchFlowsResult> {
  const { sock, run, message, remoteJid, msg } = args
  const flow = run.flow
  const nodes = flow.nodes || []
  const currentNode = nodes.find((n: any) => n.nodeKey === run.currentNodeKey)

  if (!currentNode) {
    // Current node missing -> end run
    await prisma.flowRun.update({
      where: { id: run.id },
      data: { status: 'completed', endedAt: new Date() },
    })
    return { consumed: true, flowRunId: run.id, outcome: 'completed' }
  }

  const vars: Record<string, unknown> = (run.vars as any) || {}
  let nextNodeKey: string | null = null

  if (currentNode.nodeType === 'collect_input') {
    const cfg = (currentNode.config as any) as CollectInputNodeConfig
    const answer = message.text || message.reply_title || ''
    if (cfg.var_key) {
      vars[cfg.var_key] = answer
    }
    nextNodeKey = cfg.next_node_key || null
  } else if (currentNode.nodeType === 'send_buttons') {
    const cfg = (currentNode.config as any) as SendButtonsNodeConfig
    const reply = (message.reply_id || message.text || '').toLowerCase().trim()
    const hit = cfg.buttons?.find(
      (b, i) =>
        b.reply_id.toLowerCase() === reply ||
        b.title.toLowerCase() === reply ||
        String(i + 1) === reply ||
        reply.startsWith(String(i + 1) + '.') ||
        reply.startsWith(String(i + 1) + ' ')
    )
    if (hit) {
      vars.input = message.text || message.reply_title || ''
      vars.last_input = message.text || message.reply_title || ''
      nextNodeKey = hit.next_node_key
    } else if (cfg.fallback_node_key) {
      // Direct fallback node configured (e.g. AI Agent node)
      vars.input = message.text || message.reply_title || ''
      vars.last_input = message.text || message.reply_title || ''
      nextNodeKey = cfg.fallback_node_key
    } else {
      // If customer typed a custom prompt or question (e.g. "price is high any discount"),
      // check if the flow has an AI agent node to answer!
      const aiNode = nodes.find((n: any) => n.nodeType === 'ai_agent')
      if (aiNode) {
        vars.input = message.text || message.reply_title || ''
        vars.last_input = message.text || message.reply_title || ''
        nextNodeKey = aiNode.nodeKey
      }
    }
  } else if (currentNode.nodeType === 'send_list') {
    const cfg = (currentNode.config as any) as SendListNodeConfig
    const reply = (message.reply_id || message.text || '').toLowerCase().trim()
    let rowIndex = 0
    for (const section of cfg.sections || []) {
      for (const r of section.rows || []) {
        rowIndex++
        if (
          r.reply_id.toLowerCase() === reply ||
          r.title.toLowerCase() === reply ||
          String(rowIndex) === reply ||
          reply.startsWith(String(rowIndex) + '.') ||
          reply.startsWith(String(rowIndex) + ' ')
        ) {
          vars.input = message.text || message.reply_title || ''
          vars.last_input = message.text || message.reply_title || ''
          nextNodeKey = r.next_node_key
          break
        }
      }
      if (nextNodeKey) break
    }
    if (!nextNodeKey) {
      if (cfg.fallback_node_key) {
        vars.input = message.text || message.reply_title || ''
        vars.last_input = message.text || message.reply_title || ''
        nextNodeKey = cfg.fallback_node_key
      } else {
        const aiNode = nodes.find((n: any) => n.nodeType === 'ai_agent')
        if (aiNode) {
          vars.input = message.text || message.reply_title || ''
          vars.last_input = message.text || message.reply_title || ''
          nextNodeKey = aiNode.nodeKey
        }
      }
    }
  }

  if (!nextNodeKey) {
    // Unrecognized answer: reprompt or handoff
    const reprompts = (run.repromptCount || 0) + 1
    if (reprompts >= 2) {
      await prisma.flowRun.update({
        where: { id: run.id },
        data: { status: 'handed_off', endedAt: new Date() },
      })
      await simulateHumanTyping(sock, remoteJid, 40)
      await sock.sendMessage(
        remoteJid,
        { text: 'Transferring you to a human support agent...' },
        { quoted: msg as any }
      )
      return { consumed: true, flowRunId: run.id, outcome: 'handed_off' }
    }

    await prisma.flowRun.update({
      where: { id: run.id },
      data: { repromptCount: reprompts },
    })

    await simulateHumanTyping(sock, remoteJid, 40)
    await sock.sendMessage(
      remoteJid,
      { text: "I didn't quite catch that. Please select one of the provided options or type its number." },
      { quoted: msg as any }
    )
    return { consumed: true, flowRunId: run.id, outcome: 'fallback_fired' }
  }

  // Update vars and walk
  await prisma.flowRun.update({
    where: { id: run.id },
    data: { vars: vars as any, repromptCount: 0 },
  })

  return await walkFlowGraph({
    sock,
    flow,
    runId: run.id,
    remoteJid,
    startNodeKey: nextNodeKey,
    currentVars: vars,
    msg,
  })
}

async function walkFlowGraph(args: {
  sock: WASocket
  flow: any
  runId: string
  remoteJid: string
  startNodeKey: string
  currentVars: Record<string, unknown>
  msg?: proto.IWebMessageInfo
}): Promise<DispatchFlowsResult> {
  const { sock, flow, runId, remoteJid, startNodeKey, currentVars, msg } = args
  const nodes = flow.nodes || []
  let currKey: string | null = startNodeKey

  while (currKey) {
    const node = nodes.find((n: any) => n.nodeKey === currKey)
    if (!node) {
      await prisma.flowRun.update({
        where: { id: runId },
        data: { status: 'completed', endedAt: new Date() },
      })
      return { consumed: true, flowRunId: runId, outcome: 'completed' }
    }

    const cfg = (node.config as any) || {}

    // Log node entry
    await prisma.flowRunEvent.create({
      data: {
        runId: runId,
        nodeKey: node.nodeKey,
        nodeType: node.nodeType,
        eventType: 'node_entered',
      },
    })

    // 1. Start node
    if (node.nodeType === 'start') {
      currKey = cfg.next_node_key || null
      continue
    }

    // 2. Send Message node
    if (node.nodeType === 'send_message') {
      const text = cleanNewlines(interpolateVars(cfg.text || '', currentVars))
      await simulateHumanTyping(sock, remoteJid, text.length)
      await sock.sendMessage(remoteJid, { text }, { quoted: msg as any })
      currKey = cfg.next_node_key || null
      continue
    }

    // 3. Condition node
    if (node.nodeType === 'condition') {
      const cond = cfg as ConditionNodeConfig
      const varVal = String(currentVars[cond.subject_key] ?? '').toLowerCase()
      const targetVal = (cond.value || '').toLowerCase()
      let passed = false
      if (cond.operator === 'equals') passed = varVal === targetVal
      else if (cond.operator === 'contains') passed = varVal.includes(targetVal)
      else if (cond.operator === 'present') passed = Boolean(varVal)
      else if (cond.operator === 'absent') passed = !varVal

      currKey = passed ? cond.true_next : cond.false_next
      continue
    }

    // 3b. HTTP Request / External Backend node
    if (node.nodeType === 'http_request') {
      const httpCfg = cfg as HttpRequestNodeConfig
      const timeoutMs = httpCfg.timeout_ms || 10000

      // Injected system context for convenience
      const enrichedVars: Record<string, unknown> = {
        ...currentVars,
        remote_jid: remoteJid,
        phone: remoteJid.replace(/@.*$/, ''),
      }

      // Interpolate URL
      const targetUrl = interpolateVars(httpCfg.url || '', enrichedVars).trim()
      const method = (httpCfg.method || 'GET').toUpperCase()

      // Build Headers
      const headers: Record<string, string> = {}
      if (Array.isArray(httpCfg.headers)) {
        for (const h of httpCfg.headers) {
          if (h.key && h.key.trim()) {
            headers[h.key.trim()] = interpolateVars(h.value || '', enrichedVars)
          }
        }
      }

      // Build Body for POST / PUT / PATCH
      let body: string | undefined = undefined
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && httpCfg.body) {
        body = interpolateVars(httpCfg.body, enrichedVars)
        if (!headers['Content-Type'] && !headers['content-type']) {
          headers['Content-Type'] = 'application/json'
        }
      }

      let isSuccess = false
      let responseData: any = null

      try {
        logger.info('FlowEngine', `Executing HTTP Request [${method}] ${targetUrl}`)
        const response = await fetch(targetUrl, {
          method,
          headers,
          body,
          signal: AbortSignal.timeout(timeoutMs),
        })

        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          try {
            responseData = await response.json()
          } catch {
            responseData = await response.text()
          }
        } else {
          responseData = await response.text()
        }

        isSuccess = response.ok

        if (isSuccess && responseData) {
          if (Array.isArray(httpCfg.response_mappings)) {
            for (const mapping of httpCfg.response_mappings) {
              if (mapping.var_key && mapping.json_path) {
                const extracted = resolveJsonPath(responseData, mapping.json_path)
                if (extracted !== undefined) {
                  currentVars[mapping.var_key] = extracted
                }
              }
            }
          }
          currentVars['http_status'] = response.status
        } else {
          currentVars['http_status'] = response.status
          currentVars['http_error'] = `HTTP ${response.status}: ${
            typeof responseData === 'string' ? responseData.slice(0, 200) : 'Request failed'
          }`
        }
      } catch (err: any) {
        logger.error('FlowEngine', `HTTP Request failed to ${targetUrl}: ${err.message}`)
        isSuccess = false
        currentVars['http_status'] = 0
        currentVars['http_error'] = err.message || 'Network error'
      }

      // Persist updated variables in DB
      await prisma.flowRun.update({
        where: { id: runId },
        data: { vars: currentVars as any, lastAdvancedAt: new Date() },
      })

      await prisma.flowRunEvent.create({
        data: {
          runId,
          nodeKey: node.nodeKey,
          nodeType: node.nodeType,
          eventType: isSuccess ? 'http_request_success' : 'http_request_failed',
          payload: {
            url: targetUrl,
            method,
            success: isSuccess,
            status: Number(currentVars['http_status']) || 0,
          },
        },
      })

      currKey = isSuccess
        ? httpCfg.next_node_key || null
        : httpCfg.error_node_key || httpCfg.next_node_key || null
      continue
    }

    // 3c. AI Agent Node
    if (node.nodeType === 'ai_agent') {
      const aiCfg = cfg as AiAgentNodeConfig
      const enrichedVars: Record<string, unknown> = {
        ...currentVars,
        remote_jid: remoteJid,
        phone: remoteJid.replace(/@.*$/, ''),
      }

      // Fetch AI config for this user
      const aiConfig = await prisma.aiConfig.findFirst({
        where: { userId: flow.userId || undefined },
      })

      if (aiConfig) {
        // Resolve user prompt input (defaulting to {{input}} or customer text)
        const userPromptTemplate = aiCfg.user_prompt || '{{input}}'
        const promptInput = interpolateVars(userPromptTemplate, enrichedVars).trim() || String(currentVars.input || '')

        let knowledgeExcerpts: string[] = []
        if (aiCfg.knowledge_enabled !== false && flow.userId) {
          try {
            const { retrieveKnowledge } = await import('@/lib/ai/knowledge')
            knowledgeExcerpts = await retrieveKnowledge(flow.userId, promptInput, 3)
          } catch (e) {
            // ignore knowledge retrieval error
          }
        }

        const systemPrompt = buildSystemPrompt({
          userPrompt: aiCfg.system_prompt ? interpolateVars(aiCfg.system_prompt, enrichedVars) : (aiConfig.systemPrompt || null),
          mode: 'auto_reply',
          knowledge: knowledgeExcerpts,
        })

        try {
          logger.info('FlowEngine', `Executing AI Agent node "${node.nodeKey}" using ${aiConfig.provider}/${aiConfig.model}`)
          const genResult = await generateReply({
            config: {
              provider: aiConfig.provider as any,
              model: aiConfig.model,
              apiKey: aiConfig.apiKey,
              systemPrompt: aiConfig.systemPrompt,
              isActive: aiConfig.isActive,
              autoReplyEnabled: aiConfig.autoReplyEnabled,
              autoReplyMaxPerConversation: aiConfig.autoReplyMaxPerConversation || 10,
              handoffAgentId: aiConfig.handoffAgentId,
              embeddingsApiKey: aiConfig.embeddingsApiKey,
            },
            systemPrompt,
            messages: [{ role: 'user', content: promptInput }],
          })

          const replyText = cleanNewlines(genResult.text)
          const varKey = aiCfg.response_var || 'ai_reply'
          currentVars[varKey] = replyText

          // Save event
          await prisma.flowRunEvent.create({
            data: {
              runId,
              nodeKey: node.nodeKey,
              nodeType: node.nodeType,
              eventType: 'ai_reply_generated',
              payload: {
                provider: aiConfig.provider,
                model: aiConfig.model,
                input: promptInput,
                reply_length: replyText.length,
              },
            },
          })

          // Send message to WhatsApp directly if send_immediately is true (default true)
          if (aiCfg.send_immediately !== false && replyText) {
            await simulateHumanTyping(sock, remoteJid, replyText.length)
            await sock.sendMessage(remoteJid, { text: replyText }, { quoted: msg as any })
          }

          // Persist updated variables in DB
          await prisma.flowRun.update({
            where: { id: runId },
            data: { vars: currentVars as any, lastAdvancedAt: new Date() },
          })
        } catch (err: any) {
          logger.error('FlowEngine', `AI Agent node failed: ${err.message}`)
          currentVars['ai_error'] = err.message
        }
      } else {
        logger.warn('FlowEngine', `AI Agent node "${node.nodeKey}" skipped: No AI Config found for user.`)
      }

      currKey = aiCfg.next_node_key || null
      continue
    }

    // 4. Send Buttons node (suspends)
    if (node.nodeType === 'send_buttons') {
      const btnCfg = cfg as SendButtonsNodeConfig
      const rawText = cleanNewlines(interpolateVars(btnCfg.text || '', currentVars))
      let outText = rawText
      if (btnCfg.footer_text) outText += `\n\n_${cleanNewlines(btnCfg.footer_text)}_`
      outText += '\n' + (btnCfg.buttons || []).map((b, i) => `\n${i + 1}. ${cleanNewlines(b.title)}`).join('')
      outText = cleanNewlines(outText)

      await simulateHumanTyping(sock, remoteJid, outText.length)
      await sock.sendMessage(remoteJid, { text: outText }, { quoted: msg as any })

      await prisma.flowRun.update({
        where: { id: runId },
        data: { currentNodeKey: node.nodeKey, lastAdvancedAt: new Date() },
      })
      return { consumed: true, flowRunId: runId, outcome: 'advanced' }
    }

    // 5. Send List node (suspends)
    if (node.nodeType === 'send_list') {
      const listCfg = cfg as SendListNodeConfig
      let outText = cleanNewlines(interpolateVars(listCfg.text || '', currentVars))
      for (const sec of listCfg.sections || []) {
        outText += `\n\n*${cleanNewlines(sec.title)}*`
        for (const r of sec.rows || []) {
          outText += `\n• ${cleanNewlines(r.title)}${r.description ? ` - ${cleanNewlines(r.description)}` : ''}`
        }
      }
      if (listCfg.footer_text) outText += `\n\n_${cleanNewlines(listCfg.footer_text)}_`
      outText = cleanNewlines(outText)

      await simulateHumanTyping(sock, remoteJid, outText.length)
      await sock.sendMessage(remoteJid, { text: outText }, { quoted: msg as any })

      await prisma.flowRun.update({
        where: { id: runId },
        data: { currentNodeKey: node.nodeKey, lastAdvancedAt: new Date() },
      })
      return { consumed: true, flowRunId: runId, outcome: 'advanced' }
    }

    // 6. Collect Input node (suspends)
    if (node.nodeType === 'collect_input') {
      const inputCfg = cfg as CollectInputNodeConfig
      const prompt = cleanNewlines(interpolateVars(inputCfg.prompt_text || '', currentVars))
      await simulateHumanTyping(sock, remoteJid, prompt.length)
      await sock.sendMessage(remoteJid, { text: prompt }, { quoted: msg as any })

      await prisma.flowRun.update({
        where: { id: runId },
        data: { currentNodeKey: node.nodeKey, lastAdvancedAt: new Date() },
      })
      return { consumed: true, flowRunId: runId, outcome: 'advanced' }
    }

    // 7. Handoff node (terminal)
    if (node.nodeType === 'handoff') {
      await prisma.flowRun.update({
        where: { id: runId },
        data: { status: 'handed_off', endedAt: new Date() },
      })
      await simulateHumanTyping(sock, remoteJid, 40)
      await sock.sendMessage(
        remoteJid,
        { text: 'An agent will be with you shortly. Thank you for your patience!' },
        { quoted: msg as any }
      )
      return { consumed: true, flowRunId: runId, outcome: 'handed_off' }
    }

    // 8. End node (terminal)
    if (node.nodeType === 'end') {
      await prisma.flowRun.update({
        where: { id: runId },
        data: { status: 'completed', endedAt: new Date() },
      })
      return { consumed: true, flowRunId: runId, outcome: 'completed' }
    }

    // Unrecognized node -> end
    currKey = null
  }

  await prisma.flowRun.update({
    where: { id: runId },
    data: { status: 'completed', endedAt: new Date() },
  })
  return { consumed: true, flowRunId: runId, outcome: 'completed' }
}
