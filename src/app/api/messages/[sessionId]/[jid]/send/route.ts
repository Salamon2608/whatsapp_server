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
        const rawMessage = body.message ?? body.text ?? body.caption;
        const mediaUrl = body.mediaUrl ?? body.imageUrl ?? (typeof body.image === "string" ? body.image : body.image?.url);
        const videoUrl = body.videoUrl ?? (typeof body.video === "string" ? body.video : body.video?.url);
        const { mentions, quotedMessageId } = body;

        if (!rawMessage && !mediaUrl && !videoUrl) {
            return NextResponse.json({ status: false, message: "message, text, mediaUrl, or image is required", error: "message or media is required" }, { status: 400 });
        }

        let messagePayload: any;
        if (mediaUrl) {
            messagePayload = {
                image: { url: mediaUrl },
                caption: typeof rawMessage === "string" ? rawMessage : ""
            };
        } else if (videoUrl) {
            messagePayload = {
                video: { url: videoUrl },
                caption: typeof rawMessage === "string" ? rawMessage : ""
            };
        } else if (typeof rawMessage === "string") {
            messagePayload = { text: rawMessage };
        } else {
            messagePayload = rawMessage;
        }

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
        const isNotReady = errorMsg.includes("not authenticated") ||
                           errorMsg.includes("not connected") ||
                           errorMsg.includes("disconnected") ||
                           errorMsg.includes("still initializing");
        return NextResponse.json(
            { status: false, message: errorMsg, error: errorMsg },
            { status: isNotReady ? 503 : 500 }
        );
    }
}
