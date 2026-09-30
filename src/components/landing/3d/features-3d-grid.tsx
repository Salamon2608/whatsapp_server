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
    tag: "SOCKET CORE",
    title: "Multi-Device Baileys Engine",
    description:
      "Run multiple WhatsApp phone numbers concurrently on isolated JID instances. State is continuously saved in PostgreSQL/MySQL with automatic reconnection and live QR code streaming.",
    icon: Radio,
    glowColor: "#25D366",
    badge: "v7.0 CORE",
    meta: ["Protocol: WebSocket MD", "Multi-Tenant: Isolated"],
  },
  {
    number: "02",
    tag: "ACCOUNT SAFETY",
    title: "Smart Anti-Ban Humanizer",
    description:
      "Advanced heuristic algorithms emulate human typing cadences (32-48 WPM), realistic reading gaze delays, and spintax phrase randomization to bypass WhatsApp's automated bot filters.",
    icon: ShieldCheck,
    glowColor: "#10B981",
    badge: "0.00% BAN RATE",
    meta: ["Safety: 100/100", "Zero Detection Spikes"],
  },
  {
    number: "03",
    tag: "INTELLIGENCE",
    title: "Autonomous AI Agents & RAG",
    description:
      "Native integrations for Google Gemini 1.5, OpenAI GPT-4o, Anthropic Claude, and local Ollama. Upload PDFs and FAQs for RAG knowledge vector retrieval with automatic agent handoff.",
    icon: Bot,
    glowColor: "#06B6D4",
    badge: "MULTI-LLM",
    meta: ["Models: Gemini / GPT / Claude", "Vector RAG Active"],
  },
  {
    number: "04",
    tag: "HIGH VOLUME",
    title: "High-Throughput Campaign Blaster",
    description:
      "Send large-scale announcement campaigns and transactional alerts with configurable delay jitter, per-recipient delivery statuses (sent, delivered, read), and live progress tracking.",
    icon: Zap,
    glowColor: "#F59E0B",
    badge: "ASYNC PIPELINE",
    meta: ["Capacity: 100k+/day", "Auto-Cooling Engine"],
  },
  {
    number: "05",
    tag: "DEVELOPER FIRST",
    title: "86+ REST API Endpoints",
    description:
      "Complete OpenAPI 3.1 gateway supporting raw text, photos, video, audio voice notes, vCard contacts, interactive button menus, list pickers, location pins, and interactive polls.",
    icon: Code,
    glowColor: "#3B82F6",
    badge: "OPENAPI 3.1",
    meta: ["Endpoints: 86 REST", "Swagger UI Live"],
  },
  {
    number: "06",
    tag: "ENTERPRISE",
    title: "Multi-Tenant Security & RBAC",
    description:
      "Granular role-based access control (SuperAdmin, Owner, Staff), scoped API keys, webhook signing via HMAC-SHA256, session sharing permissions, and full audit logs.",
    icon: Lock,
    glowColor: "#A855F7",
    badge: "100% PRIVATE",
    meta: ["Auth: Bearer / API-Key", "Self-Hosted Sovereign"],
  },
];

export function Features3DGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 font-manrope">
      {FEATURES.map((feature) => {
        const Icon = feature.icon;
        return (
          <InteractiveCard3D
            key={feature.number}
            glowColor={feature.glowColor}
            className="group bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-sm rounded-2xl sm:rounded-3xl"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-800 group-hover:scale-110 group-hover:border-emerald-300 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-all duration-300 shadow-xs">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {feature.badge}
                  </span>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400">
                    {feature.number}
                  </span>
                </div>
              </div>

              {/* Tag & Title */}
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-slate-500 font-semibold mb-1 block">
                // {feature.tag}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 sm:mb-6 font-normal">
                {feature.description}
              </p>
            </div>

            {/* Footer Metadata */}
            <div className="pt-3 sm:pt-4 border-t border-slate-100 flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-[11px] sm:text-xs font-mono text-slate-500">
              <span className="truncate">{feature.meta[0]}</span>
              <span className="text-emerald-700 font-semibold truncate">{feature.meta[1]}</span>
            </div>
          </InteractiveCard3D>
        );
      })}
    </div>
  );
}
