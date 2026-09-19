import { prisma } from "@/lib/prisma";
import type { WASocket, WAMessage } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";

// Map to track start times for uptime
const startTimes = new Map<string, number>();

// Default bot config
const DEFAULT_CONFIG = {
    enabled: true,
    botMode: 'OWNER',
    botAllowedJids: [] as string[],
    autoReplyMode: 'ALL',
    autoReplyAllowedJids: [] as string[],
    enableSticker: false,
    enableVideoSticker: false,
    maxStickerDuration: 10,
    enablePing: true,
    enableUptime: true,
    botName: "WA-AKG Bot",
    prefix: "#",
    removeBgApiKey: null as string | null
};

export function setSessionStartTime(sessionId: string) {
    if (!startTimes.has(sessionId)) {
        startTimes.set(sessionId, Date.now());
    }
}

export async function handleBotCommand(
    sock: WASocket | undefined,
    sessionId: string,
    msg: WAMessage
) {
    if (!sock || !msg.message || !msg.key.remoteJid) return;

    const remoteJid = msg.key.remoteJid;
    const fromMe = msg.key.fromMe || false;

    // Get text content
    let text = "";
    const messageContent = msg.message;

    if (messageContent.conversation) {
        text = messageContent.conversation;
    } else if (messageContent.extendedTextMessage?.text) {
        text = messageContent.extendedTextMessage.text;
    } else if (messageContent.imageMessage?.caption) {
        text = messageContent.imageMessage.caption;
    } else if (messageContent.videoMessage?.caption) {
        text = messageContent.videoMessage.caption;
    }

    // Quick check: skip non-command messages early (common prefixes)
    // We'll do a proper prefix check after loading config
    if (!text || text.length === 0) return;

    // Fetch session first
    const session = await prisma.session.findUnique({
        where: { sessionId },
        select: { id: true }
    });

    if (!session) return;

    // Fetch BotConfig separately
    // @ts-ignore - Prisma Client types might lag in IDE
    const botConfig = await (prisma as any).botConfig.findUnique({
        where: { sessionId: session.id }
    });

    const config = botConfig || DEFAULT_CONFIG;

    if (!config.enabled) return;

    // Now check prefix with loaded config
    const prefix = (config as any).prefix || "#";
    if (!text.startsWith(prefix)) return;

    // Verify Access Permissions
    const botMode = (config as any).botMode || 'OWNER'; // Default to OWNER if missing

    // Check Permission
    let canExecute = false;

    if (fromMe) {
        canExecute = true; // Owner always allowed
    } else {
        if (botMode === 'ALL') {
            canExecute = true;
        } else if (botMode === 'SPECIFIC') {
            const allowedJids = (config as any).botAllowedJids || [];
            // Standardized Sender Logic (matches webhook & store)
            const isGroup = msg.key.remoteJid?.endsWith("@g.us") || false;
            const remoteJidAlt = msg.key.remoteJidAlt;
            let senderJid = (isGroup ? (msg.key.participant || msg.participant) : msg.key.remoteJid) || "";

            if (!isGroup && remoteJidAlt) {
                senderJid = remoteJidAlt;
            }

            if (Array.isArray(allowedJids)) {
                canExecute = allowedJids.some(jid => senderJid.includes(jid));
            }
        } else if (botMode === 'BLACKLIST') {
            const blockedJids = (config as any).botBlockedJids || [];
            const isGroup = msg.key.remoteJid?.endsWith("@g.us") || false;
            const remoteJidAlt = msg.key.remoteJidAlt;
            let senderJid = (isGroup ? (msg.key.participant || msg.participant) : msg.key.remoteJid) || "";

            if (!isGroup && remoteJidAlt) {
                senderJid = remoteJidAlt;
            }

            // If blacklist, allowed by default UNLESS in blocked list
            canExecute = true;
            if (Array.isArray(blockedJids)) {
                const isBlocked = blockedJids.some(jid => senderJid.includes(jid));
                if (isBlocked) canExecute = false;
            }
        }
    }

    if (!canExecute) return;

    const [command, ...args] = text.trim().split(" ");
    const cmd = command.toLowerCase().slice(prefix.length); // remove prefix

    try {
        switch (cmd) {
            case "ping": {
                if (!config.enablePing) return;
                await sock.sendMessage(remoteJid, { text: "Pong! 🏓" }, { quoted: msg });
                break;
            }

            case "id": {
                await sock.sendMessage(remoteJid, {
                    text: `*Chat ID:* \`${remoteJid}\``
                }, { quoted: msg });
                break;
            }

            case "uptime": {
                if (!config.enableUptime) return;

                const start = startTimes.get(sessionId) || Date.now();
                const uptimeMs = Date.now() - start;
                const hours = Math.floor(uptimeMs / 3600000);
                const minutes = Math.floor((uptimeMs % 3600000) / 60000);
                const seconds = Math.floor((uptimeMs % 60000) / 1000);

                await sock.sendMessage(remoteJid, {
                    text: `*Session Uptime:* ${hours}h ${minutes}m ${seconds}s`
                }, { quoted: msg });
                break;
            }

            case "menu":
            case "help": {
                const botName = (config as any).botName || "WA-AKG Bot";
                const menu = `
🤖 *${botName} Menu* 🤖

📌 *Commands:*
• *${prefix}ping*: Check Bot Status
• *${prefix}uptime*: Check Session Uptime
• *${prefix}id*: Get Chat ID

_Made with ❤️_
`;
                await sock.sendMessage(remoteJid, { text: menu }, { quoted: msg });
                break;
            }

            default:
                // Ignore unknown commands
                break;
        }
    } catch (e) {
        logger.error("Bot", "Bot command error", e);
    }
}
