"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AutoReplyRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/agents");
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs">Redirecting to WhatsApp Chatbot & AI Agents...</p>
        </div>
    );
}
