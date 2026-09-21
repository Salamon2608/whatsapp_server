"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Zap,
  Wifi,
  Cpu,
  Bot,
  Sparkles,
  Lock,
  Radio,
  CheckCheck,
  Flame,
} from "lucide-react";

export function IsometricHeroPreview() {
  // Interactive Parallax mouse tilt
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: -8, y: 14 });
  const [isHovered, setIsHovered] = useState(false);

  // Live dynamic telemetry updates
  const [wpm, setWpm] = useState(42);
  const [gazeDelay, setGazeDelay] = useState(1420);
  const [latency, setLatency] = useState(34);
  const [throughput, setThroughput] = useState(1204);
  const [typingDots, setTypingDots] = useState(0);
  const [streamStep, setStreamStep] = useState(0);
  const [activeMessage, setActiveMessage] = useState({
    sender: "+1 (415) 892-1049",
    text: "Can I upgrade our enterprise team plan today?",
    status: "Auto-Paced (1.1s)",
  });

  // Cycle simulation data
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setWpm((prev) => 38 + Math.floor(Math.random() * 9));
      setGazeDelay((prev) => 1350 + Math.floor(Math.random() * 220));
      setLatency((prev) => 30 + Math.floor(Math.random() * 8));
      setThroughput((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 2400);

    const dotsInterval = setInterval(() => {
      setTypingDots((prev) => (prev + 1) % 4);
    }, 450);

    const streamInterval = setInterval(() => {
      setStreamStep((prev) => (prev + 1) % 3);
    }, 1800);

    const messagesList = [
      {
        sender: "+1 (415) 892-1049",
        text: "Can I upgrade our enterprise team plan today?",
        status: "Auto-Paced (1.1s)",
      },
      {
        sender: "+44 7911 123456",
        text: "Invoice #INV-9041 receipt requested",
        status: "AI Agent Routing (0.8s)",
      },
      {
        sender: "+65 9123 4567",
        text: "Reset my multi-tenant API token",
        status: "Human Typing Simulated (1.4s)",
      },
    ];

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messagesList.length;
      setActiveMessage(messagesList[msgIdx]);
    }, 4000);

    return () => {
      clearInterval(telemetryInterval);
      clearInterval(dotsInterval);
      clearInterval(streamInterval);
      clearInterval(msgInterval);
    };
  }, []);

  // Parallax calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -8 + x * 12,
      y: 14 - y * 12,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: -8, y: 14 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-5xl mx-auto py-8 sm:py-12 perspective-1000 select-none cursor-default"
    >
      {/* Background glowing radial lights (subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] bg-[#25D366]/6 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[18rem] h-[18rem] bg-[#06381e]/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Floating Inbound Message Toast */}
      <div className="absolute -top-4 right-4 sm:right-12 z-30 transition-all duration-500 animate-float-3 hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#04190e]/95 backdrop-blur-xl border border-[#25D366]/40 shadow-lg shadow-black/40">
        <div className="text-xs font-mono">
          <span className="text-[#4ade80] font-bold">{activeMessage.sender}</span>:{" "}
          <span className="text-white">&ldquo;{activeMessage.text}&rdquo;</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-[#25D366]/20 text-[#4ade80] text-[10px] font-mono border border-[#25D366]/30">
          {activeMessage.status}
        </span>
      </div>

      {/* Isometric 3D Container with Parallax & Continuous 3D Depth */}
      <div
        className="relative mx-auto w-full transition-transform duration-300 ease-out preserve-3d"
        style={{
          transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) rotateZ(1.2deg)`,
        }}
      >
        {/* Animated Cyber Grid Floor */}
        <div
          className="absolute -inset-14 rounded-3xl opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #25D366 1.5px, transparent 1.5px),
              linear-gradient(to bottom, #25D366 1.5px, transparent 1.5px)
            `,
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 75%)",
          }}
        />

        {/* SVG Laser Stream Connectors between Cards */}
        <div className="absolute inset-0 pointer-events-none z-20 hidden md:block">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#25D366" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#4ade80" stopOpacity="1" />
                <stop offset="100%" stopColor="#25D366" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Glowing Pulse Path from Card 1 to Card 2 */}
            <path
              d="M 390 120 C 420 120, 440 140, 460 140"
              stroke="url(#streamGrad)"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="6 6"
              filter="url(#glow)"
              className="animate-pulse"
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
          {/* Card 1: Baileys Master Gateway Card (Fintech Card with Floating Animation) */}
          <div className="animate-float-1 md:col-span-6 lg:col-span-5 bg-gradient-to-br from-[#062414] via-[#04160c] to-[#020b06] border border-[#25D366]/30 rounded-3xl p-6 shadow-lg shadow-black/50 relative overflow-hidden backdrop-blur-xl group hover:border-[#4ade80] transition-all duration-300">
            {/* Shimmer Light Reflection Sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />

            {/* Ambient Card Glow (Subtle) */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#25D366]/10 rounded-full blur-2xl group-hover:bg-[#25D366]/18 transition-all" />

            {/* Chip & Status Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-9 w-12 rounded-lg bg-gradient-to-r from-amber-400 to-amber-200 border border-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <div className="w-8 h-5 border-t border-b border-amber-800/70 rounded flex flex-col justify-between py-1 px-1">
                    <div className="h-[1px] bg-amber-900/70 w-full" />
                    <div className="h-[1px] bg-amber-900/70 w-full" />
                  </div>
                </div>
                <span className="text-[11px] font-mono tracking-widest text-[#4ade80] font-bold">
                  BAILEYS // MD-V2
                </span>
              </div>
              <div className="flex items-center px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-sm">
                ONLINE
              </div>
            </div>

            {/* Session Card Number with Live Connection Ping */}
            <div className="space-y-1 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#527d67]">
                Primary Gateway JID
              </span>
              <p className="text-xl sm:text-2xl font-mono font-bold tracking-wider text-white flex items-center gap-2">
                +1 (555) 839-2041
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-[#c2dfd1] pt-1">
                <Wifi className="h-3.5 w-3.5 text-[#25D366] animate-pulse" />
                <span>Socket: TLS / WS Active</span>
                <span className="text-[#527d67]">•</span>
                <span className="text-[#4ade80] font-bold">Latency: {latency}ms</span>
              </div>
            </div>

            {/* Card Bottom Meta with Live Throughput */}
            <div className="flex items-center justify-between pt-4 border-t border-[#25D366]/20 text-xs">
              <div>
                <span className="text-[10px] block font-mono text-[#527d67] uppercase">
                  Encryption
                </span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <Lock className="h-3 w-3 text-emerald-400" /> Signal Protocol E2E
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] block font-mono text-[#527d67] uppercase">
                  Throughput
                </span>
                <span className="font-mono font-bold text-[#4ade80] flex items-center gap-1 justify-end">
                  <Flame className="h-3 w-3 text-amber-400" /> {throughput.toLocaleString()} msg/s
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Smart Humanizer Anti-Ban Shield (Floating with Neon Glow & Live Counters) */}
          <div className="animate-float-2 animate-neon md:col-span-6 lg:col-span-7 bg-gradient-to-br from-[#051c10] to-[#020b06] border border-[#25D366]/50 rounded-3xl p-6 sm:p-7 relative overflow-hidden backdrop-blur-xl group hover:border-[#4ade80] transition-all duration-300">
            {/* Shimmer Light Reflection */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" style={{ animationDelay: "2s" }} />

            {/* Radial Corner Glow (Subtle) */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#25D366]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 text-[#4ade80] shadow-lg shadow-[#25D366]/30">
                  <ShieldCheck className="h-6 w-6 text-[#25D366] animate-pulse" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    Smart Anti-Ban Shield
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#4ade80] border border-[#25D366]/30">
                      HEURISTIC SIMULATOR
                    </span>
                  </h4>
                  <p className="text-xs text-[#c2dfd1]">
                    Human behavior mimicry across all flows, automations, and AI rules
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-mono uppercase text-[#527d67]">Ban Risk</span>
                <span className="text-xl font-bold font-mono text-[#25D366] flex items-center gap-1">
                  0.00%
                </span>
              </div>
            </div>

            {/* Live Metrics Grid with Dynamic Values */}
            <div className="grid grid-cols-3 gap-3 my-4">
              {/* Typing Emulation */}
              <div className="bg-[#031008]/90 p-3 rounded-2xl border border-[#25D366]/30 relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#527d67] mb-1">
                  <span>TYPING EMULATION</span>
                  <ActivityDot color="blue" />
                </div>
                <div className="text-base font-bold text-white font-mono flex items-center gap-1">
                  <span>{wpm} WPM</span>
                  <span className="text-xs text-[#25D366] font-mono">
                    {".".repeat(typingDots)}
                  </span>
                </div>
                <div className="text-[11px] text-[#4ade80]">Natural keystroke ticks</div>
              </div>

              {/* Reading Gaze Delay */}
              <div className="bg-[#031008]/90 p-3 rounded-2xl border border-[#25D366]/30">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#527d67] mb-1">
                  <span>READING GAZE</span>
                  <ActivityDot color="green" />
                </div>
                <div className="text-base font-bold text-emerald-400 font-mono">
                  {gazeDelay.toLocaleString()} ms
                </div>
                <div className="text-[11px] text-[#c2dfd1]">Jitter simulation delay</div>
              </div>

              {/* Warmup Cycle */}
              <div className="bg-[#031008]/90 p-3 rounded-2xl border border-[#25D366]/30">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#527d67] mb-1">
                  <span>WARMUP CYCLE</span>
                  <ActivityDot color="amber" />
                </div>
                <div className="text-base font-bold text-amber-300 font-mono">AUTO-TIER</div>
                <div className="text-[11px] text-[#c2dfd1]">Adaptive safety rate</div>
              </div>
            </div>

            {/* Live Data Stream Pipe with Traveling Packet Animation */}
            <div className="bg-[#020b06] p-3 rounded-xl border border-[#25D366]/25 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono relative z-10">
                <div className="flex items-center gap-2 text-[#c2dfd1]">
                  <Radio className="h-4 w-4 text-[#25D366] animate-pulse" />
                  <span className="text-white font-bold">STREAM:</span>

                  {/* Step 1 */}
                  <span
                    className={`transition-colors duration-300 ${
                      streamStep === 0 ? "text-[#4ade80] font-bold" : "text-[#527d67]"
                    }`}
                  >
                    Incoming JID
                  </span>
                  <span className="text-[#527d67]">→</span>

                  {/* Step 2 */}
                  <span
                    className={`transition-colors duration-300 ${
                      streamStep === 1 ? "text-emerald-300 font-bold" : "text-[#527d67]"
                    }`}
                  >
                    Sanitized &amp; Paced
                  </span>
                  <span className="text-[#527d67]">→</span>

                  {/* Step 3 */}
                  <span
                    className={`transition-colors duration-300 flex items-center gap-1 ${
                      streamStep === 2 ? "text-white font-bold" : "text-[#527d67]"
                    }`}
                  >
                    Dispatch OK <CheckCheck className="h-3.5 w-3.5 text-emerald-400 inline" />
                  </span>
                </div>
                <span className="text-[11px] text-[#527d67] hidden sm:inline">Zero Drop Queue</span>
              </div>

              {/* Laser energy line traveling across */}
              <div className="absolute bottom-0 left-0 h-[2px] w-24 bg-gradient-to-r from-transparent via-[#4ade80] to-transparent animate-laser" />
            </div>
          </div>

          {/* Card 3: Autonomous AI Agent & Real-time Flow Stream (Floating with Soft Levitation) */}
          <div className="animate-float-3 md:col-span-12 bg-[#03140a] border border-[#25D366]/25 rounded-3xl p-5 sm:p-6 shadow-lg shadow-black/40 relative overflow-hidden backdrop-blur-xl">
            {/* Shimmer Reflection */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" style={{ animationDelay: "1s" }} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] shadow-sm">
                  <Bot className="h-5 w-5 animate-pulse text-[#25D366]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      Gemini 1.5 &amp; OpenAI Autonomous Agent Cluster
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#25D366]/20 text-[#4ade80] text-[10px] font-mono font-semibold border border-[#25D366]/30">
                      RAG EMBEDDED
                    </span>
                  </div>
                  <p className="text-xs text-[#c2dfd1]">
                    Natural conversation memory, context synthesis, and dynamic fallback pipelines
                  </p>
                </div>
              </div>

              {/* Live Flow Stats */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-[#c2dfd1]">
                  <Cpu className="h-4 w-4 text-[#4ade80] animate-spin" style={{ animationDuration: "12s" }} />
                  <span>
                    Agent Latency: <strong className="text-white">41ms</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Sparkles className="h-4 w-4 animate-bounce" />
                  <span>
                    Intent Match: <strong>99.4%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityDot({ color }: { color: "blue" | "green" | "amber" }) {
  const colorMap = {
    blue: "bg-[#25D366]",
    green: "bg-emerald-400",
    amber: "bg-amber-400",
  };
  return <span className={`inline-block h-2 w-2 rounded-full ${colorMap[color]} opacity-80`} />;
}
