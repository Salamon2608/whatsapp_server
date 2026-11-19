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
      <div className="flex whitespace-nowrap overflow-hidden mb-3">
        <div className="animate-marquee flex items-center gap-4">
          {[...LANE_1, ...LANE_1].map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 hover:text-slate-950 hover:border-slate-300 shadow-xs transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Row 2 (Reverse) */}
      <div className="flex whitespace-nowrap overflow-hidden">
        <div className="animate-marquee-reverse flex items-center gap-4">
          {[...LANE_2, ...LANE_2].map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 hover:text-slate-950 hover:border-slate-300 shadow-xs transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
