import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { resolveSpintax } from "@/lib/spintax";

export interface AntiSpamConfig {
    antiSpamEnabled: boolean;
    spamLimit: number;
    spamInterval: number;
    spamDelayMin: number;
    spamDelayMax: number;
    humanTyping: boolean;
    dailyLimit: number;
    warmupMode: boolean;
    warmupStage: number;
    spintaxEnabled: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
}

export interface SafetyMetrics {
    dailyCount: number;
    dailyLimit: number;
    inQuietHours: boolean;
    warmupMode: boolean;
    warmupStage: number;
    humanTyping: boolean;
    spintaxEnabled: boolean;
    antiSpamEnabled: boolean;
    queueLength: number;
}

interface QueueItem {
    id: number;
    sessionId: string;
    jid: string;
    messageType: string;
    queuedAt: number;
    resolve: () => void;
    reject: (err: any) => void;
}

class AntiSpamManager {
    private static instance: AntiSpamManager;
    private sessionHistory: Map<string, number[]> = new Map();
    private dailyCounts: Map<string, { count: number; dateStr: string }> = new Map();
    private configCache: Map<string, { config: AntiSpamConfig | null; cachedAt: number }> = new Map();
    private processing: Map<string, boolean> = new Map();
    private queues: Map<string, QueueItem[]> = new Map();
    private messageCounter = 0;

    private constructor() { }

    static getInstance() {
        if (!AntiSpamManager.instance) {
            AntiSpamManager.instance = new AntiSpamManager();
        }
        return AntiSpamManager.instance;
    }

    /**
     * Enqueue a message and wait for it to be processed.
     * Returns only when it's this message's turn to send.
     */
    async enqueue(sessionId: string, jid: string, content: any): Promise<void> {
        const config = await this.getAntiSpamConfig(sessionId);

        // Apply Spintax transformation if enabled
        if (config?.spintaxEnabled && content) {
            if (typeof content.text === "string") {
                content.text = resolveSpintax(content.text);
            }
            if (typeof content.caption === "string") {
                content.caption = resolveSpintax(content.caption);
            }
        }

        if (!config || !config.antiSpamEnabled) {
            this.recordSend(sessionId);
            return; // Anti-spam disabled, send immediately
        }

        // Daily Safety Quota check
        const effectiveLimit = config.warmupMode
            ? this.getWarmupLimit(config.warmupStage)
            : (config.dailyLimit || 0);

        if (effectiveLimit > 0 && this.getDailyCount(sessionId) >= effectiveLimit) {
            const current = this.getDailyCount(sessionId);
            logger.warn("Anti-Spam", `🛑 DAILY LIMIT REACHED | Session: ${sessionId} | ${current}/${effectiveLimit}`);
            throw new Error(`Daily safety limit reached (${current}/${effectiveLimit}). Outbound messages paused to protect your account.`);
        }

        const messageType = this.detectMessageType(content);
        const msgId = ++this.messageCounter;

        return new Promise<void>((resolve, reject) => {
            const item: QueueItem = {
                id: msgId,
                sessionId,
                jid,
                messageType,
                queuedAt: Date.now(),
                resolve,
                reject,
            };

            if (!this.queues.has(sessionId)) {
                this.queues.set(sessionId, []);
            }
            this.queues.get(sessionId)!.push(item);

            const queue = this.queues.get(sessionId)!;
            const position = queue.length;

            logger.debug("Anti-Spam",
                `📥 QUEUED  | Session: ${sessionId} | #${msgId} | To: ${this.formatJid(jid)} | Type: ${messageType} | Queue pos: ${position}`
            );

            // Start processing if not already running
            this.processQueue(sessionId);
        });
    }

    private async processQueue(sessionId: string) {
        if (this.processing.get(sessionId)) return;
        this.processing.set(sessionId, true);

        const config = await this.getAntiSpamConfig(sessionId);
        if (!config) {
            this.processing.set(sessionId, false);
            return;
        }

        while (true) {
            const queue = this.queues.get(sessionId);
            if (!queue || queue.length === 0) break;

            const item = queue[0];
            const now = Date.now();

            // Quiet Hours check
            if (this.isWithinQuietHours(config)) {
                logger.warn("Anti-Spam", `🌙 QUIET HOURS ACTIVE | Session: ${sessionId} | Sleeping 30s before retry`);
                await this.sleep(30000);
                continue;
            }

            // Warmup Stage adaptive delays
            let minDelay = config.spamDelayMin;
            let maxDelay = config.spamDelayMax;
            let effectiveThreshold = config.spamLimit;

            if (config.warmupMode) {
                const warmupSettings = this.getWarmupSettings(config.warmupStage);
                minDelay = Math.max(minDelay, warmupSettings.minDelay);
                maxDelay = Math.max(maxDelay, warmupSettings.maxDelay);
                effectiveThreshold = Math.min(effectiveThreshold, warmupSettings.burstThreshold);
            }

            const history = this.sessionHistory.get(sessionId) || [];
            const windowStart = now - (config.spamInterval * 1000);
            const recentMessages = history.filter(ts => ts > windowStart);
            this.sessionHistory.set(sessionId, recentMessages);

            if (recentMessages.length >= effectiveThreshold) {
                // Rate limit reached — apply dynamic jitter delay
                const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                const sendAt = new Date(now + delay);
                const waitingSince = now - item.queuedAt;

                logger.warn("Anti-Spam",
                    `⏳ JITTER DELAY | Session: ${sessionId} | #${item.id} | Rate: ${recentMessages.length}/${effectiveThreshold} in ${config.spamInterval}s | Delay: ${delay}ms | Send at: ${sendAt.toLocaleTimeString()} | Queue: ${queue.length} left`
                );

                await this.sleep(delay);

                // Re-fetch config
                const freshConfig = await this.getAntiSpamConfig(sessionId);
                if (!freshConfig || !freshConfig.antiSpamEnabled) {
                    logger.warn("Anti-Spam", `⚡ DISABLED | Session: ${sessionId} | Flushing ${queue.length} messages`);
                    while (queue.length > 0) {
                        const q = queue.shift()!;
                        this.recordSend(sessionId);
                        q.resolve();
                    }
                    break;
                }
                continue;
            }

            // Rate is safe — dispatch message
            queue.shift();
            this.recordSend(sessionId);

            const totalWait = now - item.queuedAt;
            const remainingInQueue = queue.length;

            if (totalWait > 50) {
                logger.success("Anti-Spam",
                    `✅ SENDING | Session: ${sessionId} | #${item.id} | To: ${this.formatJid(item.jid)} | Waited: ${totalWait}ms | Queue: ${remainingInQueue} left`
                );
            } else {
                logger.success("Anti-Spam",
                    `✅ INSTANT | Session: ${sessionId} | #${item.id} | To: ${this.formatJid(item.jid)} | Rate: ${recentMessages.length + 1}/${effectiveThreshold}`
                );
            }

            item.resolve();
        }

        this.processing.set(sessionId, false);
    }

    private recordSend(sessionId: string) {
        // Record burst history (last 60s)
        const history = this.sessionHistory.get(sessionId) || [];
        history.push(Date.now());
        this.sessionHistory.set(sessionId, history.filter(ts => ts > Date.now() - 60000));

        // Increment 24h daily count
        this.incrementDailyCount(sessionId);
    }

    public getDailyCount(sessionId: string): number {
        const today = new Date().toISOString().slice(0, 10);
        const entry = this.dailyCounts.get(sessionId);
        if (!entry || entry.dateStr !== today) {
            this.dailyCounts.set(sessionId, { count: 0, dateStr: today });
            return 0;
        }
        return entry.count;
    }

    private incrementDailyCount(sessionId: string) {
        const today = new Date().toISOString().slice(0, 10);
        const entry = this.dailyCounts.get(sessionId);
        if (!entry || entry.dateStr !== today) {
            this.dailyCounts.set(sessionId, { count: 1, dateStr: today });
        } else {
            entry.count++;
        }
    }

    public isWithinQuietHours(config: AntiSpamConfig): boolean {
        if (!config.quietHoursEnabled) return false;
        try {
            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();

            const [startH, startM] = (config.quietHoursStart || "22:00").split(":").map(Number);
            const [endH, endM] = (config.quietHoursEnd || "08:00").split(":").map(Number);

            const startTotal = (startH || 22) * 60 + (startM || 0);
            const endTotal = (endH || 8) * 60 + (endM || 0);

            if (startTotal <= endTotal) {
                return currentMins >= startTotal && currentMins < endTotal;
            } else {
                return currentMins >= startTotal || currentMins < endTotal;
            }
        } catch {
            return false;
        }
    }

    private getWarmupLimit(stage: number): number {
        switch (stage) {
            case 1: return 20;   // Stage 1 (Days 1-3)
            case 2: return 50;   // Stage 2 (Days 4-7)
            case 3: return 150;  // Stage 3 (Days 8-14)
            case 4: return 500;  // Stage 4 (Day 15+)
            default: return 500;
        }
    }

    private getWarmupSettings(stage: number): { minDelay: number; maxDelay: number; burstThreshold: number } {
        switch (stage) {
            case 1: return { minDelay: 12000, maxDelay: 25000, burstThreshold: 2 };
            case 2: return { minDelay: 8000, maxDelay: 15000, burstThreshold: 3 };
            case 3: return { minDelay: 5000, maxDelay: 10000, burstThreshold: 4 };
            case 4: default: return { minDelay: 2000, maxDelay: 5000, burstThreshold: 5 };
        }
    }

    private detectMessageType(content: any): string {
        if (!content) return "unknown";
        if (content.text) return "text";
        if (content.image) return "image";
        if (content.video) return "video";
        if (content.audio) return "audio";
        if (content.document) return "document";
        if (content.sticker) return "sticker";
        if (content.react) return "reaction";
        if (content.delete) return "delete";
        if (content.poll) return "poll";
        if (content.location) return "location";
        if (content.contact) return "contact";
        return "other";
    }

    private formatJid(jid: string): string {
        if (jid.endsWith("@s.whatsapp.net")) return jid.replace("@s.whatsapp.net", "");
        if (jid.endsWith("@g.us")) return `group:${jid.replace("@g.us", "").slice(-6)}`;
        return jid.slice(0, 15);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fetch anti-spam and safety config with 10-second cache
     */
    async getAntiSpamConfig(sessionId: string): Promise<AntiSpamConfig | null> {
        const cached = this.configCache.get(sessionId);
        if (cached && (Date.now() - cached.cachedAt) < 10000) {
            return cached.config;
        }

        try {
            // @ts-ignore
            const session = await (prisma as any).session.findUnique({
                where: { sessionId },
                select: {
                    botConfig: {
                        select: {
                            antiSpamEnabled: true,
                            spamLimit: true,
                            spamInterval: true,
                            spamDelayMin: true,
                            spamDelayMax: true,
                            humanTyping: true,
                            dailyLimit: true,
                            warmupMode: true,
                            warmupStage: true,
                            spintaxEnabled: true,
                            quietHoursEnabled: true,
                            quietHoursStart: true,
                            quietHoursEnd: true,
                        }
                    }
                }
            });

            if (!session || !(session as any).botConfig) {
                this.configCache.set(sessionId, { config: null, cachedAt: Date.now() });
                return null;
            }

            const row = (session as any).botConfig;
            const config: AntiSpamConfig = {
                antiSpamEnabled: Boolean(row.antiSpamEnabled),
                spamLimit: Number(row.spamLimit) || 5,
                spamInterval: Number(row.spamInterval) || 10,
                spamDelayMin: Number(row.spamDelayMin) || 1000,
                spamDelayMax: Number(row.spamDelayMax) || 3000,
                humanTyping: row.humanTyping ?? true,
                dailyLimit: Number(row.dailyLimit) || 500,
                warmupMode: Boolean(row.warmupMode),
                warmupStage: Number(row.warmupStage) || 1,
                spintaxEnabled: row.spintaxEnabled ?? true,
                quietHoursEnabled: Boolean(row.quietHoursEnabled),
                quietHoursStart: row.quietHoursStart || "22:00",
                quietHoursEnd: row.quietHoursEnd || "08:00",
            };

            this.configCache.set(sessionId, { config, cachedAt: Date.now() });
            return config;
        } catch (error) {
            logger.error("Anti-Spam", `❌ ERROR   | Config fetch failed for ${sessionId}:`, error);
            this.configCache.set(sessionId, { config: null, cachedAt: Date.now() });
            return null;
        }
    }

    /** Expose real-time safety metrics for session */
    async getSafetyMetrics(sessionId: string): Promise<SafetyMetrics> {
        const config = await this.getAntiSpamConfig(sessionId);
        const dailyCount = this.getDailyCount(sessionId);
        const inQuietHours = config ? this.isWithinQuietHours(config) : false;
        const effectiveLimit = config?.warmupMode
            ? this.getWarmupLimit(config.warmupStage)
            : (config?.dailyLimit || 500);

        return {
            dailyCount,
            dailyLimit: effectiveLimit,
            inQuietHours,
            warmupMode: config?.warmupMode || false,
            warmupStage: config?.warmupStage || 1,
            humanTyping: config?.humanTyping ?? true,
            spintaxEnabled: config?.spintaxEnabled ?? true,
            antiSpamEnabled: config?.antiSpamEnabled || false,
            queueLength: this.queues.get(sessionId)?.length || 0
        };
    }

    /** Clear cache for a session (call when config is updated) */
    clearCache(sessionId: string) {
        this.configCache.delete(sessionId);
    }

    invalidateConfig(sessionId: string) {
        this.clearCache(sessionId);
    }
}

export const antispam = AntiSpamManager.getInstance();
