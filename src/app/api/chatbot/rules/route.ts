import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_CHATBOT_CONFIG, DEFAULT_CHATBOT_RULES } from '@/lib/chatbot/rule-engine';

const RULES_FILE_PATH = path.join(process.cwd(), 'src', 'lib', 'chatbot', 'rules.json');

export async function GET() {
  try {
    if (fs.existsSync(RULES_FILE_PATH)) {
      const raw = fs.readFileSync(RULES_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        return NextResponse.json({
          success: true,
          enabled: true,
          autoReplyAnyWord: true,
          fallbackMessage: DEFAULT_CHATBOT_CONFIG.fallbackMessage,
          rules: parsed,
        });
      }

      return NextResponse.json({
        success: true,
        enabled: parsed.enabled ?? true,
        autoReplyAnyWord: parsed.autoReplyAnyWord ?? true,
        fallbackMessage: parsed.fallbackMessage || DEFAULT_CHATBOT_CONFIG.fallbackMessage,
        rules: Array.isArray(parsed.rules) ? parsed.rules : DEFAULT_CHATBOT_RULES,
      });
    }

    return NextResponse.json({
      success: true,
      enabled: true,
      autoReplyAnyWord: true,
      fallbackMessage: DEFAULT_CHATBOT_CONFIG.fallbackMessage,
      rules: DEFAULT_CHATBOT_RULES,
    });
  } catch (error: any) {
    console.error('Failed to read chatbot rules:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rules, enabled = true, autoReplyAnyWord = true, fallbackMessage } = body;

    if (!Array.isArray(rules)) {
      return NextResponse.json({ success: false, error: 'Rules must be an array' }, { status: 400 });
    }

    const payload = {
      enabled: Boolean(enabled),
      autoReplyAnyWord: Boolean(autoReplyAnyWord),
      fallbackMessage: fallbackMessage || DEFAULT_CHATBOT_CONFIG.fallbackMessage,
      rules,
    };

    const dir = path.dirname(RULES_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(RULES_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');

    // Also sync to Prisma ChatbotConfig table
    try {
      const { prisma } = await import('@/lib/prisma');
      const firstUser = await prisma.user.findFirst({ select: { id: true } });
      if (firstUser) {
        const existing = await prisma.chatbotConfig.findFirst({ where: { userId: firstUser.id } });
        if (existing) {
          await prisma.chatbotConfig.update({
            where: { id: existing.id },
            data: {
              enabled: payload.enabled,
              isActive: payload.enabled,
              autoReplyAnyWord: payload.autoReplyAnyWord,
              fallbackMessage: payload.fallbackMessage,
              defaultFallback: payload.fallbackMessage,
              rules: payload.rules as any,
            }
          });
        } else {
          await prisma.chatbotConfig.create({
            data: {
              userId: firstUser.id,
              enabled: payload.enabled,
              isActive: payload.enabled,
              autoReplyAnyWord: payload.autoReplyAnyWord,
              fallbackMessage: payload.fallbackMessage,
              defaultFallback: payload.fallbackMessage,
              rules: payload.rules as any,
            }
          });
        }
      }
    } catch (dbErr) {
      console.error('[chatbot] Failed to sync to ChatbotConfig DB:', dbErr);
    }

    return NextResponse.json({ success: true, ...payload });
  } catch (error: any) {
    console.error('Failed to save chatbot rules:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
