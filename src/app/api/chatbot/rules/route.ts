import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, canAccessSession } from '@/lib/api-auth';
import { DEFAULT_CHATBOT_CONFIG, DEFAULT_CHATBOT_RULES } from '@/lib/chatbot/rule-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get('sessionId');

    // If sessionId provided, check access permission
    if (sessionId) {
      const hasAccess = await canAccessSession(user.id, user.role, sessionId);
      if (!hasAccess) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    // Prioritize session-level config, fallback to user-level config
    let config = null;
    if (sessionId) {
      config = await prisma.chatbotConfig.findFirst({
        where: { sessionId },
      });
    }

    if (!config) {
      config = await prisma.chatbotConfig.findFirst({
        where: { userId: user.id },
      });
    }

    if (config) {
      const rawRules = config.rules;
      const loadedRules = Array.isArray(rawRules) && rawRules.length > 0
        ? rawRules
        : DEFAULT_CHATBOT_RULES;

      const fallbackMsg = config.defaultFallback || config.fallbackMessage || DEFAULT_CHATBOT_CONFIG.fallbackMessage;

      return NextResponse.json({
        success: true,
        enabled: config.enabled ?? config.isActive ?? true,
        autoReplyAnyWord: config.autoReplyAnyWord ?? false,
        fallbackMessage: fallbackMsg,
        rules: loadedRules,
      });
    }

    // Default clean configuration for new tenant / user
    return NextResponse.json({
      success: true,
      enabled: DEFAULT_CHATBOT_CONFIG.enabled,
      autoReplyAnyWord: DEFAULT_CHATBOT_CONFIG.autoReplyAnyWord,
      fallbackMessage: DEFAULT_CHATBOT_CONFIG.fallbackMessage,
      rules: DEFAULT_CHATBOT_RULES,
    });
  } catch (error: any) {
    console.error('[chatbot] Failed to get chatbot rules:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rules, enabled = true, autoReplyAnyWord = false, fallbackMessage, sessionId } = body;

    if (!Array.isArray(rules)) {
      return NextResponse.json({ success: false, error: 'Rules must be an array' }, { status: 400 });
    }

    if (sessionId) {
      const hasAccess = await canAccessSession(user.id, user.role, sessionId);
      if (!hasAccess) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    const fallbackMsg = fallbackMessage || DEFAULT_CHATBOT_CONFIG.fallbackMessage;
    const isBotEnabled = Boolean(enabled);
    const isAutoReplyAnyWord = Boolean(autoReplyAnyWord);

    // Find existing config for this session (if given) or user
    let existing = null;
    if (sessionId) {
      existing = await prisma.chatbotConfig.findFirst({
        where: { sessionId },
      });
    }

    if (!existing) {
      existing = await prisma.chatbotConfig.findFirst({
        where: { userId: user.id },
      });
    }

    let savedConfig;
    if (existing) {
      savedConfig = await prisma.chatbotConfig.update({
        where: { id: existing.id },
        data: {
          userId: user.id,
          sessionId: sessionId || existing.sessionId,
          enabled: isBotEnabled,
          isActive: isBotEnabled,
          autoReplyAnyWord: isAutoReplyAnyWord,
          fallbackMessage: fallbackMsg,
          defaultFallback: fallbackMsg,
          rules: rules as any,
        },
      });
    } else {
      savedConfig = await prisma.chatbotConfig.create({
        data: {
          userId: user.id,
          sessionId: sessionId || null,
          enabled: isBotEnabled,
          isActive: isBotEnabled,
          autoReplyAnyWord: isAutoReplyAnyWord,
          fallbackMessage: fallbackMsg,
          defaultFallback: fallbackMsg,
          rules: rules as any,
        },
      });
    }

    return NextResponse.json({
      success: true,
      enabled: savedConfig.enabled,
      autoReplyAnyWord: savedConfig.autoReplyAnyWord,
      fallbackMessage: savedConfig.defaultFallback || savedConfig.fallbackMessage || fallbackMsg,
      rules: Array.isArray(savedConfig.rules) ? savedConfig.rules : rules,
    });
  } catch (error: any) {
    console.error('[chatbot] Failed to save chatbot rules:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

