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
        const statusFilter = searchParams.get("status")?.trim() || "";

        // Get accessible sessions for the user
        const sessions = await getAccessibleSessions(user.id, user.role);
        const sessionDbIds = sessions.map(s => s.id);

        // Find webhooks owned by user or belonging to accessible sessions
        const webhooks = await prisma.webhook.findMany({
            where: {
                OR: [
                    { userId: user.id },
                    { sessionId: { in: sessionDbIds } }
                ]
            },
            select: { id: true, name: true, url: true, sessionId: true, session: { select: { name: true, sessionId: true } } }
        });

        const webhookIds = webhooks.map(w => w.id);
        const webhookMap = new Map(webhooks.map(w => [w.id, w]));

        if (webhookIds.length === 0) {
            return NextResponse.json({
                status: true,
                data: {
                    stats: { totalPayloads: 0, sentHooks: 0, failedHooks: 0 },
                    logs: [],
                    pagination: { page, limit, total: 0, totalPages: 0 }
                }
            });
        }

        // Base where condition
        const baseWhere: any = {
            webhookId: { in: webhookIds }
        };

        if (statusFilter && statusFilter !== "ALL") {
            baseWhere.status = statusFilter;
        }

        if (search) {
            baseWhere.OR = [
                { requestUrl: { contains: search } },
                { event: { contains: search } }
            ];
        }

        // Compute metrics
        const [totalPayloads, sentHooks, failedHooks, totalLogs, rawLogs] = await Promise.all([
            prisma.webhookLog.count({ where: { webhookId: { in: webhookIds } } }),
            prisma.webhookLog.count({ where: { webhookId: { in: webhookIds }, status: "SUCCESS" } }),
            prisma.webhookLog.count({ where: { webhookId: { in: webhookIds }, status: { in: ["FAILED", "ERROR"] } } }),
            prisma.webhookLog.count({ where: baseWhere }),
            prisma.webhookLog.findMany({
                where: baseWhere,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit
            })
        ]);

        const logs = rawLogs.map(log => {
            const wh = webhookMap.get(log.webhookId);
            const deviceName = wh?.session?.name || wh?.name || "WhatsApp Device";
            return {
                id: log.id,
                device: deviceName,
                hookUrl: log.requestUrl || wh?.url || "-",
                payload: log.requestBody || {},
                status: log.status === "SUCCESS" ? "SENT" : "FAILED",
                httpStatus: log.responseStatusCode || (log.status === "SUCCESS" ? 200 : 500),
                requestedAt: log.createdAt.toISOString()
            };
        });

        return NextResponse.json({
            status: true,
            data: {
                stats: {
                    totalPayloads,
                    sentHooks,
                    failedHooks
                },
                logs,
                pagination: {
                    page,
                    limit,
                    total: totalLogs,
                    totalPages: Math.ceil(totalLogs / limit)
                }
            }
        });
    } catch (error: any) {
        console.error("Error fetching webhook log reports:", error);
        return NextResponse.json({ status: false, message: error?.message || "Failed to fetch webhook logs" }, { status: 500 });
    }
}
