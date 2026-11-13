import os from "os";
import si from "systeminformation";
import { prisma } from "@/lib/prisma";
import type { WASocket, WAMessage } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";
import { lifecycleNotifier } from "../lifecycle-notifier";

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
    enableStorage: true,
    enablePerformance: true,
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
        select: { id: true, config: true }
    });

    if (!session) return;

    const isGroup = remoteJid.endsWith("@g.us");
    const sessionConfig = (session.config && typeof session.config === 'object') ? (session.config as any) : {};
    const ignoreGroups = sessionConfig.ignoreGroups !== false;

    if (isGroup && ignoreGroups) return;

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

    const enableStorage = ((config as any).enableStorage ?? sessionConfig?.enableStorage) !== false;
    const enablePerformance = ((config as any).enablePerformance ?? sessionConfig?.enablePerformance) !== false;

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

            case "uptime":
            case "cooldown":
            case "runtime": {
                if (!config.enableUptime) return;

                const info = lifecycleNotifier.getCooldownInfo();
                const progressFilled = Math.min(10, Math.max(0, Math.round(info.percent / 10)));
                const progressBar = "█".repeat(progressFilled) + "░".repeat(10 - progressFilled);
                const healthEmoji = info.percent < 75 ? "🟢 Active & Healthy" : info.percent < 90 ? "🟡 Approaching Cooldown" : "🔴 Sleep Soon";

                const uptimeText = `⏱️ *Server Uptime & Cooldown Status*

• *Continuous Runtime:* ${info.uptimeFormatted}
• *Max Free Window:* 8h 00m 00s
• *Remaining Active:* ${info.remainingFormatted}
• *Window Usage:* [${progressBar}] ${info.percent}%
• *Current Phase:* ${healthEmoji}

• *Started At:* ${info.startTimeFormatted}
• *Expected Sleep:* ~${info.expectedSleepFormatted}
• *Auto-Wake:* ⚡ Cloudflare Worker Active

_WA-AKG Bot • Prefix: ${prefix}_`;

                await sock.sendMessage(remoteJid, { text: uptimeText }, { quoted: msg });
                break;
            }

            case "storage":
            case "disk":
            case "space": {
                if (!enableStorage) return;

                const fsSize = await si.fsSize().catch(() => []);
                const rootDisk = fsSize.find(d => d.mount === "/") || fsSize[0];

                let totalGb = "0";
                let usedGb = "0";
                let availGb = "0";
                let usePercent = 0;

                if (rootDisk && rootDisk.size > 0) {
                    totalGb = (rootDisk.size / (1024 ** 3)).toFixed(1);
                    usedGb = (rootDisk.used / (1024 ** 3)).toFixed(1);
                    availGb = ((rootDisk.size - rootDisk.used) / (1024 ** 3)).toFixed(1);
                    usePercent = Math.round(rootDisk.use || ((rootDisk.used / rootDisk.size) * 100));
                }

                const statusEmoji = usePercent < 70 ? "🟢 Optimal" : usePercent < 85 ? "🟡 Moderate" : "🔴 Low Storage";
                const filledBlocks = Math.min(10, Math.max(0, Math.round(usePercent / 10)));
                const progressBar = "█".repeat(filledBlocks) + "░".repeat(10 - filledBlocks);

                const replyText = `💾 *Server Storage Status*

📁 *Root Filesystem:* \`${rootDisk?.fs || "overlay"}\`
• *Total Disk:* ${totalGb} GB
• *Used Space:* ${usedGb} GB (${usePercent}%)
• *Available:* ${availGb} GB (${100 - usePercent}%)

📊 *Usage:* [${progressBar}] ${usePercent}%
🚦 *Health:* ${statusEmoji}

_WA-AKG Bot • Prefix: ${prefix}_`;

                await sock.sendMessage(remoteJid, { text: replyText }, { quoted: msg });
                break;
            }

            case "performance":
            case "perf":
            case "ram":
            case "sys":
            case "system":
            case "status": {
                if (!enablePerformance) return;

                const [mem, currentLoad] = await Promise.all([
                    si.mem().catch(() => null),
                    si.currentLoad().catch(() => null)
                ]);

                const cpus = os.cpus();
                const cpuCount = cpus.length;
                const cpuModel = cpus[0]?.model || "vCPU";
                const loadAvg = os.loadavg().map(l => l.toFixed(2)).join(", ");

                const totalMemGb = mem ? (mem.total / (1024 ** 3)).toFixed(1) : (os.totalmem() / (1024 ** 3)).toFixed(1);
                const availMemGb = mem ? (mem.available / (1024 ** 3)).toFixed(1) : (os.freemem() / (1024 ** 3)).toFixed(1);
                const usedMemGb = (parseFloat(totalMemGb) - parseFloat(availMemGb)).toFixed(1);
                const memPercent = Math.round((parseFloat(usedMemGb) / parseFloat(totalMemGb)) * 100);

                const procMem = process.memoryUsage();
                const nodeRssMb = Math.round(procMem.rss / (1024 * 1024));
                const nodeHeapMb = Math.round(procMem.heapUsed / (1024 * 1024));

                const start = startTimes.get(sessionId) || Date.now();
                const uptimeMs = Date.now() - start;
                const hours = Math.floor(uptimeMs / 3600000);
                const minutes = Math.floor((uptimeMs % 3600000) / 60000);
                const seconds = Math.floor((uptimeMs % 60000) / 1000);

                const cpuUsage = currentLoad ? `${Math.round(currentLoad.currentLoad)}%` : "Normal";
                const ramStatus = memPercent < 75 ? "🟢 Normal" : memPercent < 90 ? "🟡 High" : "🔴 Critical";

                const filledMemBlocks = Math.min(10, Math.max(0, Math.round(memPercent / 10)));
                const memBar = "█".repeat(filledMemBlocks) + "░".repeat(10 - filledMemBlocks);

                const replyText = `⚡ *Server Performance & Health*

🖥️ *CPU & Load:*
• *Cores:* ${cpuCount} vCPU (${cpuModel})
• *Current Load:* ${cpuUsage}
• *Load Avg:* ${loadAvg} (1m, 5m, 15m)

🧠 *RAM Memory:*
• *Total:* ${totalMemGb} GB
• *Used:* ${usedMemGb} GB (${memPercent}%)
• *Available:* ${availMemGb} GB (${100 - memPercent}%)
• *Memory Bar:* [${memBar}]
• *Status:* ${ramStatus}

⚙️ *Runtime & Uptime:*
• *Node App Memory:* ${nodeRssMb} MB (Heap: ${nodeHeapMb} MB)
• *Session Uptime:* ${hours}h ${minutes}m ${seconds}s

_WA-AKG Bot • Prefix: ${prefix}_`;

                await sock.sendMessage(remoteJid, { text: replyText }, { quoted: msg });
                break;
            }

            case "menu":
            case "help": {
                const botName = (config as any).botName || "WA-AKG Bot";
                const menu = `
🤖 *${botName} Menu* 🤖

📌 *General Commands:*
• *${prefix}ping*: Check Bot Responsiveness
• *${prefix}uptime* / *${prefix}cooldown*: Check Uptime & Sleep Countdown
• *${prefix}id*: Get Chat ID

⚙️ *System & Diagnostics:*
• *${prefix}storage*: Check Server Disk & Free Space
• *${prefix}performance*: Check CPU, RAM & Server Health

_WA-AKG Automated Assistant_
`;
                await sock.sendMessage(remoteJid, { text: menu.trim() }, { quoted: msg });
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
