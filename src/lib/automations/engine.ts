import { prisma } from '@/lib/prisma'
import type { WASocket, proto } from '@whiskeysockets/baileys'
import type {
  AutomationStepConfig,
  ConditionStepConfig,
  KeywordMatchTriggerConfig,
  InteractiveReplyTriggerConfig,
  SendMessageStepConfig,
  SendButtonsStepConfig,
  SendListStepConfig,
  WaitStepConfig,
} from './types'
import { logger } from '@/lib/logger'

export interface AutomationContext {
  message_text?: string
  interactive_reply_id?: string
}

export interface RunAutomationsInput {
  sock: WASocket
  sessionId: string
  userId: string
  remoteJid: string
  triggerType: string
  context: AutomationContext
  msg?: proto.IWebMessageInfo
}

const WORD_CHAR = '[\\p{L}\\p{N}_]'

export function matchesWholeWord(text: string, keyword: string, caseSensitive = false): boolean {
  if (!keyword) return false
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`(?<!${WORD_CHAR})${escaped}(?!${WORD_CHAR})`, caseSensitive ? 'u' : 'iu')
  return pattern.test(text)
}

export function triggerMatches(automation: any, ctx: AutomationContext): boolean {
  if (automation.triggerType === 'keyword_match') {
    const cfg = (automation.triggerConfig as KeywordMatchTriggerConfig) || {}
    if (!cfg.keywords || cfg.keywords.length === 0) return false
    const text = (ctx.message_text ?? '').toString()
    if (!text) return false
    if (cfg.match_type === 'word') {
      return cfg.keywords.some((raw) => matchesWholeWord(text, raw, cfg.case_sensitive))
    }
    const haystack = cfg.case_sensitive ? text : text.toLowerCase()
    return cfg.keywords.some((raw) => {
      const k = cfg.case_sensitive ? raw : raw.toLowerCase()
      return cfg.match_type === 'exact' ? haystack === k : haystack.includes(k)
    })
  }

  if (automation.triggerType === 'interactive_reply') {
    const cfg = (automation.triggerConfig as InteractiveReplyTriggerConfig) || {}
    const replyId = ctx.interactive_reply_id
    if (!replyId || !Array.isArray(cfg.reply_ids) || cfg.reply_ids.length === 0) {
      return false
    }
    return cfg.reply_ids.includes(replyId)
  }

  return true
}

function evaluateCondition(cfg: ConditionStepConfig, ctx: AutomationContext): boolean {
  switch (cfg.subject) {
    case 'message_content': {
      const text = (ctx.message_text ?? '').toLowerCase()
      return text.includes((cfg.value ?? '').toLowerCase())
    }
    case 'time_of_day': {
      const [from, to] = (cfg.operand ?? '').split('-')
      if (!from || !to) return false
      const now = new Date()
      const mins = now.getHours() * 60 + now.getMinutes()
      const parse = (s: string) => {
        const [h, m] = s.split(':').map(Number)
        return (h || 0) * 60 + (m || 0)
      }
      const f = parse(from)
      const t = parse(to)
      return f <= t ? mins >= f && mins < t : mins >= f || mins < t
    }
    default:
      return true
  }
}

export async function runAutomationsForTrigger(input: RunAutomationsInput): Promise<boolean> {
  const { sock, sessionId, userId, remoteJid, triggerType, context, msg } = input

  try {
    const automations = await prisma.automation.findMany({
      where: {
        userId,
        triggerType,
        isActive: true,
      },
      include: {
        steps: {
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!automations || automations.length === 0) return false

    let fired = false

    for (const auto of automations) {
      if (!triggerMatches(auto, context)) continue

      logger.info('AutomationEngine', `Triggered automation "${auto.name}" for ${remoteJid}`)
      fired = true

      // Create log row
      const log = await prisma.automationLog.create({
        data: {
          automationId: auto.id,
          contactJid: remoteJid,
          status: 'running',
          triggerEvent: triggerType,
          stepsExecuted: [],
        },
      })

      const executedSteps: any[] = []
      let hadError = false
      let errorMessage: string | null = null

      try {
        // Group steps by tree or run root steps
        const rootSteps = auto.steps.filter((s) => !s.parentStepId)

        for (const step of rootSteps) {
          const stepConfig = (step.stepConfig as any) || {}

          if (step.stepType === 'send_message') {
            const cfg = stepConfig as SendMessageStepConfig
            if (cfg.text) {
              await sock.sendMessage(remoteJid, { text: cfg.text }, { quoted: msg as any })
              executedSteps.push({
                step_id: step.id,
                step_type: 'send_message',
                status: 'success',
                executed_at: new Date().toISOString(),
              })
            }
          } else if (step.stepType === 'send_buttons') {
            const cfg = stepConfig as SendButtonsStepConfig
            // Baileys button message or formatted fallback
            const btnList = cfg.buttons || []
            let buttonText = cfg.text || ''
            if (cfg.footer_text) buttonText += `\n\n_${cfg.footer_text}_`
            buttonText += '\n' + btnList.map((b, i) => `\n${i + 1}. ${b.title}`).join('')

            await sock.sendMessage(remoteJid, { text: buttonText }, { quoted: msg as any })
            executedSteps.push({
              step_id: step.id,
              step_type: 'send_buttons',
              status: 'success',
              executed_at: new Date().toISOString(),
            })
          } else if (step.stepType === 'send_list') {
            const cfg = stepConfig as SendListStepConfig
            let listText = cfg.text || ''
            for (const sec of cfg.sections || []) {
              listText += `\n\n*${sec.title}*`
              for (const row of sec.rows || []) {
                listText += `\n• ${row.title}${row.description ? ` - ${row.description}` : ''}`
              }
            }
            if (cfg.footer_text) listText += `\n\n_${cfg.footer_text}_`

            await sock.sendMessage(remoteJid, { text: listText }, { quoted: msg as any })
            executedSteps.push({
              step_id: step.id,
              step_type: 'send_list',
              status: 'success',
              executed_at: new Date().toISOString(),
            })
          } else if (step.stepType === 'condition') {
            const cfg = stepConfig as ConditionStepConfig
            const conditionResult = evaluateCondition(cfg, context)
            const branchToFollow = conditionResult ? 'yes' : 'no'
            executedSteps.push({
              step_id: step.id,
              step_type: 'condition',
              status: 'success',
              output: { branch: branchToFollow },
              executed_at: new Date().toISOString(),
            })

            // Execute children on this branch
            const branchChildren = auto.steps.filter(
              (s) => s.parentStepId === step.id && s.branch === branchToFollow
            )

            for (const child of branchChildren) {
              const childCfg = (child.stepConfig as any) || {}
              if (child.stepType === 'send_message' && childCfg.text) {
                await sock.sendMessage(remoteJid, { text: childCfg.text }, { quoted: msg as any })
                executedSteps.push({
                  step_id: child.id,
                  step_type: 'send_message',
                  status: 'success',
                  executed_at: new Date().toISOString(),
                })
              }
            }
          } else if (step.stepType === 'wait') {
            const cfg = stepConfig as WaitStepConfig
            // Cap inline wait at 5 seconds for interactive safety
            const ms = Math.min(5000, (cfg.amount || 1) * 1000)
            await new Promise((resolve) => setTimeout(resolve, ms))
            executedSteps.push({
              step_id: step.id,
              step_type: 'wait',
              status: 'success',
              executed_at: new Date().toISOString(),
            })
          }
        }

        await prisma.automationLog.update({
          where: { id: log.id },
          data: {
            status: 'success',
            stepsExecuted: executedSteps,
          },
        })
      } catch (err: any) {
        hadError = true
        errorMessage = err?.message || String(err)
        await prisma.automationLog.update({
          where: { id: log.id },
          data: {
            status: 'failed',
            errorMessage,
            stepsExecuted: executedSteps,
          },
        })
      }
    }

    return fired
  } catch (err: any) {
    logger.error('AutomationEngine', `Error in automation runner: ${err?.message || err}`)
    return false
  }
}
