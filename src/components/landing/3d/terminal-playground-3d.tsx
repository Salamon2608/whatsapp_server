"use client";

import React, { useState } from "react";
import {
  Code,
  Terminal,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface EndpointPreset {
  id: string;
  name: string;
  method: string;
  path: string;
  category: string;
  curl: string;
  typescript: string;
  python: string;
  response: string;
}

const ENDPOINTS: EndpointPreset[] = [
  {
    id: "send-message",
    name: "Send High-Speed Message",
    method: "POST",
    path: "/api/messages/{sessionId}/send",
    category: "Messaging",
    curl: `curl -X POST https://wa-server.app/api/messages/session_01/send \\
  -H "X-API-Key: wa_sec_9941a87e2b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jid": "14158921049@s.whatsapp.net",
    "type": "text",
    "content": "Hello from WHATSAPP SERVER! Your one-time passcode is: 849-201"
  }'`,
    typescript: `const response = await fetch("https://wa-server.app/api/messages/session_01/send", {
  method: "POST",
  headers: {
    "X-API-Key": "wa_sec_9941a87e2b",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    jid: "14158921049@s.whatsapp.net",
    type: "text",
    content: "Hello from WHATSAPP SERVER! Your one-time passcode is: 849-201"
  })
});

const data = await response.json();
console.log("Dispatched:", data.keyId);`,
    python: `import requests

url = "https://wa-server.app/api/messages/session_01/send"
headers = {
    "X-API-Key": "wa_sec_9941a87e2b",
    "Content-Type": "application/json"
}
payload = {
    "jid": "14158921049@s.whatsapp.net",
    "type": "text",
    "content": "Hello from WHATSAPP SERVER! Your one-time passcode is: 849-201"
}

res = requests.post(url, json=payload, headers=headers)
print(res.json())`,
    response: `{
  "success": true,
  "status": "SENT",
  "keyId": "BAE59F810C24B8",
  "sessionId": "session_01",
  "recipient": "14158921049@s.whatsapp.net",
  "humanizer": {
    "typingDelayMs": 950,
    "effectiveWpm": 44,
    "banShield": "100% PASS"
  },
  "timestamp": "2026-06-24T12:00:00.000Z"
}`,
  },
  {
    id: "broadcast-campaign",
    name: "Mass Campaign Blast",
    method: "POST",
    path: "/api/messages/{sessionId}/broadcast",
    category: "Campaigns",
    curl: `curl -X POST https://wa-server.app/api/messages/session_01/broadcast \\
  -H "X-API-Key: wa_sec_9941a87e2b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hey {{name}}, flash sale {starts now|is live}!",
    "recipients": ["14158921049@s.whatsapp.net", "447911123456@s.whatsapp.net"],
    "delay": 2500,
    "spintaxEnabled": true
  }'`,
    typescript: `const response = await fetch("https://wa-server.app/api/messages/session_01/broadcast", {
  method: "POST",
  headers: {
    "X-API-Key": "wa_sec_9941a87e2b",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    message: "Hey {{name}}, flash sale {starts now|is live}!",
    recipients: ["14158921049@s.whatsapp.net", "447911123456@s.whatsapp.net"],
    delay: 2500,
    spintaxEnabled: true
  })
});`,
    python: `import requests

url = "https://wa-server.app/api/messages/session_01/broadcast"
headers = {"X-API-Key": "wa_sec_9941a87e2b"}
payload = {
    "message": "Hey {{name}}, flash sale {starts now|is live}!",
    "recipients": ["14158921049@s.whatsapp.net", "447911123456@s.whatsapp.net"],
    "delay": 2500,
    "spintaxEnabled": True
}
requests.post(url, json=payload, headers=headers)`,
    response: `{
  "success": true,
  "broadcastId": "bc_9902a71bf",
  "queued": 2,
  "status": "RUNNING",
  "estimatedDurationSec": 5.2,
  "spintaxResolved": true,
  "safetyBucketStatus": "OPTIMAL"
}`,
  },
  {
    id: "automated-playground",
    name: "Premium Automated Assistant",
    method: "POST",
    path: "/api/automation/playground",
    category: "Automated & RAG",
    curl: `curl -X POST https://wa-server.app/api/automation/playground \\
  -H "X-API-Key: wa_sec_9941a87e2b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "gemini",
    "model": "gemini-1.5-flash",
    "prompt": "Explain our return policy for enterprise hardware."
  }'`,
    typescript: `const response = await fetch("https://wa-server.app/api/automation/playground", {
  method: "POST",
  headers: {
    "X-API-Key": "wa_sec_9941a87e2b",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    provider: "gemini",
    model: "gemini-1.5-flash",
    prompt: "Explain our return policy for enterprise hardware."
  })
});`,
    python: `import requests

res = requests.post("https://wa-server.app/api/automation/playground", 
    headers={"X-API-Key": "wa_sec_9941a87e2b"},
    json={
        "provider": "gemini",
        "model": "gemini-1.5-flash",
        "prompt": "Explain our return policy for enterprise hardware."
    }
)`,
    response: `{
  "success": true,
  "provider": "gemini",
  "model": "gemini-1.5-flash",
  "reply": "Enterprise hardware comes with a 30-day no-questions refund and a 3-year expedited replacement warranty.",
  "tokens": {
    "prompt": 48,
    "completion": 24,
    "total": 72
  },
  "latencyMs": 284
}`,
  },
];

export function TerminalPlayground3D() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointPreset>(ENDPOINTS[0]);
  const [activeLang, setActiveLang] = useState<"curl" | "typescript" | "python">("curl");
  const [copied, setCopied] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [liveResponse, setLiveResponse] = useState<string>(ENDPOINTS[0].response);

  const handleCopy = () => {
    const code = selectedEndpoint[activeLang];
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setLiveResponse("// Dispatching binary packet via Baileys socket pipeline...");

    setTimeout(() => {
      if (selectedEndpoint.id === "send-message") {
        setLiveResponse(
          selectedEndpoint.response.replace(
            "2026-06-24T12:00:00.000Z",
            new Date().toISOString()
          )
        );
      } else {
        setLiveResponse(selectedEndpoint.response);
      }
      setIsExecuting(false);
    }, 650);
  };

  const handleSelectEndpoint = (ep: EndpointPreset) => {
    setSelectedEndpoint(ep);
    setLiveResponse(ep.response);
  };

  return (
    <div className="relative w-full rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-8 shadow-xl shadow-slate-200/50 overflow-hidden font-manrope">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 sm:mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-semibold mb-2">
            <Terminal className="h-3.5 w-3.5 text-emerald-600" />
            <span>DEVELOPER LIVE SANDBOX</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Execute 86+ REST API Endpoints Instantly
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            Test message dispatches, broadcast runs, and automated prompts with full OpenAPI 3.1 compliance.
          </p>
        </div>

        <Link href="/docs" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs">
            <span>Explore Swagger UI Live</span>
            <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
          </button>
        </Link>
      </div>

      {/* Endpoint Selector Tabs (Touch-scrollable on mobile) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar mb-4 sm:mb-6">
        {ENDPOINTS.map((ep) => {
          const isSelected = selectedEndpoint.id === ep.id;
          return (
            <button
              key={ep.id}
              onClick={() => handleSelectEndpoint(ep)}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 sm:gap-2 border whitespace-nowrap shrink-0 active:scale-95 ${
                isSelected
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${
                isSelected ? "bg-emerald-200/60 text-emerald-900" : "bg-slate-200/70 text-slate-700"
              }`}>
                {ep.method}
              </span>
              <span>{ep.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Terminal Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Code Editor View */}
        <div className="lg:col-span-7 rounded-2xl bg-black/80 border border-slate-800 overflow-hidden flex flex-col">
          {/* Editor Top Bar */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900/80 border-b border-slate-800 text-xs font-mono">
            {/* Window Dots */}
            <div className="flex items-center gap-1.5 min-w-0 mr-2">
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-rose-500/80 inline-block shrink-0" />
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-500/80 inline-block shrink-0" />
              <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500/80 inline-block shrink-0" />
              <span className="ml-1 sm:ml-2 text-slate-400 font-semibold truncate max-w-[130px] xs:max-w-[200px] sm:max-w-none text-[11px] sm:text-xs">
                {selectedEndpoint.path}
              </span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-950 p-0.5 sm:p-1 rounded-lg border border-slate-800 shrink-0">
              {(["curl", "typescript", "python"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-mono uppercase transition-all ${
                    activeLang === lang
                      ? "bg-emerald-500/20 text-emerald-400 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Code block */}
          <div className="p-3 sm:p-4 flex-1 overflow-x-auto relative">
            <pre className="text-[11px] sm:text-xs font-mono text-slate-300 leading-relaxed">
              <code>{selectedEndpoint[activeLang]}</code>
            </pre>
          </div>

          {/* Editor Action Bottom Bar */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900/60 border-t border-slate-800 text-[11px] sm:text-xs font-mono">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Code"}</span>
            </button>

            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
              <span>{isExecuting ? "Executing..." : "Send Request"}</span>
            </button>
          </div>
        </div>

        {/* Right Live JSON Response View */}
        <div className="lg:col-span-5 rounded-2xl bg-black/80 border border-slate-800 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900/80 border-b border-slate-800 text-[11px] sm:text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Response Output
            </span>
            <span className="text-emerald-400 font-semibold text-[11px]">200 OK (34ms)</span>
          </div>

          {/* Response Payload Content */}
          <div className="p-3 sm:p-4 flex-1 overflow-x-auto bg-slate-950/40">
            <pre className="text-[11px] sm:text-xs font-mono text-emerald-400 leading-relaxed">
              <code>{liveResponse}</code>
            </pre>
          </div>

          {/* Footer stats */}
          <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400">
            <span>HMAC: Validated</span>
            <span>Security: 100/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
