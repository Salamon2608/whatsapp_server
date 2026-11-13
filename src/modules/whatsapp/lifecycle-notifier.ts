import type { WASocket } from "@whiskeysockets/baileys";
import { jidNormalizedUser } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";

const MAX_FREE_RUNTIME_MS = 8 * 60 * 60 * 1000; // 8 hours (InstaBox Free Tier limit)
const WARNING_7H_MS = 7 * 60 * 60 * 1000;       // 7 hours
const WARNING_7H45M_MS = 7.75 * 60 * 60 * 1000;  // 7 hours 45 minutes (15 min warning)
const ESTIMATED_COOLDOWN_MS = 2 * 60 * 60 * 1000; // ~2 hours

export class LifecycleNotifier {
    private static instance: LifecycleNotifier;
    private serverStartTime: number = Date.now();
    private activeSockets: Map<string, { socket: WASocket; sessionId: string; sessionName?: string }> = new Map();
    private onlineNotifiedSessions: Set<string> = new Set();
    private timer7h: NodeJS.Timeout | null = null;
    private timer7h45m: NodeJS.Timeout | null = null;
    private watchdogInterval: NodeJS.Timeout | null = null;
    private hasSent7hWarning: boolean = false;
    private hasSent15mWarning: boolean = false;
    private isShuttingDown: boolean = false;

    private constructor() {
        this.setupProcessHandlers();
        this.scheduleCooldownWarnings();
    }

    public static getInstance(): LifecycleNotifier {
        if (!LifecycleNotifier.instance) {
            LifecycleNotifier.instance = new LifecycleNotifier();
        }
        return LifecycleNotifier.instance;
    }

    private formatTimestamp(date: Date = new Date()): string {
        try {
            return date.toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "medium",
                timeStyle: "short",
                hour12: true
            }) + " IST";
        } catch {
            return date.toISOString().replace("T", " ").substring(0, 19) + " UTC";
        }
    }

    private getRecipients(sock: WASocket): string[] {
        const recipients: Set<string> = new Set();

        // 1. Send to the connected user's own WhatsApp chat ("Message yourself")
        if (sock.user?.id) {
            const selfJid = jidNormalizedUser(sock.user.id);
            if (selfJid) recipients.add(selfJid);
        }

        // 2. Optional additional admin phone from environment
        const envAdmin = process.env.ADMIN_PHONE || process.env.NOTIFICATION_PHONE;
        if (envAdmin) {
            const clean = envAdmin.replace(/[^0-9]/g, "");
            if (clean) recipients.add(`${clean}@s.whatsapp.net`);
        }

        return Array.from(recipients);
    }

    /**
     * Called whenever a session connects and syncs successfully.
     * Dispatches the "🟢 Server is LIVE" message to the user.
     */
    public async notifyServerOnline(sock: WASocket, sessionId: string, sessionName?: string) {
        this.activeSockets.set(sessionId, { socket: sock, sessionId, sessionName });

        // Prevent spamming on quick transient socket reconnects within the same process
        if (this.onlineNotifiedSessions.has(sessionId)) {
            return;
        }
        this.onlineNotifiedSessions.add(sessionId);

        // Small delay to ensure socket handshake & connection state are fully settled
        setTimeout(async () => {
            const recipients = this.getRecipients(sock);
            if (recipients.length === 0) return;

            const now = new Date();
            const timeStr = this.formatTimestamp(now);
            const expectedFreezeTime = this.formatTimestamp(new Date(this.serverStartTime + MAX_FREE_RUNTIME_MS));

            const msg = `🟢 *WhatsApp Server is LIVE* 🚀

• *Status:* Online & Active
• *Session:* ${sessionName || "Personal"} (\`${sessionId}\`)
• *Server Started At:* ${timeStr}
• *Server Will Freeze At:* ${expectedFreezeTime}
• *Active Window:* 8 Hours Max
• *Auto-Wake:* Cloudflare Sentinel Active ⚡

_💡 Tip: Send #uptime or #storage anytime to monitor server health._`;

            for (const jid of recipients) {
                try {
                    await sock.sendMessage(jid, { text: msg });
                    logger.info("LifecycleNotifier", `Sent Online alert to ${jid} for session ${sessionId}`);
                } catch (err: any) {
                    logger.warn("LifecycleNotifier", `Failed to send Online alert to ${jid}: ${err.message}`);
                }
            }

            // Also dispatch via CallMeBot and Telegram so user receives an incoming notification with sound/banner
            await this.sendViaCallMeBot(msg);
            await this.sendViaTelegram(msg);
        }, 3000);
    }

    public removeSession(sessionId: string) {
        this.activeSockets.delete(sessionId);
    }

    /**
     * Get uptime and countdown until InstaBox free tier cooldown.
     */
    public getCooldownInfo() {
        const uptimeMs = Date.now() - this.serverStartTime;
        const remainingMs = Math.max(0, MAX_FREE_RUNTIME_MS - uptimeMs);

        const formatDuration = (ms: number) => {
            const h = Math.floor(ms / 3600000);
            const m = Math.floor((ms % 3600000) / 60000);
            const s = Math.floor((ms % 60000) / 1000);
            return `${h}h ${m}m ${s}s`;
        };

        const percent = Math.min(100, Math.round((uptimeMs / MAX_FREE_RUNTIME_MS) * 100));

        return {
            uptimeMs,
            remainingMs,
            uptimeFormatted: formatDuration(uptimeMs),
            remainingFormatted: formatDuration(remainingMs),
            percent,
            startTimeFormatted: this.formatTimestamp(new Date(this.serverStartTime)),
            expectedSleepFormatted: this.formatTimestamp(new Date(this.serverStartTime + MAX_FREE_RUNTIME_MS))
        };
    }

    /**
     * Schedules automated proactive cooldown warnings at 7h (04:55 PM IST) and 7h45m (05:40 PM IST).
     * Uses both timers and a periodic watchdog to ensure 100% reliable delivery.
     */
    private scheduleCooldownWarnings() {
        const trigger7h = async () => {
            if (this.hasSent7hWarning) return;
            this.hasSent7hWarning = true;
            const expectedSleep = this.formatTimestamp(new Date(this.serverStartTime + MAX_FREE_RUNTIME_MS));
            await this.broadcastWarning(
                `⏳ *Server Runtime Notice (7 Hours Active)*

The WhatsApp server has been running continuously for *7 hours*.
• *InstaBox Free Tier Cap:* 8 Hours
• *Remaining Active Time:* ~60 minutes
• *Sleep Starts Around:* ${expectedSleep}
• *Action:* Server will enter cooldown soon.

_All your database and session data are 100% safe._`
            );
        };

        const trigger15m = async () => {
            if (this.hasSent15mWarning) return;
            this.hasSent15mWarning = true;
            const expectedWake = this.formatTimestamp(new Date(Date.now() + 15 * 60 * 1000 + ESTIMATED_COOLDOWN_MS));
            await this.broadcastWarning(
                `⚠️ *Server Going to Sleep Soon (15 Min Warning)*

• *Current Continuous Runtime:* 7 hours 45 minutes
• *Sleep Scheduled In:* ~15 minutes
• *Estimated Cooldown:* ~1.5 to 2 hours
• *Expected Auto-Wake Time:* Around ${expectedWake}

_Your Cloudflare Worker will automatically wake the server up once the cooldown ends!_`
            );
        };

        // Scheduled Timers
        this.timer7h = setTimeout(trigger7h, WARNING_7H_MS);
        this.timer7h45m = setTimeout(trigger15m, WARNING_7H45M_MS);

        // Periodic Watchdog (checks every 30 seconds as a fail-safe)
        this.watchdogInterval = setInterval(() => {
            const uptime = Date.now() - this.serverStartTime;
            if (uptime >= WARNING_7H_MS && !this.hasSent7hWarning && this.activeSockets.size > 0) {
                trigger7h();
            }
            if (uptime >= WARNING_7H45M_MS && !this.hasSent15mWarning && this.activeSockets.size > 0) {
                trigger15m();
            }
        }, 30 * 1000);
    }

    private async broadcastWarning(text: string) {
        for (const [sessionId, item] of this.activeSockets) {
            const recipients = this.getRecipients(item.socket);
            for (const jid of recipients) {
                try {
                    await item.socket.sendMessage(jid, { text });
                    logger.info("LifecycleNotifier", `Sent warning to ${jid} (${sessionId})`);
                } catch (e: any) {
                    logger.warn("LifecycleNotifier", `Warning send failed: ${e.message}`);
                }
            }
        }
        await this.sendViaCallMeBot(text);
        await this.sendViaTelegram(text);
    }

    private getTelegramConfig() {
        let botToken = process.env.TELEGRAM_BOT_TOKEN;
        let chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const fs = require("fs");
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const path = require("path");
                const envPath = path.resolve(process.cwd(), ".env");
                if (fs.existsSync(envPath)) {
                    const content = fs.readFileSync(envPath, "utf8");
                    for (const line of content.split("\n")) {
                        const trimmed = line.trim();
                        if (trimmed.startsWith("TELEGRAM_BOT_TOKEN=")) {
                            botToken = botToken || trimmed.substring("TELEGRAM_BOT_TOKEN=".length).replace(/["']/g, "").trim();
                        }
                        if (trimmed.startsWith("TELEGRAM_CHAT_ID=")) {
                            chatId = chatId || trimmed.substring("TELEGRAM_CHAT_ID=".length).replace(/["']/g, "").trim();
                        }
                    }
                }
            } catch {}
        }

        return { botToken, chatId };
    }

    /**
     * Sends message via Telegram Bot so user's phone rings with an instant push notification banner.
     */
    public async sendViaTelegram(text: string) {
        const { botToken, chatId } = this.getTelegramConfig();
        if (!botToken || !chatId) return;

        try {
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: "Markdown"
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            logger.info("LifecycleNotifier", `Telegram push alert dispatched (status: ${res.status})`);
        } catch (e: any) {
            logger.warn("LifecycleNotifier", `Telegram dispatch failed: ${e.message}`);
        }
    }

    /**
     * Sends message via CallMeBot external WhatsApp gateway so the user receives
     * a real incoming notification with ring and banner from an outside phone number.
     */
    private async sendViaCallMeBot(text: string) {
        const phone = process.env.CALLMEBOT_PHONE || "918098502859";
        const apiKey = process.env.CALLMEBOT_API_KEY;
        if (!apiKey) return;

        try {
            const cleanPhone = phone.replace(/[^0-9]/g, "");
            const encodedText = encodeURIComponent(text);
            const url = `https://api.callmebot.com/whatsapp.php?phone=+${cleanPhone}&text=${encodedText}&apikey=${apiKey}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            logger.info("LifecycleNotifier", `CallMeBot external WhatsApp alert dispatched (status: ${res.status})`);
        } catch (e: any) {
            logger.warn("LifecycleNotifier", `CallMeBot dispatch attempt: ${e.message}`);
        }
    }

    /**
     * Hooks SIGTERM and SIGINT to send a final "Going to sleep" message before shutdown.
     */
    private setupProcessHandlers() {
        const handleShutdown = async (signal: string) => {
            if (this.isShuttingDown) return;
            this.isShuttingDown = true;
            logger.info("LifecycleNotifier", `Received ${signal}. Sending sleep notification...`);

            const expectedWake = this.formatTimestamp(new Date(Date.now() + ESTIMATED_COOLDOWN_MS));
            const sleepMsg = `💤 *Server Going to Sleep / Stopping Now*

• *Signal:* ${signal}
• *Time:* ${this.formatTimestamp(new Date())}
• *Expected Return:* ~${expectedWake}
• *Data Safety:* All credentials, sessions & database data are securely preserved.

_Cloudflare Worker will automatically wake the server back up._`;

            const sendPromises: Promise<any>[] = [
                this.sendViaCallMeBot(sleepMsg),
                this.sendViaTelegram(sleepMsg)
            ];
            for (const [, item] of this.activeSockets) {
                const recipients = this.getRecipients(item.socket);
                for (const jid of recipients) {
                    try {
                        sendPromises.push(item.socket.sendMessage(jid, { text: sleepMsg }));
                    } catch {}
                }
            }

            try {
                // Wait up to 2 seconds for dispatch before process terminates
                await Promise.race([
                    Promise.allSettled(sendPromises),
                    new Promise(resolve => setTimeout(resolve, 2000))
                ]);
            } catch {}

            process.exit(0);
        };

        process.once("SIGTERM", () => handleShutdown("SIGTERM"));
        process.once("SIGINT", () => handleShutdown("SIGINT"));
    }
}

export const lifecycleNotifier = LifecycleNotifier.getInstance();

