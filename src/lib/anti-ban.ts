import type { WASocket, AnyMessageContent, MiscMessageGenerationOptions } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";

// Cooldown tracker: stores contact JID -> timestamp of last auto-reply
const replyCooldownMap = new Map<string, number>();

/**
 * Checks if a contact is currently in cooldown to prevent infinite bot-loops and spam bans.
 * @param jid WhatsApp JID (phone number or group)
 * @param cooldownMs Cooldown duration in milliseconds (default: 2500ms)
 * @returns true if in cooldown (should skip reply), false if allowed (resets timer)
 */
export function isCooldownActive(jid: string, cooldownMs = 2500): boolean {
    const now = Date.now();
    const lastReply = replyCooldownMap.get(jid);

    if (lastReply && now - lastReply < cooldownMs) {
        return true;
    }

    // Clean up map occasionally if it gets large (> 2000 entries)
    if (replyCooldownMap.size > 2000) {
        for (const [key, timestamp] of replyCooldownMap.entries()) {
            if (now - timestamp > 60000) {
                replyCooldownMap.delete(key);
            }
        }
    }

    return false;
}

/**
 * Marks that a reply was just sent to this JID to activate the anti-loop cooldown.
 */
export function markReplySent(jid: string): void {
    replyCooldownMap.set(jid, Date.now());
}

/**
 * Simulates human typing behavior by sending a WhatsApp presence update ('composing'),
 * waiting a realistic human delay (1.2s - 2.5s), and then setting presence to 'paused'.
 * 
 * This makes the auto-reply appear as natural human activity to WhatsApp anti-spam filters.
 */
export async function simulateHumanTyping(
    sock: WASocket,
    jid: string,
    textLength: number = 25
): Promise<void> {
    try {
        // 1. Send 'composing' (Typing...) indicator
        await sock.sendPresenceUpdate('composing', jid).catch(() => {});

        // 2. Realistic human typing delay based on message length:
        // Base delay: 1000ms + (length * 15ms) + random jitter (200-500ms)
        // Capped between 1200ms and 2800ms to keep interactions snappy yet natural.
        const jitter = Math.floor(Math.random() * 300) + 200;
        const calculatedDelay = 1000 + Math.min(1300, textLength * 15) + jitter;
        const duration = Math.min(2800, Math.max(1200, calculatedDelay));

        await new Promise((resolve) => setTimeout(resolve, duration));

        // 3. Pause presence
        await sock.sendPresenceUpdate('paused', jid).catch(() => {});
    } catch (err) {
        // Fail gracefully without interrupting the reply flow
        logger.debug("AntiBan", `Presence simulation bypassed for ${jid}`);
    }
}

/**
 * Smart human-like message sender:
 * 1. Simulates typing indicator
 * 2. Delays naturally
 * 3. Sends the message with quoted context
 * 4. Activates anti-loop cooldown
 */
export async function smartSendWithHumanBehavior(
    sock: WASocket,
    jid: string,
    content: AnyMessageContent,
    options?: MiscMessageGenerationOptions
): Promise<any> {
    const textContent = (content as any)?.text || (content as any)?.caption || "";
    const textLength = typeof textContent === 'string' ? textContent.length : 20;

    // Simulate typing before sending
    await simulateHumanTyping(sock, jid, textLength);

    // Send the actual message
    const result = await sock.sendMessage(jid, content, options);

    // Mark as replied to prevent rapid-fire loop bans
    markReplySent(jid);

    return result;
}
