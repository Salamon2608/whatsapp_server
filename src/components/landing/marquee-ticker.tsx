"use client";

import React from "react";

const LANE_1 = [
  "Multi-Device Baileys Engine",
  "Smart Humanizer Anti-Ban Core",
  "Gemini 1.5 & GPT-4o Autonomous Agents",
  "Real-Time Webhook Pipeline",
  "Visual Drag-and-Drop Flow Canvas",
  "REST API with OpenAPI 3.1",
  "Isolated Session Multi-Tenancy",
  "Signal Protocol End-to-End Encryption",
];

const LANE_2 = [
  "Zero Account Ban Track Record",
  "Node.js 20+ & Strict TypeScript",
  "WebSocket Realtime Telemetry",
  "Docker Container Native",
  "Precision Campaign Scheduler",
  "Granular RBAC & Token Scopes",
  "100% Self-Hosted & Sovereign",
  "Auto-Healing QR Reconnection",
];

export function MarqueeTicker() {
  return (
    <div className="relative w-full overflow-hidden py-10 bg-slate-50/80 border-y border-slate-200">
      {/* Side Fade Gradients for smooth infinite look */}
      <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

      {/* Marquee Row 1 */}
      <div className="flex whitespace-nowrap overflow-hidden mb-4">
        <div className="animate-marquee flex items-center gap-6">
          {[...LANE_1, ...LANE_1].map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-mono text-slate-700 hover:text-slate-950 hover:border-[#25D366] shadow-xs transition-all"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] shadow-[0_0_8px_#25D366]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Row 2 (Reverse) */}
      <div className="flex whitespace-nowrap overflow-hidden">
        <div className="animate-marquee-reverse flex items-center gap-6">
          {[...LANE_2, ...LANE_2].map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-mono text-emerald-700 hover:text-emerald-950 hover:border-[#25D366] shadow-xs transition-all"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#25D366]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
