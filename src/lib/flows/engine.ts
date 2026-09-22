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
  HandoffNodeConfig,
} from './types'
import { logger } from '@/lib/logger'
import { simulateHumanTyping } from '@/lib/anti-ban'

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

function interpolateVars(text: string, vars: Record<string, unknown>): string {
  return text.replace(/\{\{\s*vars\.([\w.]+)\s*\}\}/g, (_, key) => {
    return String(vars[key] ?? '')
  })
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
        return await startNewFlowRun({
          sock,
          sessionId,
          userId,
          flow,
          remoteJid,
          msg,
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
}): Promise<DispatchFlowsResult> {
  const { sock, sessionId, userId, flow, remoteJid, msg } = args

  const entryKey = flow.entryNodeId || 'start'
  const run = await prisma.flowRun.create({
    data: {
      flowId: flow.id,
      userId,
      sessionId,
      contactId: remoteJid,
      status: 'active',
      currentNodeKey: entryKey,
      vars: {},
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
    currentVars: {},
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
        String(i + 1) === reply
    )
    if (hit) {
      nextNodeKey = hit.next_node_key
    }
  } else if (currentNode.nodeType === 'send_list') {
    const cfg = (currentNode.config as any) as SendListNodeConfig
    const reply = (message.reply_id || message.text || '').toLowerCase().trim()
    for (const section of cfg.sections || []) {
      const hit = section.rows?.find(
        (r) => r.reply_id.toLowerCase() === reply || r.title.toLowerCase() === reply
      )
      if (hit) {
        nextNodeKey = hit.next_node_key
        break
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
      const text = interpolateVars(cfg.text || '', currentVars)
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

    // 4. Send Buttons node (suspends)
    if (node.nodeType === 'send_buttons') {
      const btnCfg = cfg as SendButtonsNodeConfig
      const rawText = interpolateVars(btnCfg.text || '', currentVars)
      let outText = rawText
      if (btnCfg.footer_text) outText += `\n\n_${btnCfg.footer_text}_`
      outText += '\n' + (btnCfg.buttons || []).map((b, i) => `\n${i + 1}. ${b.title}`).join('')

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
      let outText = interpolateVars(listCfg.text || '', currentVars)
      for (const sec of listCfg.sections || []) {
        outText += `\n\n*${sec.title}*`
        for (const r of sec.rows || []) {
          outText += `\n• ${r.title}${r.description ? ` - ${r.description}` : ''}`
        }
      }
      if (listCfg.footer_text) outText += `\n\n_${listCfg.footer_text}_`

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
      const prompt = interpolateVars(inputCfg.prompt_text || '', currentVars)
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
