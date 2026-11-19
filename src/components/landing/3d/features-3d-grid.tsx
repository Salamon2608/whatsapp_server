"use client";

import React from "react";
import {
  Radio,
  ShieldCheck,
  Bot,
  Zap,
  Code,
  Lock,
  Layers,
  Sparkles,
  Server,
  Share2,
} from "lucide-react";
import { InteractiveCard3D } from "./interactive-card-3d";

interface FeatureItem {
  number: string;
  tag: string;
  title: string;
  description: string;
  icon: any;
  glowColor: string;
  badge: string;
  meta: [string, string];
}

const FEATURES: FeatureItem[] = [
  {
    number: "01",
    tag: "Socket core",
    title: "Multi-device Baileys engine",
    description:
      "Run multiple WhatsApp phone numbers concurrently on isolated JID instances. State is continuously persisted with automated reconnection and live QR code streaming.",
    icon: Radio,
    glowColor: "#10B981",
    badge: "v7.0 Core",
    meta: ["Protocol: WebSocket MD", "Multi-tenant: isolated"],
  },
  {
    number: "02",
    tag: "Account safety",
    title: "Smart anti-ban humanizer",
    description:
      "Heuristic algorithms simulate human typing cadences (32-48 WPM), realistic reading gaze delays, and spintax phrase randomization to mitigate bot detection patterns.",
    icon: ShieldCheck,
    glowColor: "#10B981",
    badge: "Adaptive pacing",
    meta: ["Typing cadence: 32-48 WPM", "Pacing jitter: active"],
  },
  {
    number: "03",
    tag: "Intelligence",
    title: "Autonomous AI agents and RAG",
    description:
      "Native integrations for Google Gemini 1.5, OpenAI GPT-4o, Anthropic Claude, and local Ollama. Upload PDFs and documentation for vector retrieval with automated agent handoff.",
    icon: Bot,
    glowColor: "#10B981",
    badge: "Multi-LLM",
    meta: ["Models: Gemini / GPT / Claude", "Vector RAG active"],
  },
  {
    number: "04",
    tag: "High volume",
    title: "Scheduled broadcast pipeline",
    description:
      "Dispatch large-scale announcement campaigns and transactional alerts with configurable delay jitter, per-recipient delivery receipts, and live status tracking.",
    icon: Zap,
    glowColor: "#10B981",
    badge: "Async pipeline",
    meta: ["Queue: Redis / Memory", "Throttled dispatch"],
  },
  {
    number: "05",
    tag: "Developer API",
    title: "86+ REST API endpoints",
    description:
      "Complete OpenAPI 3.1 gateway supporting text, photos, video, audio voice notes, vCard contacts, button menus, list pickers, location pins, and interactive polls.",
    icon: Code,
    glowColor: "#10B981",
    badge: "OpenAPI 3.1",
    meta: ["Endpoints: 86 REST", "Swagger UI live"],
  },
  {
    number: "06",
    tag: "Security",
    title: "Multi-tenant security and RBAC",
    description:
      "Granular role-based access control (SuperAdmin, Owner, Staff), scoped API keys, webhook signing via HMAC-SHA256, session sharing permissions, and audit logs.",
    icon: Lock,
    glowColor: "#10B981",
    badge: "Self-hosted",
    meta: ["Auth: Bearer / API-Key", "Zero external telemetry"],
  },
];

export function Features3DGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 font-sans">
      {FEATURES.map((feature) => {
        const Icon = feature.icon;
        return (
          <InteractiveCard3D
            key={feature.number}
            glowColor={feature.glowColor}
            className="group bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-sm p-5 sm:p-6 flex flex-col justify-between transition-colors shadow-xs rounded-xl"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 group-hover:border-slate-300 group-hover:bg-slate-100 transition-colors shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {feature.badge}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {feature.number}
                  </span>
                </div>
              </div>

              {/* Tag & Title */}
              <span className="text-xs font-mono text-slate-500 mb-1 block">
                {feature.tag}
              </span>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 sm:mb-5 font-normal">
                {feature.description}
              </p>
            </div>

            {/* Footer Metadata */}
            <div className="pt-3 border-t border-slate-100 flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs font-mono text-slate-500">
              <span className="truncate">{feature.meta[0]}</span>
              <span className="text-emerald-700 font-medium truncate">{feature.meta[1]}</span>
            </div>
          </InteractiveCard3D>
        );
      })}
    </div>
  );
}
