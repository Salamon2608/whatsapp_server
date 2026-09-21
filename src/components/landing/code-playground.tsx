"use client";

import React, { useState } from "react";
import { Check, Copy, Play, Terminal, ShieldCheck, Zap, Activity } from "lucide-react";

type TabKey = "curl" | "typescript" | "antiban" | "webhook";

const SNIPPETS: Record<TabKey, { title: string; filename: string; language: string; code: string; response: string }> = {
  curl: {
    title: "cURL API",
    filename: "send-message.sh",
    language: "bash",
    code: `curl -X POST "http://localhost:3000/api/v1/messages/send" \\
  -H "Authorization: Bearer wsf_live_99d19a4e21bc" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "sales-primary",
    "to": "14155552671@s.whatsapp.net",
    "message": {
      "text": "Hello! Your invoice #INV-8492 is ready for review."
    },
    "antiBan": {
      "simulateHumanTyping": true,
      "typingSpeedWpm": 42,
      "readingGazeJitterMs": [800, 1900],
      "markAsRead": true
    }
  }'`,
    response: `{
  "status": "success",
  "messageId": "WA_MSG_9948271A",
  "sessionId": "sales-primary",
  "humanSimulation": {
    "readGazeDelay": "1,140ms",
    "typingDuration": "2,380ms",
    "presenceSent": "composing",
    "banRiskFactor": "0.00%"
  },
  "deliveredAt": "2026-09-19T07:42:19.412Z",
  "latency": "42ms"
}`,
  },
  typescript: {
    title: "TypeScript SDK",
    filename: "gateway-client.ts",
    language: "typescript",
    code: `import { WhatsAppGatewayClient } from "@whatsapp_server/sdk";

const client = new WhatsAppGatewayClient({
  baseUrl: "http://localhost:3000/api/v1",
  apiKey: process.env.WHATSAPP_GATEWAY_KEY!,
});

// Dispatch message with smart anti-ban simulation
const result = await client.messages.send({
  sessionId: "support-agent-1",
  to: "+14155552671",
  content: {
    text: "Your support ticket #4910 has been updated with engineer notes.",
  },
  options: {
    antiBan: {
      humanizeTyping: true,
      delayMultiplier: 1.15,
    },
  },
});

console.log(\`Delivered safely: \${result.messageId}\`);`,
    response: `// Execution Output
✓ Session 'support-agent-1' verified: Active
✓ Presence state switched: 'composing' (2,100ms)
✓ Human keystroke jitter applied: 38 WPM
✓ Sent to +14155552671 (Ack: 2 - Delivered)
Latency: 38ms | Status: 200 OK`,
  },
  antiban: {
    title: "Anti-Ban Engine",
    filename: "smart-anti-ban.config.json",
    language: "json",
    code: `{
  "protectionProfile": "ENTERPRISE_HIGH_SAFETY",
  "humanSimulation": {
    "presenceStates": ["available", "composing", "paused"],
    "minTypingDelayMs": 1200,
    "maxTypingDelayMs": 3500,
    "wpmRange": [32, 48],
    "randomKeystrokeMistakes": true,
    "simulateReadingGaze": true
  },
  "rateLimiting": {
    "maxPerMinute": 18,
    "burstAllowance": 4,
    "jitterWindowSeconds": 45
  },
  "warmupEngine": {
    "stage": "SEASONED_ACCOUNT",
    "currentDailyQuota": 5000,
    "coolingPeriodHours": 6
  }
}`,
    response: `{
  "engineStatus": "SHIELD_ONLINE",
  "accountRiskScore": "0.00 / 100 (Safe)",
  "heuristicSignature": "Authentic iOS WhatsApp Web",
  "activeSessionsProtected": 14,
  "blockedSpikeBursts": 0,
  "recommendedAction": "Normal Dispatch"
}`,
  },
  webhook: {
    title: "Webhook Event",
    filename: "webhook-event.json",
    language: "json",
    code: `{
  "event": "messages.upsert",
  "sessionId": "sales-primary",
  "timestamp": 1789716940,
  "data": {
    "key": {
      "remoteJid": "14155552671@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB09F2A14890B"
    },
    "pushName": "Alexander Vance",
    "message": {
      "conversation": "Can I upgrade our enterprise team plan today?"
    },
    "routing": {
      "matchedRule": "AI_SALES_AGENT",
      "dispatchLatencyMs": 14
    }
  }
}`,
    response: `{
  "webhookDelivery": {
    "endpoint": "https://api.yourdomain.com/v1/wa-events",
    "httpStatus": 200,
    "signature": "sha256=9b71e19482...",
    "dispatchedAt": "2026-09-19T07:42:20.100Z",
    "retryCount": 0
  }
}`,
  },
};

export function CodePlayground() {
  const [activeTab, setActiveTab] = useState<TabKey>("curl");
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const currentSnippet = SNIPPETS[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 600);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-[#25D366]/30 bg-[#041209] shadow-2xl shadow-[#06381e]/40">
      {/* Top Header / Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#25D366]/20 bg-[#06180e] px-4 py-3 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-[#25D366] inline-block" />
          </div>
          <span className="text-xs font-mono text-[#527d67] ml-2 flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-[#25D366]" />
            whatsapp_server-cluster :: {currentSnippet.filename}
          </span>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 bg-[#030d07] p-1 rounded-xl border border-[#25D366]/20">
          {(Object.keys(SNIPPETS) as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-[#25D366] text-[#020b06] shadow-md shadow-[#25D366]/30 font-bold"
                  : "text-[#c2dfd1] hover:text-white hover:bg-white/5"
              }`}
            >
              {SNIPPETS[tab].title}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#06381e] hover:bg-[#25D366] hover:text-[#020b06] text-[#4ade80] border border-[#25D366]/40 transition-all shadow-sm active:scale-95"
          >
            <Play className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin text-[#4ade80]" : "text-[#4ade80]"}`} />
            <span>{isSimulating ? "Dispatching..." : "Simulate"}</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-[#c2dfd1] border border-white/10 transition-all active:scale-95"
            title="Copy snippet"
          >
            {hasCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#25D366]" />
                <span className="text-[#25D366]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#25D366]/20">
        {/* Request Code */}
        <div className="lg:col-span-7 p-5 bg-[#041209] overflow-x-auto">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#527d67] mb-3">
            <span>Request Payload</span>
            <span className="text-[#25D366]">{currentSnippet.language}</span>
          </div>
          <pre className="text-xs sm:text-[13px] font-mono text-[#c2dfd1] leading-relaxed whitespace-pre font-normal">
            <code>{currentSnippet.code}</code>
          </pre>
        </div>

        {/* Response / Realtime Terminal Output */}
        <div className="lg:col-span-5 p-5 bg-[#020b06] overflow-x-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#527d67] mb-3">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-[#25D366] animate-pulse" />
                Cluster Telemetry
              </span>
              <span className="text-[#25D366] font-bold">200 OK</span>
            </div>
            <pre className="text-xs sm:text-[13px] font-mono text-emerald-300 leading-relaxed whitespace-pre font-normal bg-[#030f08] p-3.5 rounded-xl border border-[#25D366]/25 shadow-inner">
              <code>{currentSnippet.response}</code>
            </pre>
          </div>

          {/* Quick Metrics Badge Footer */}
          <div className="mt-4 pt-3 border-t border-[#25D366]/20 flex items-center justify-between text-[11px] font-mono text-[#527d67]">
            <span className="flex items-center gap-1 text-[#4ade80]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#25D366]" /> Anti-Ban Active
            </span>
            <span className="flex items-center gap-1 text-white">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> P99: 38ms
            </span>
            <span className="text-[#25D366]">Zero Drops</span>
          </div>
        </div>
      </div>
    </div>
  );
}
