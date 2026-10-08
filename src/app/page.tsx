import Link from "next/link";
import Image from "next/image";
import fs from "fs";
import path from "path";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity,
  Layers,
  Code,
  Radio,
  Cpu,
  Lock,
  Sparkles,
} from "lucide-react";
import { HeroGateway3D } from "@/components/landing/3d/hero-gateway-3d";
import { AntiBanRadar3D } from "@/components/landing/3d/anti-ban-radar-3d";
import { Features3DGrid } from "@/components/landing/3d/features-3d-grid";
import { FlowPreview3D } from "@/components/landing/3d/flow-preview-3d";
import { TerminalPlayground3D } from "@/components/landing/3d/terminal-playground-3d";
import { MarqueeTicker } from "@/components/landing/marquee-ticker";
import { Navbar3D } from "@/components/landing/3d-navbar";
import { FadeReveal } from "@/components/landing/fade-reveal";

export const metadata = {
  title: "WHATSAPP SERVER | Mission-Critical WhatsApp Gateway & 3D AI Infrastructure",
  description:
    "Next-generation self-hosted 3D WhatsApp Gateway with Multi-device Baileys engine, Smart Humanizer Anti-Ban, Autonomous AI Agents, Visual Flow Canvas, and 86+ REST endpoints.",
  openGraph: {
    title: "WHATSAPP SERVER | Mission-Critical WhatsApp Gateway & 3D AI Infrastructure",
    description:
      "Next-generation self-hosted 3D WhatsApp Gateway with Multi-device Baileys engine, Smart Humanizer Anti-Ban, Autonomous AI Agents, Visual Flow Canvas, and 86+ REST endpoints.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://wa-server.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "WHATSAPP SERVER | Mission-Critical WhatsApp Gateway & 3D AI Infrastructure",
    description:
      "Next-generation self-hosted 3D WhatsApp Gateway with Multi-device Baileys engine, Smart Humanizer Anti-Ban, Autonomous AI Agents, Visual Flow Canvas, and 86+ REST endpoints.",
  },
};

export default function Home() {
  const packagePath = path.join(process.cwd(), "package.json");
  let version = "v1.6.4";
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    if (packageJson.version) {
      version = `v${packageJson.version}`;
    }
  } catch (error) {
    console.error("Failed to read package.json", error);
  }

  const telemetryStats = [
    {
      value: "< 42ms",
      title: "P99 Binary Dispatch",
      description: "Direct Baileys binary socket pipeline with zero gateway proxy overhead.",
      color: "text-slate-900",
      accent: "text-emerald-700",
    },
    {
      value: "0.00%",
      title: "Account Ban Rate",
      description: "Heuristic human typing jitter, reading gaze delay, and spintax randomization.",
      color: "text-emerald-600",
      accent: "text-emerald-700",
    },
    {
      value: "86+",
      title: "REST API Endpoints",
      description: "Complete OpenAPI 3.1 spec covering messages, media, stickers, and polls.",
      color: "text-slate-900",
      accent: "text-cyan-700",
    },
    {
      value: "100%",
      title: "Data Sovereignty",
      description: "Your encryption keys, your database, your server. Zero third-party telemetry.",
      color: "text-slate-900",
      accent: "text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#25D366]/30 selection:text-slate-950 relative overflow-x-hidden font-manrope">
      {/* Background Luminous Mesh Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(37, 211, 102, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 85% 30%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),
            linear-gradient(to right, rgba(0, 0, 0, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 56px 56px, 56px 56px",
        }}
      />

      {/* Modern Enterprise Navigation Bar */}
      <Navbar3D version={version} />

      <main className="pt-2 sm:pt-6 space-y-16 sm:space-y-32">
        {/* ========================================================
            HERO SECTION WITH 3D WEBGL GATEWAY
           ======================================================== */}
        <section className="relative pt-6 sm:pt-14 pb-4 sm:pb-8 overflow-hidden">
          {/* Floating Soft Ambient Glow Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55rem] h-[32rem] bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none -z-10 animate-float-slow" />
          <div className="absolute top-12 left-1/4 w-[28rem] h-[28rem] bg-cyan-400/5 rounded-full blur-[140px] pointer-events-none -z-10 animate-float-slow" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6">
              {/* Modern Enterprise Announcement Pill (Two-tone design, no online dot) */}
              <FadeReveal direction="up" delayMs={50}>
                <Link
                  href="#architecture"
                  className="inline-flex items-center gap-2.5 p-1 pr-3.5 rounded-full bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-emerald-300/80 shadow-xs hover:shadow-md transition-all duration-300 group relative overflow-hidden cursor-pointer"
                >
                  {/* Subtle specular sheen sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-emerald-100/30 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />

                  {/* Contrast Tag Chip */}
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-white font-mono text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-xs">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>{version}</span>
                  </span>

                  {/* Feature & Version Subtext */}
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-700 group-hover:text-slate-950 transition-colors flex items-center gap-1.5">
                    <span>Baileys v7 Multi-Device Core</span>
                    <span className="hidden xs:inline text-slate-300">•</span>
                    <span className="hidden xs:inline text-emerald-700 font-medium">Enterprise Engine</span>
                  </span>

                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-700 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </FadeReveal>

              {/* Headline with Flowing Gradient Animation */}
              <FadeReveal direction="up" delayMs={120}>
                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-extrabold text-slate-900 tracking-[-0.04em] leading-[1.15]">
                  Next-Gen 3D WhatsApp Gateway &{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-[#25D366] to-teal-600 animate-gradient-flow">
                    Autonomous AI Server.
                  </span>
                </h1>
              </FadeReveal>

              {/* Subtitle */}
              <FadeReveal direction="up" delayMs={200}>
                <p className="max-w-2xl mx-auto text-sm sm:text-lg text-slate-600 leading-relaxed font-normal">
                  Scale mission-critical WhatsApp communication effortlessly. Connect multiple numbers concurrently with Baileys binary sockets, deploy self-hosted AI agents with RAG memory, and execute high-volume campaigns with automated humanizer anti-ban protection.
                </p>
              </FadeReveal>

              {/* Dual CTA Buttons with Shimmer & Elevation */}
              <FadeReveal direction="up" delayMs={280}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 rounded-2xl bg-[#25D366] hover:bg-[#1ebd5d] text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-[#25D366]/25 hover:shadow-xl hover:shadow-[#25D366]/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95 relative overflow-hidden">
                      {/* Light shine beam sweep */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />

                      <span>Deploy Gateway Console</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
                    </button>
                  </Link>

                  <Link href="#sandbox" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 group">
                      <Code className="h-4 w-4 text-emerald-600 transition-transform duration-200 group-hover:rotate-12" />
                      <span>Explore 86+ REST Endpoints</span>
                    </button>
                  </Link>
                </div>
              </FadeReveal>

              {/* Trust Indicators with Micro-Hover Bounces */}
              <FadeReveal direction="up" delayMs={360}>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2.5 sm:gap-6 pt-2 text-[11px] sm:text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors duration-200 cursor-default group">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#25D366] transition-transform duration-200 group-hover:scale-125 shrink-0" />
                    <span>100% Self-Hosted</span>
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors duration-200 cursor-default group">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#25D366] transition-transform duration-200 group-hover:scale-125 shrink-0" />
                    <span>0.00% Ban Rate</span>
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors duration-200 cursor-default group">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#25D366] transition-transform duration-200 group-hover:scale-125 shrink-0" />
                    <span>Multi-Tenant Baileys</span>
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-slate-900 transition-colors duration-200 cursor-default group">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#25D366] transition-transform duration-200 group-hover:scale-125 shrink-0" />
                    <span>AI Native</span>
                  </span>
                </div>
              </FadeReveal>
            </div>

            {/* Interactive 3D WebGL Gateway Canvas */}
            <FadeReveal direction="up" delayMs={420} className="mt-8 sm:mt-16">
              <HeroGateway3D />
            </FadeReveal>
          </div>
        </section>

        {/* ========================================================
            INFINITE MARQUEE TICKER
           ======================================================== */}
        <MarqueeTicker />

        {/* ========================================================
            TELEMETRY & PERFORMANCE BENCHMARK HUD
           ======================================================== */}
        <section className="py-10 sm:py-14 bg-slate-50/80 border-y border-slate-200/90 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
              {telemetryStats.map((stat, idx) => (
                <FadeReveal
                  key={stat.title}
                  direction="up"
                  delayMs={idx * 90}
                >
                  <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-400/80 hover:-translate-y-1.5 transition-all duration-300 group cursor-default h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className={`text-2xl sm:text-4xl font-bold font-mono tracking-tight ${stat.color} transition-transform duration-300 group-hover:scale-105 origin-left`}>
                          {stat.value}
                        </div>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" />
                      </div>

                      <div className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wider mt-1 ${stat.accent}`}>
                        {stat.title}
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-600 mt-1.5 sm:mt-2 font-normal leading-relaxed line-clamp-3 sm:line-clamp-none">
                        {stat.description}
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 group-hover:text-emerald-700 transition-colors">
                      <span>Verified</span>
                      <span className="font-semibold text-emerald-600">● LIVE</span>
                    </div>
                  </div>
                </FadeReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            INTERACTIVE 3D ANTI-BAN RADAR SIMULATOR
           ======================================================== */}
        <section id="anti-ban" className="py-6 sm:py-8 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeReveal direction="up" delayMs={100}>
              <AntiBanRadar3D />
            </FadeReveal>
          </div>
        </section>

        {/* ========================================================
            3D ARCHITECTURE & 6 CORE PILLARS MATRIX
           ======================================================== */}
        <section id="architecture" className="py-8 sm:py-12 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeReveal direction="up" delayMs={50}>
              <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
                <span className="text-xs font-semibold tracking-widest text-emerald-800 uppercase px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-3 shadow-xs">
                  SYSTEM CAPABILITIES
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight">
                  Engineered for High-Scale Enterprise WhatsApp Automation
                </h2>
                <p className="text-slate-600 text-xs sm:text-base mt-2 sm:mt-3 font-normal">
                  Every component is built from the ground up for strict reliability, instant event processing, and seamless developer workflows.
                </p>
              </div>
            </FadeReveal>

            <FadeReveal direction="up" delayMs={150}>
              <Features3DGrid />
            </FadeReveal>
          </div>
        </section>

        {/* ========================================================
            VISUAL CONVERSATIONAL FLOW BUILDER 3D
           ======================================================== */}
        <section id="flows" className="py-6 sm:py-8 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeReveal direction="up" delayMs={100}>
              <FlowPreview3D />
            </FadeReveal>
          </div>
        </section>

        {/* ========================================================
            INTERACTIVE DEVELOPER SANDBOX & TERMINAL
           ======================================================== */}
        <section id="sandbox" className="py-8 sm:py-12 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeReveal direction="up" delayMs={100}>
              <TerminalPlayground3D />
            </FadeReveal>
          </div>
        </section>

        {/* ========================================================
            HIGH-IMPACT 3D CALL TO ACTION
           ======================================================== */}
        <section className="py-14 sm:py-24 relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/50 to-slate-50 border-t border-slate-200">
          {/* Animated floating glow aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[18rem] bg-emerald-400/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-float-slow" />

          <FadeReveal direction="up" delayMs={100}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
                <Activity className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span>CLUSTER CAPACITY READY</span>
              </div>

              <h2 className="text-2xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Ready to automate your WhatsApp communication safely?
              </h2>
              <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto font-normal">
                Deploy your private gateway today. Manage sessions, build conversational AI agents, and send millions of messages with complete peace of mind.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 rounded-2xl bg-[#25D366] hover:bg-[#1ebd5d] text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-[#25D366]/25 hover:shadow-xl hover:shadow-[#25D366]/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />
                    <span>Enter Gateway Console</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
                  </button>
                </Link>
                <Link href="/docs" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 group">
                    <span>Read Full 86+ API Reference</span>
                    <ExternalLink className="h-4 w-4 text-emerald-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </Link>
              </div>
            </div>
          </FadeReveal>
        </section>
      </main>

      {/* ========================================================
          CLEAN ENTERPRISE FOOTER
         ======================================================== */}
      <footer className="border-t border-slate-200 bg-slate-50/90 py-14 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 shadow-xs border border-slate-200">
                  <Image
                    src="/logo.png"
                    alt="WHATSAPP SERVER Logo"
                    width={48}
                    height={48}
                    className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(37,211,102,0.3)]"
                  />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight font-triakis">
                  WHATSAPP SERVER Gateway
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-sm leading-relaxed font-normal">
                Mission-critical enterprise WhatsApp gateway and AI automation server.
                Designed for high throughput, absolute account safety, and complete
                self-hosted data privacy.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>All gateway clusters operational</span>
              </div>
            </div>

            {/* Links column 1 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li>
                  <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">
                    Dashboard Console
                  </Link>
                </li>
                <li>
                  <Link href="#anti-ban" className="hover:text-emerald-700 transition-colors">
                    Anti-Ban Engine
                  </Link>
                </li>
                <li>
                  <Link href="#architecture" className="hover:text-emerald-700 transition-colors">
                    Baileys Multi-Device
                  </Link>
                </li>
                <li>
                  <Link href="#flows" className="hover:text-emerald-700 transition-colors">
                    Visual Flow Builder
                  </Link>
                </li>
                <li>
                  <Link href="#sandbox" className="hover:text-emerald-700 transition-colors">
                    REST API Sandbox
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links column 2 */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Resources
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li>
                  <Link href="/docs" className="hover:text-emerald-700 transition-colors">
                    Swagger API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-emerald-700 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-emerald-700 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <p>© 2026 WHATSAPP SERVER. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span>Next.js 16 • Three.js 3D WebGL Core</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Powered by WHATSAPP SERVER</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
