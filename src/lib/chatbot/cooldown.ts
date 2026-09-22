import { prisma } from "@/lib/prisma";

// In-memory cache for fast O(1) cooldown lookups
// Key: `${userId}:${cleanJid}` -> timestamp (ms)
const chatbotCooldownMap = new Map<string, number>();

// Clean up stale entries every hour to prevent memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    for (const [key, timestamp] of chatbotCooldownMap.entries()) {
      if (timestamp < cutoff) {
        chatbotCooldownMap.delete(key);
      }
    }
  }, 60 * 60 * 1000);
}

function getCooldownKey(userId: string, remoteJid: string): string {
  const cleanJid = remoteJid.split(':')[0].split('@')[0];
  return `${userId}:${cleanJid}`;
}

/**
 * Checks if a contact has already received an auto-reply within the cooldown period (default: 24 hours).
 */
export async function isChatbotCooldownActive(
  userId: string,
  sessionId: string | undefined,
  remoteJid: string,
  cooldownMs: number = 24 * 60 * 60 * 1000
): Promise<boolean> {
  const key = getCooldownKey(userId, remoteJid);
  const now = Date.now();

  // 1. Check in-memory map (instant lookup)
  const cachedTime = chatbotCooldownMap.get(key);
  if (cachedTime && now - cachedTime < cooldownMs) {
    return true;
  }

  // 2. Fallback to database check (in case server restarted)
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        jid: remoteJid,
        ...(sessionId ? { session: { sessionId } } : {}),
      },
      select: { data: true },
    });

    if (contact?.data && typeof contact.data === 'object') {
      const contactData = contact.data as Record<string, any>;
      const lastReply = contactData.lastChatbotReplyAt;
      if (typeof lastReply === 'number' && now - lastReply < cooldownMs) {
        chatbotCooldownMap.set(key, lastReply);
        return true;
      }
    }
  } catch (err) {
    console.error('[chatbot cooldown] DB check error:', err);
  }

  return false;
}

/**
 * Records that the chatbot just sent an auto-reply to this contact.
 */
export async function recordChatbotReply(
  userId: string,
  sessionId: string | undefined,
  remoteJid: string
): Promise<void> {
  const key = getCooldownKey(userId, remoteJid);
  const now = Date.now();

  // 1. Update in-memory map
  chatbotCooldownMap.set(key, now);

  // 2. Asynchronously persist to Contact table
  try {
    const contact = await prisma.contact.findFirst({
      where: {
        jid: remoteJid,
        ...(sessionId ? { session: { sessionId } } : {}),
      },
      select: { id: true, data: true },
    });

    if (contact) {
      const existingData = (contact.data && typeof contact.data === 'object')
        ? (contact.data as Record<string, any>)
        : {};

      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          data: {
            ...existingData,
            lastChatbotReplyAt: now,
          },
        },
      });
    }
  } catch (err) {
    console.error('[chatbot cooldown] DB persist error:', err);
  }
}

/**
 * Reset cooldown for testing or administration
 */
export function resetChatbotCooldown(userId: string, remoteJid: string): void {
  const key = getCooldownKey(userId, remoteJid);
  chatbotCooldownMap.delete(key);
}
