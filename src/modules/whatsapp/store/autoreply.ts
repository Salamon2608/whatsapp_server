import { prisma } from "@/lib/prisma";
import type { WASocket } from "@whiskeysockets/baileys";
import { normalizeMessageContent } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";
import { dispatchInboundToFlows } from "@/lib/flows/engine";
import { runAutomationsForTrigger } from "@/lib/automations/engine";
import { executeChatbotRule } from "@/lib/chatbot/rule-engine";
import { runAiAutoReply } from "@/lib/ai/auto-reply";
import { isCooldownActive, smartSendWithHumanBehavior } from "@/lib/anti-ban";

// Helper for permission check (Deduplicate from command-handler if possible, but keep simple here)
function canAutoReply(config: any, fromMe: boolean, senderJid: string): boolean {
    if (!config || !config.enabled) return false;

    // Auto Reply Specific Mode
    const mode = config.autoReplyMode || 'ALL';

    if (fromMe) {
        // If mode is OWNER, it triggers for ME? 
        // Auto Reply usually replies TO someone. 
        // If I send a message, and mode is OWNER, should it reply to me? 
        // User requested "Self Mode" -> Use case: Snippets.
        // So yes, if fromMe checks out.

        // However, standard auto-reply logic (replying to incoming) should be blocked if fromMe is true AND mode is ALL?
        // No, typically Auto Reply doesn't trigger on own messages to prevent unexpected loops.
        // But for "Self Mode" (Macros), it MUST trigger on own messages.

        if (mode === 'OWNER') return true;
        if (mode === 'ALL') return false; // Standard auto-reply ignores self

        // Specific? 
        return false;
    } else {
        // Incoming message from others
        if (mode === 'OWNER') return false; // Owner only acts on Owner messages
        if (mode === 'ALL') return true;

        if (mode === 'SPECIFIC') {
            const allowedJids = config.autoReplyAllowedJids || [];
            if (Array.isArray(allowedJids)) {
                return allowedJids.some((jid: string) => senderJid.includes(jid));
            }
        }

        if (mode === 'BLACKLIST') {
            const blockedJids = config.autoReplyBlockedJids || [];
            if (Array.isArray(blockedJids)) {
                const isBlocked = blockedJids.some((jid: string) => senderJid.includes(jid));
                return !isBlocked; // Return true if NOT blocked
            }
            return true; // If blacklist empty, allow all
        }
    }

    return false;
}

export async function bindAutoReply(sock: WASocket, sessionId: string) {
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        // Fetch session ID and Bot Config once per batch (optimization)
        const session = await prisma.session.findUnique({
            where: { sessionId },
            // @ts-ignore
            include: { botConfig: true }
        });

        if (!session) return;

        // @ts-ignore
        let config = (session as any).botConfig;

        if (!config) {
            logger.warn("AutoReply", "No config found, creating default...");
            config = await prisma.botConfig.create({
                data: {
                    sessionId: session.id,
                    enabled: true,
                    botMode: 'OWNER',
                    autoReplyMode: 'ALL'
                }
            });
        }

        logger.debug("AutoReply", `Processing for ${sessionId}. Config: ${config ? "Found" : "Missing"}, ${config?.enabled ? "Enabled" : "Disabled"}`);

        if (!config || !config.enabled) return;

        for (const msg of messages) {
            const fromMe = msg.key.fromMe || false;
            const remoteJid = msg.key.remoteJid;

            // Standardized Sender Logic
            const isGroup = remoteJid?.endsWith("@g.us") || false;
            const remoteJidAlt = msg.key.remoteJidAlt;
            let senderJid = (isGroup ? (msg.key.participant || msg.participant) : remoteJid);

            if (!isGroup && remoteJidAlt) {
                senderJid = remoteJidAlt;
            }

            if (!remoteJid || !senderJid) continue;

            // Check Permissions
            if (!canAutoReply(config, fromMe, senderJid)) continue;

            // Anti-Ban Protection: Enforce rapid loop cooldown per contact
            if (isCooldownActive(remoteJid)) {
                logger.debug("AutoReply", `Skipping ${remoteJid} - Anti-ban cooldown active`);
                continue;
            }

            const content = normalizeMessageContent(msg.message);
            const text = content?.conversation || content?.extendedTextMessage?.text || ""; 
            const buttonReplyId = (content as any)?.buttonsResponseMessage?.selectedButtonId || (content as any)?.templateButtonReplyMessage?.selectedId;
            const buttonReplyTitle = (content as any)?.buttonsResponseMessage?.selectedDisplayText;
            const listReplyId = (content as any)?.listResponseMessage?.singleSelectReply?.selectedRowId;
            const listReplyTitle = (content as any)?.listResponseMessage?.title;
            const interactiveReplyId = buttonReplyId || listReplyId;
            const interactiveReplyTitle = buttonReplyTitle || listReplyTitle;

            if (!text && !interactiveReplyId) continue;

            try {
                // 1. WhatsApp Flows State Machine Dispatch
                const flowResult = await dispatchInboundToFlows({
                    sock,
                    sessionId,
                    userId: session.userId,
                    remoteJid,
                    message: interactiveReplyId
                        ? { kind: 'interactive_reply', reply_id: interactiveReplyId, reply_title: interactiveReplyTitle || '' }
                        : { kind: 'text', text },
                    msg,
                });
                if (flowResult.consumed) continue;

                // 2. Automations Engine Dispatch (Keywords, Interactive, New Message)
                const autoTrigger = interactiveReplyId
                    ? 'interactive_reply'
                    : 'keyword_match';
                
                const autoHandled = await runAutomationsForTrigger({
                    sock,
                    sessionId,
                    userId: session.userId,
                    remoteJid,
                    triggerType: autoTrigger,
                    context: {
                        message_text: text,
                        interactive_reply_id: interactiveReplyId,
                    },
                    msg,
                });
                if (autoHandled) continue;

                // 3. Keyword Rule-Based Chatbot
                const chatbotHandled = await executeChatbotRule(
                    sock,
                    session.userId,
                    remoteJid,
                    text,
                    msg
                );
                if (chatbotHandled) continue;

                // 4. BYO-Key AI Agent Auto-Reply with Knowledge Context
                if (text) {
                    const aiHandled = await runAiAutoReply({
                        sock,
                        sessionId,
                        userId: session.userId,
                        remoteJid,
                        messageText: text,
                        msg,
                    });
                    if (aiHandled) continue;
                }

                // 5. Legacy AutoReply Rules
                const rules = await prisma.autoReply.findMany({
                    where: {
                        session: {
                            sessionId: sessionId
                        }
                    }
                });

                for (const rule of rules) {
                    let match = false;
                    const keyword = rule.keyword.toLowerCase();
                    const incoming = text.toLowerCase();

                    switch (rule.matchType) {
                        case 'EXACT':
                            match = incoming === keyword;
                            break;
                        case 'CONTAINS':
                            match = incoming.includes(keyword);
                            break;
                        case 'REGEX':
                            try {
                                const regex = new RegExp(rule.keyword, 'i');
                                match = regex.test(text); // Use original case for regex
                            } catch (e) {
                                logger.error("AutoReply", "Invalid regex in auto-reply", rule.keyword);
                            }
                            break;
                    }

                    if (match) {
                        // Check trigger context (GROUP, PRIVATE, or ALL)
                        const isGroup = remoteJid.endsWith('@g.us');
                        const triggerType = (rule as any).triggerType || 'ALL'; // Default to ALL if undefined

                        if (triggerType === 'GROUP' && !isGroup) continue;
                        if (triggerType === 'PRIVATE' && isGroup) continue;

                        logger.info("AutoReply", `Match: ${rule.keyword} -> ${remoteJid}`);

                        if (rule.isMedia && rule.mediaUrl) {
                            const url = rule.mediaUrl;
                            const type = (rule as any).mediaType || "document";
                            
                            let payload: any = {};
                            if (rule.response) {
                                payload.caption = rule.response;
                            }

                            if (type === "image") {
                                payload.image = { url };
                            } else if (type === "video") {
                                payload.video = { url };
                            } else if (type === "audio") {
                                payload = { audio: { url } };
                            } else {
                                payload.document = { url };
                                payload.mimetype = 'application/octet-stream';
                                payload.fileName = url.split('/').pop() || 'document';
                            }
                            
                            try {
                                await smartSendWithHumanBehavior(sock, remoteJid, payload, { quoted: msg });
                            } catch (err: any) {
                                logger.error("AutoReply", `Failed to send media auto-reply from URL: ${err.message}. Falling back to text if response exists.`);
                                if (rule.response) {
                                    await smartSendWithHumanBehavior(sock, remoteJid, { text: rule.response }, { quoted: msg });
                                }
                            }
                        } else if (rule.response) {
                            await smartSendWithHumanBehavior(sock, remoteJid, { text: rule.response }, { quoted: msg });
                        }

                        break;
                    }
                }

            } catch (e) {
                logger.error("AutoReply", "Error executing auto-reply", e);
            }
        }
    });
}
