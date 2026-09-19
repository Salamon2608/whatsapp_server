import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, getAccessibleSessions } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
        const search = searchParams.get("search")?.trim() || "";
        const typeFilter = searchParams.get("type")?.trim() || "";

        // Get accessible sessions for the user
        const sessions = await getAccessibleSessions(user.id, user.role);
        const sessionDbIds = sessions.map(s => s.id);

        if (sessionDbIds.length === 0) {
            return NextResponse.json({
                status: true,
                data: {
                    stats: { totalMessages: 0, todaysMessages: 0, last30DaysMessages: 0 },
                    logs: [],
                    pagination: { page, limit, total: 0, totalPages: 0 }
                }
            });
        }

        const sessionMap = new Map(sessions.map(s => [s.id, s]));

        // Calculate time ranges for stats
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Base where condition
        const baseWhere: any = {
            sessionId: { in: sessionDbIds }
        };

        if (typeFilter && typeFilter !== "ALL") {
            baseWhere.type = typeFilter;
        }

        if (search) {
            baseWhere.OR = [
                { remoteJid: { contains: search } },
                { senderJid: { contains: search } },
                { content: { contains: search } }
            ];
        }

        // Stats calculation
        const [totalMessages, todaysMessages, last30DaysMessages, totalFiltered, rawMessages] = await Promise.all([
            prisma.message.count({ where: { sessionId: { in: sessionDbIds } } }),
            prisma.message.count({ where: { sessionId: { in: sessionDbIds }, timestamp: { gte: startOfToday } } }),
            prisma.message.count({ where: { sessionId: { in: sessionDbIds }, timestamp: { gte: thirtyDaysAgo } } }),
            prisma.message.count({ where: baseWhere }),
            prisma.message.findMany({
                where: baseWhere,
                orderBy: { timestamp: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    session: {
                        select: { name: true, sessionId: true }
                    }
                }
            })
        ]);

        const formatPhone = (jid: string | null | undefined): string => {
            if (!jid) return "-";
            return jid.split("@")[0].split(":")[0];
        };

        const formatType = (type: string): string => {
            switch (type) {
                case "TEXT": return "Plain Text";
                case "IMAGE": return "Image";
                case "VIDEO": return "Video";
                case "AUDIO": return "Audio / Voice";
                case "DOCUMENT": return "Document";
                case "STICKER": return "Sticker";
                case "LOCATION": return "Location";
                case "CONTACT": return "Contact Card";
                default: return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
            }
        };

        const logs = rawMessages.map(msg => {
            let requestType = "from_api";
            if (!msg.fromMe) {
                requestType = "incoming";
            } else if (msg.quoteId) {
                requestType = "auto_reply";
            } else {
                requestType = "from_api";
            }

            const senderPhone = msg.fromMe
                ? (msg.session?.name || formatPhone(msg.senderJid))
                : formatPhone(msg.senderJid || msg.remoteJid);

            const receiverPhone = msg.fromMe
                ? formatPhone(msg.remoteJid)
                : (msg.session?.name || "Me");

            return {
                id: msg.id,
                messageFrom: senderPhone,
                messageTo: receiverPhone,
                messageType: formatType(msg.type),
                requestType: requestType,
                content: msg.content || (msg.mediaUrl ? `[${msg.type}]` : "-"),
                status: msg.status,
                requestedAt: msg.timestamp.toISOString()
            };
        });

        return NextResponse.json({
            status: true,
            data: {
                stats: {
                    totalMessages,
                    todaysMessages,
                    last30DaysMessages
                },
                logs,
                pagination: {
                    page,
                    limit,
                    total: totalFiltered,
                    totalPages: Math.ceil(totalFiltered / limit)
                }
            }
        });
    } catch (error: any) {
        console.error("Error fetching message log reports:", error);
        return NextResponse.json({ status: false, message: error?.message || "Failed to fetch message logs" }, { status: 500 });
    }
}
