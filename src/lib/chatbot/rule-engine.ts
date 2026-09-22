import { smartSendWithHumanBehavior } from "@/lib/anti-ban";

export interface ChatbotRule {
  id: string;
  keywords: string[];
  title: string;
  response: string;
  action?: 'none' | 'handover_human' | 'trigger_menu';
  triggerHandover?: boolean;
}

export const DEFAULT_CHATBOT_RULES: ChatbotRule[] = [
  {
    id: 'menu',
    keywords: ['hi', 'hello', 'hey', 'start', 'menu', 'options', 'info', 'help'],
    title: 'Main Menu / Welcome',
    response: `👋 *Welcome to our WhatsApp Assistant!*

How can we help you today? Please reply with a number:

1️⃣ *Pricing & Plans* - View pricing & packages
2️⃣ *Support & FAQs* - Get help with common issues
3️⃣ *Book a Demo* - Schedule a walkthrough
0️⃣ *Speak to Agent* - Connect with a human agent

_Tip: You can also type keywords like "pricing" or "support" anytime._`,
    action: 'trigger_menu'
  },
  {
    id: 'pricing',
    keywords: ['1', 'pricing', 'price', 'plan', 'plans', 'cost', 'subscription'],
    title: '1. Pricing & Plans',
    response: `💰 *Our Subscription Plans:*

🔹 *Starter Plan* - $29/month
• Up to 1,000 active contacts
• 1 WhatsApp number
• Unlimited rule-based chatbot replies

🔹 *Pro Business* - $79/month
• Up to 10,000 active contacts
• 3 WhatsApp numbers
• AI Auto-Responder + Analytics

🔹 *Enterprise* - Custom Pricing
• Unlimited contacts & custom integrations

Reply *3* to book a demo or *0* to talk with sales.`,
    action: 'none'
  },
  {
    id: 'support',
    keywords: ['2', 'support', 'helpdesk', 'faq', 'issue', 'problem', 'ticket'],
    title: '2. Support & Help',
    response: `🛠️ *Customer Support & FAQs:*

• *Business Hours:* Mon - Fri, 9:00 AM - 6:00 PM
• *Email Support:* support@example.com
• *Help Center:* https://docs.example.com

If your inquiry requires urgent assistance, please reply *0* to connect directly with an active agent.`,
    action: 'none'
  },
  {
    id: 'demo',
    keywords: ['3', 'demo', 'book', 'schedule', 'meeting', 'call'],
    title: '3. Book a Demo',
    response: `📅 *Schedule a Live Product Demo:*

We would love to show you how our WhatsApp automation tools work!

👉 Pick a convenient time on our calendar:
https://cal.com/demo-team/30min

Reply *0* if you'd like to ask a question right away!`,
    action: 'none'
  },
  {
    id: 'human_handover',
    keywords: ['0', 'agent', 'human', 'representative', 'support agent', 'talk to human', 'live agent'],
    title: '0. Handover to Human Agent',
    response: `👤 *Connecting you to a Human Agent...*

We've notified our team! An agent will join this conversation shortly.

Chatbot auto-replies have been paused for this conversation. You can message us freely.`,
    action: 'handover_human'
  }
];

export interface ChatbotConfig {
  enabled: boolean;
  autoReplyAnyWord: boolean;
  replyOncePerDay?: boolean;
  cooldownHours?: number;
  ignoreGroups?: boolean;
  fallbackMessage: string;
  rules: ChatbotRule[];
}

export const DEFAULT_CHATBOT_CONFIG: ChatbotConfig = {
  enabled: true,
  autoReplyAnyWord: false,
  replyOncePerDay: false,
  cooldownHours: 24,
  ignoreGroups: true,
  fallbackMessage: `👋 Hello! Welcome.\n\nHere are some options you can explore:\n\n1️⃣ Reply *1* or *PRICING* for Plans\n2️⃣ Reply *2* or *SUPPORT* for Help\n3️⃣ Reply *3* or *DEMO* for a Product Demo\n0️⃣ Reply *0* or *AGENT* to Speak Directly with Human`,
  rules: DEFAULT_CHATBOT_RULES,
};

export interface RuleEvaluationResult {
  matched: boolean;
  rule?: ChatbotRule;
  response?: string;
  action?: 'none' | 'handover_human' | 'trigger_menu';
  isHandover?: boolean;
}

/**
 * Evaluates inbound customer text against rule-based chatbot triggers.
 */
export function evaluateChatbotRule(
  text: string,
  isAutoReplyDisabled: boolean = false,
  customRules?: ChatbotRule[],
  autoReplyAnyWord: boolean = false,
  fallbackMessage?: string
): RuleEvaluationResult {
  if (isAutoReplyDisabled) {
    return { matched: false };
  }

  const cleanText = (text || '').trim().toLowerCase();
  if (!cleanText) {
    return { matched: false };
  }

  // Normalize by stripping punctuation and collapsing whitespace
  const normalizedText = cleanText.replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  const words = normalizedText ? normalizedText.split(' ') : [];

  const sourceRules = customRules && customRules.length > 0 ? customRules : DEFAULT_CHATBOT_RULES;

  // Order rules: Human Handover first, then remaining rules
  const handoverRules = sourceRules.filter(r => r.id === 'human_handover' || r.action === 'handover_human');
  const otherRules = sourceRules.filter(r => r.id !== 'human_handover' && r.action !== 'handover_human');
  const orderedRules: ChatbotRule[] = [...handoverRules, ...otherRules];

  for (const rule of orderedRules) {
    const isMatch = rule.keywords.some((kw) => {
      const lowerKw = kw.toLowerCase().trim();
      if (!lowerKw) return false;
      // Exact match (e.g. '1', '2', '0', 'hi', 'pricing')
      if (cleanText === lowerKw || normalizedText === lowerKw) return true;
      // Single word match in words list
      if (!lowerKw.includes(' ') && words.includes(lowerKw)) return true;
      // Multi-word phrase match (e.g. 'talk to human', 'support agent')
      if (lowerKw.includes(' ') && (cleanText.includes(lowerKw) || normalizedText.includes(lowerKw))) return true;
      // Starts with keyword
      if (cleanText.startsWith(lowerKw + ' ') || normalizedText.startsWith(lowerKw + ' ')) return true;
      if (lowerKw.length >= 3 && cleanText.includes(lowerKw)) return true;
      return false;
    });

    if (isMatch) {
      return {
        matched: true,
        rule,
        response: rule.response,
        action: rule.action || 'none',
        isHandover: rule.action === 'handover_human'
      };
    }
  }

  // If autoReplyAnyWord is enabled, trigger the default/fallback starter menu on any incoming word
  if (autoReplyAnyWord) {
    const menuRule = sourceRules.find(r => r.action === 'trigger_menu' || r.id === 'menu');
    const fallbackText = fallbackMessage || menuRule?.response || DEFAULT_CHATBOT_CONFIG.fallbackMessage;
    return {
      matched: true,
      rule: menuRule || {
        id: 'fallback',
        title: 'Default Welcome & Options',
        keywords: ['*'],
        response: fallbackText,
      },
      response: fallbackText,
      action: 'trigger_menu',
      isHandover: false,
    };
  }

  return { matched: false };
}

export async function executeChatbotRule(
  sock: any,
  userId: string,
  remoteJid: string,
  text: string,
  msg?: any,
  sessionId?: string
): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/prisma');

    let enabled = DEFAULT_CHATBOT_CONFIG.enabled;
    let autoReplyAnyWord = DEFAULT_CHATBOT_CONFIG.autoReplyAnyWord;
    let fallbackMessage = DEFAULT_CHATBOT_CONFIG.fallbackMessage;
    let customRules: ChatbotRule[] = DEFAULT_CHATBOT_RULES;

    // 1. Try to load from database prioritizing sessionId, then userId
    let dbConfig = null;
    if (sessionId) {
      dbConfig = await prisma.chatbotConfig.findFirst({
        where: { sessionId },
      });
    }

    if (!dbConfig && userId) {
      dbConfig = await prisma.chatbotConfig.findFirst({
        where: { userId },
      });
    }

    let replyOncePerDay = false;
    let cooldownHours = 24;
    let ignoreGroups = DEFAULT_CHATBOT_CONFIG.ignoreGroups ?? true;

    if (dbConfig) {
      const isBotEnabled = dbConfig.enabled ?? dbConfig.isActive ?? true;
      if (!isBotEnabled) {
        console.log(`[chatbot] Chatbot is disabled in DB for user ${userId}. Skipping.`);
        return false;
      }
      enabled = isBotEnabled;
      autoReplyAnyWord = dbConfig.autoReplyAnyWord ?? false;
      fallbackMessage = dbConfig.defaultFallback || dbConfig.fallbackMessage || DEFAULT_CHATBOT_CONFIG.fallbackMessage;
      if (Array.isArray(dbConfig.rules) && dbConfig.rules.length > 0) {
        customRules = dbConfig.rules as any[];
      }

      const meta = (dbConfig.handoffKeywords && typeof dbConfig.handoffKeywords === 'object' && !Array.isArray(dbConfig.handoffKeywords))
        ? (dbConfig.handoffKeywords as any)
        : {};
      replyOncePerDay = Boolean(meta.replyOncePerDay);
      cooldownHours = typeof meta.cooldownHours === 'number' ? meta.cooldownHours : 24;
      if (meta.ignoreGroups !== undefined) {
        ignoreGroups = Boolean(meta.ignoreGroups);
      }
    }

    if (!enabled) {
      return false;
    }

    // Ignore WhatsApp Groups (@g.us) if ignoreGroups is active
    const isGroup = remoteJid.endsWith('@g.us');
    if (isGroup && ignoreGroups) {
      console.log(`[chatbot] Skipping reply to group ${remoteJid} (ignoreGroups=true).`);
      return false;
    }

    // Cooldown check: If "Reply Once Per Day" is active, check if this contact already received an auto-reply recently
    if (replyOncePerDay) {
      const { isChatbotCooldownActive } = await import('@/lib/chatbot/cooldown');
      const cooldownMs = (cooldownHours || 24) * 60 * 60 * 1000;
      const inCooldown = await isChatbotCooldownActive(userId, sessionId, remoteJid, cooldownMs);

      if (inCooldown) {
        // Evaluate rule to check if user is triggering human handover
        const prelimResult = evaluateChatbotRule(
          text,
          false,
          customRules,
          autoReplyAnyWord,
          fallbackMessage
        );

        // If not a human handover trigger, skip sending repetitive auto-reply
        if (!prelimResult.isHandover && prelimResult.action !== 'handover_human') {
          console.log(`[chatbot] Skipping reply to ${remoteJid} - Reply Once Per Day is active (already replied within ${cooldownHours}h).`);
          return false;
        }
      }
    }

    const result = evaluateChatbotRule(
      text,
      false,
      customRules,
      autoReplyAnyWord,
      fallbackMessage
    );

    console.log(`[chatbot] Evaluated "${text}" from ${remoteJid}: matched=${result.matched}, rule="${result.rule?.title || 'None'}"`);

    if (result.matched && result.response) {
      console.log(`[chatbot] Sending auto-reply to ${remoteJid}...`);
      try {
        await smartSendWithHumanBehavior(sock, remoteJid, { text: result.response }, { quoted: msg });
      } catch (sendErr) {
        // Fallback without quoted message in case quoting fails
        await smartSendWithHumanBehavior(sock, remoteJid, { text: result.response });
      }
      console.log(`[chatbot] Reply successfully sent to ${remoteJid}`);

      // Record reply timestamp for cooldown rate-limiting
      if (replyOncePerDay) {
        const { recordChatbotReply } = await import('@/lib/chatbot/cooldown');
        recordChatbotReply(userId, sessionId, remoteJid).catch(() => {});
      }

      return true;
    }

    return false;
  } catch (err) {
    console.error('[chatbot] execute error:', err);
    return false;
  }
}
