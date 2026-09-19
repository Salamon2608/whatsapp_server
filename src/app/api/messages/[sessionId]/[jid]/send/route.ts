import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { ChatService } from "@/modules/whatsapp/chat.service";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string, jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, jid: rawJid } = await params;
        let jid = decodeURIComponent(rawJid);
        
        // Normalize JID if raw number is passed (e.g. 62812345 or +62812345)
        if (!jid.includes("@")) {
            const clean = jid.replace(/\D/g, "");
            jid = `${clean}@s.whatsapp.net`;
        } else if (jid.endsWith("@c.us")) {
            jid = jid.replace("@c.us", "@s.whatsapp.net");
        }

        const body = await request.json();
        const rawMessage = body.message ?? body.text;
        const { mentions, quotedMessageId } = body;

        if (!rawMessage) {
            return NextResponse.json({ status: false, message: "message or text is required", error: "message or text is required" }, { status: 400 });
        }

        const messagePayload = typeof rawMessage === "string" ? { text: rawMessage } : rawMessage;

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        // Send Message using ChatService
        const result = await ChatService.sendTextMessage(sessionId, jid, messagePayload, mentions, quotedMessageId);

        return NextResponse.json({ status: true, message: "Message sent successfully", data: result });
    } catch (error: any) {
        console.error("Send message error:", error);
        const errorMsg = error?.message || "Failed to send message";
        return NextResponse.json({ status: false, message: errorMsg, error: errorMsg }, { status: 500 });
    }
}
