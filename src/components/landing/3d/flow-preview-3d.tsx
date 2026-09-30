"use client";

import React, { useState } from "react";
import {
  Bot,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Cpu,
} from "lucide-react";

interface FlowStep {
  id: string;
  type: string;
  title: string;
  badge: string;
  icon: any;
  color: string;
  borderColor: string;
  details: string;
  payload: string;
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: "step-1",
    type: "TRIGGER",
    title: "Inbound WhatsApp Message",
    badge: "EVENT 01",
    icon: Zap,
    color: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/40",
    details: "Customer texts: 'Can I check our enterprise invoice #9042?'",
    payload: `{\n  "event": "messages.upsert",\n  "sender": "+1 (415) 892-1049",\n  "type": "text"\n}`,
  },
  {
    id: "step-2",
    type: "HEURISTIC",
    title: "Anti-Ban Smart Pacing",
    badge: "HUMANIZER 02",
    icon: ShieldCheck,
    color: "from-cyan-500/20 to-blue-500/10",
    borderColor: "border-cyan-500/40",
    details: "Computes 1.2s gaze reading pause + typing state packet emission.",
    payload: `{\n  "presence": "composing",\n  "typingWpm": 42,\n  "delayMs": 1280\n}`,
  },
  {
    id: "step-3",
    type: "AI_RAG",
    title: "Vector Knowledge Base & LLM",
    badge: "INTELLIGENCE 03",
    icon: Bot,
    color: "from-purple-500/20 to-indigo-500/10",
    borderColor: "border-purple-500/40",
    details: "Gemini 1.5 Pro indexes billing docs and formulates authenticated invoice receipt.",
    payload: `{\n  "provider": "gemini-1.5-flash",\n  "tokens": 142,\n  "intent": "billing_lookup"\n}`,
  },
  {
    id: "step-4",
    type: "DISPATCH",
    title: "Interactive WhatsApp Reply",
    badge: "DELIVERY 04",
    icon: CheckCircle2,
    color: "from-emerald-500/20 to-emerald-600/10",
    borderColor: "border-emerald-500/60",
    details: "Dispatches PDF invoice attachment + interactive Quick Reply buttons.",
    payload: `{\n  "type": "interactive_buttons",\n  "buttons": ["Download PDF", "Contact Support"]\n}`,
  },
];

export function FlowPreview3D() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const triggerSimulation = () => {
    setIsSimulating(true);
    setActiveStep(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < FLOW_STEPS.length) {
        setActiveStep(current);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 1100);
  };

  return (
    <div className="relative w-full rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-8 overflow-hidden shadow-xl shadow-slate-200/50 font-manrope">
      {/* Background isometric grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Header & Simulation Trigger */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-semibold mb-2">
            <Layers className="h-3.5 w-3.5 text-emerald-600" />
            <span>VISUAL CONVERSATIONAL CANVAS</span>
          </div>
          <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Autonomous Flow Engine with Real-Time Branching
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
            Build drag-and-drop conversational logic that connects Baileys sockets with AI vector models.
          </p>
        </div>

        <button
          onClick={triggerSimulation}
          disabled={isSimulating}
          className={`w-full sm:w-auto h-11 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 ${
            isSimulating
              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              : "bg-[#25D366] hover:bg-[#1ebd5d] text-slate-950 shadow-md shadow-[#25D366]/25 active:scale-95"
          }`}
        >
          {isSimulating ? (
            <>
              <Cpu className="h-4 w-4 animate-spin text-emerald-600" />
              <span>Tracing Execution...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>Simulate Live Event</span>
            </>
          )}
        </button>
      </div>

      {/* 3D Isometric Workflow Track */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {FLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === idx;

          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`cursor-pointer group relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                isActive
                  ? `border-emerald-500 bg-emerald-50/60 shadow-lg shadow-emerald-500/10 scale-[1.01] ring-2 ring-emerald-500/20`
                  : "bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-white"
              }`}
            >
              {/* Step indicator pill */}
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <span className="text-[9px] sm:text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                  {step.badge}
                </span>
                <div
                  className={`p-1.5 sm:p-2 rounded-xl border ${
                    isActive ? "border-emerald-300 bg-emerald-100/60 text-emerald-700" : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">{step.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">{step.details}</p>

              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute -bottom-1 left-4 right-4 h-1 bg-[#25D366] rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Active Step JSON Payload Inspector */}
      <div className="relative z-10 rounded-2xl bg-slate-900 border border-slate-800 p-3.5 sm:p-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] sm:text-xs font-mono mb-2 text-slate-300">
          <span className="flex items-center gap-2 truncate">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="truncate">Payload: <strong className="text-white">{FLOW_STEPS[activeStep].title}</strong></span>
          </span>
          <span className="text-emerald-400 font-semibold text-[11px]">Status: 200 OK</span>
        </div>
        <pre className="text-[11px] sm:text-xs font-mono text-emerald-400/95 bg-black/60 p-2.5 sm:p-3 rounded-xl overflow-x-auto">
          <code>{FLOW_STEPS[activeStep].payload}</code>
        </pre>
      </div>
    </div>
  );
}
