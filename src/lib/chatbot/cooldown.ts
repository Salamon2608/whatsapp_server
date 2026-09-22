import { prisma } from "@/lib/prisma";

// In-memory cache for fast O(1) cooldown lookups
// Stores both `${userId}:${phone}` and `phone:${phone}` -> timestamp (ms)
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

function getCleanPhone(remoteJid: string): string {
  // Extract pure phone number, ignoring device suffixes like :12 and domain (@s.whatsapp.net, @lid, etc.)
  return remoteJid.replace(/:\d+@/, '@').split('@')[0].replace(/\D/g, '');
}

function getCooldownKeys(userId: string | undefined, remoteJid: string): string[] {
  const phone = getCleanPhone(remoteJid);
  const keys = [
    `phone:${phone}`,
    `jid:${remoteJid}`,
  ];
  if (userId) {
    keys.push(`${userId}:${phone}`);
    keys.push(`${userId}:${remoteJid}`);
  }
  return keys;
}

/**
 * Checks if a contact has already received an auto-reply within the cooldown period (default: 24 hours).
 * Returns true if in cooldown (should skip sending another auto-reply).
 */
export async function isChatbotCooldownActive(
  userId: string | undefined,
  sessionId: string | undefined,
  remoteJid: string,
  cooldownMs: number = 24 * 60 * 60 * 1000
): Promise<boolean> {
  const now = Date.now();
  const keys = getCooldownKeys(userId, remoteJid);

  // 1. Check in-memory map (instant lookup across all key aliases)
  for (const key of keys) {
    const cachedTime = chatbotCooldownMap.get(key);
    if (cachedTime && now - cachedTime < cooldownMs) {
      return true;
    }
  }

  // 2. Fallback to database check (in case of server restart)
  try {
    const phone = getCleanPhone(remoteJid);
    const contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { jid: remoteJid },
          { jid: { startsWith: phone } },
          { jid: { contains: phone } },
        ],
        ...(sessionId ? { session: { sessionId } } : {}),
      },
      select: { data: true },
    });

    if (contact?.data && typeof contact.data === 'object') {
      const contactData = contact.data as Record<string, any>;
      const lastReply = contactData.lastChatbotReplyAt;
      if (typeof lastReply === 'number' && now - lastReply < cooldownMs) {
        // Re-populate in-memory map for fast future lookups
        for (const key of keys) {
          chatbotCooldownMap.set(key, lastReply);
        }
        return true;
      }
    }
  } catch (err) {
    console.error('[chatbot cooldown] DB check error:', err);
  }

  return false;
}

/**
 * Records that the chatbot just sent (or is sending) an auto-reply to this contact.
 * Immediately locks all memory keys so subsequent incoming messages in the same second are blocked.
 */
export async function recordChatbotReply(
  userId: string | undefined,
  sessionId: string | undefined,
  remoteJid: string
): Promise<void> {
  const now = Date.now();
  const keys = getCooldownKeys(userId, remoteJid);

  // 1. Immediately update in-memory map on all key aliases
  for (const key of keys) {
    chatbotCooldownMap.set(key, now);
  }

  // 2. Asynchronously persist timestamp to Contact table
  try {
    const phone = getCleanPhone(remoteJid);
    const contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { jid: remoteJid },
          { jid: { startsWith: phone } },
        ],
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
export function resetChatbotCooldown(userId: string | undefined, remoteJid: string): void {
  const keys = getCooldownKeys(userId, remoteJid);
  for (const key of keys) {
    chatbotCooldownMap.delete(key);
  }
}
