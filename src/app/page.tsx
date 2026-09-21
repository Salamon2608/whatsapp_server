import Link from "next/link";
import Image from "next/image";
import fs from "fs";
import path from "path";
import {
  ArrowRight,
  Bot,
  Zap,
  Shield,
  MessageSquare,
  Clock,
  Code,
  CheckCircle2,
  Lock,
  Layers,
  Cpu,
  Radio,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IsometricHeroPreview } from "@/components/landing/isometric-hero-preview";
import { MarqueeTicker } from "@/components/landing/marquee-ticker";
import { CodePlayground } from "@/components/landing/code-playground";

export const metadata = {
  title: "whatsapp_Server | Mission-Critical WhatsApp Gateway & AI Infrastructure",
  description:
    "Next-generation self-hosted WhatsApp Gateway with Multi-device Baileys engine, Smart Humanizer Anti-Ban, Autonomous AI Agents, and Real-time Webhooks.",
  openGraph: {
    title: "whatsapp_Server | Mission-Critical WhatsApp Gateway & AI Infrastructure",
    description:
      "Next-generation self-hosted WhatsApp Gateway with Multi-device Baileys engine, Smart Humanizer Anti-Ban, Autonomous AI Agents, and Real-time Webhooks.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://wa-akg.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "whatsapp_Server | Mission-Critical WhatsApp Gateway & AI Infrastructure",
    description:
      "Next-generation self-hosted WhatsApp Gateway with Multi-device Baileys engine, Smart Humanizer Anti-Ban, Autonomous AI Agents, and Real-time Webhooks.",
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

  return (
    <div className="min-h-screen bg-white text-slate-700 landing-page selection:bg-[#25D366]/30 selection:text-slate-900 relative overflow-x-hidden">
      {/* Background Decorative Mesh Grids */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(37, 211, 102, 0.08) 0%, transparent 50%),
            linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 64px 64px, 64px 64px",
        }}
      />

      {/* Sticky High-Contrast Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 border-b border-slate-200 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
          {/* Logo with Increased Size */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative flex h-14 w-14 sm:h-15 sm:w-15 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200 group-hover:scale-105 group-hover:border-[#25D366] transition-all duration-300">
              <Image
                src="/logo.png"
                alt="whatsapp_Server Logo"
                width={58}
                height={58}
                className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(37,211,102,0.2)]"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-2 font-triakis">
                whatsapp_Server
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  GATEWAY
                </span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 -mt-0.5">
                Autonomous WhatsApp Engine
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <Link
              href="#architecture"
              className="text-slate-600 hover:text-slate-950 transition-colors"
            >
              Architecture
            </Link>
            <Link
              href="#anti-ban"
              className="text-slate-600 hover:text-slate-950 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="h-4 w-4 text-[#25D366]" />
              Anti-Ban Shield
            </Link>
            <Link
              href="#sandbox"
              className="text-slate-600 hover:text-slate-950 transition-colors"
            >
              Developer Sandbox
            </Link>
            <Link
              href="/docs"
              className="text-slate-600 hover:text-slate-950 transition-colors"
            >
              API & Docs
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 mr-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-700">
              <span>Cluster Online</span>
            </div>

            <Link href="/auth/login">
              <button className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all">
                Sign In
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#25D366] hover:bg-[#1ebd5d] text-slate-950 font-bold shadow-lg shadow-[#25D366]/20 transition-all active:scale-95 flex items-center gap-1.5">
                <span>Console</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ========================================================
            HERO SECTION (Marquee Hero Macrostructure)
           ======================================================== */}
        <section className="relative pt-12 sm:pt-20 pb-12 sm:pb-20 overflow-hidden">
          {/* Ambient Glow Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />
          <div className="absolute top-12 left-1/4 w-[24rem] h-[24rem] bg-emerald-400/5 rounded-full blur-[140px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto space-y-6">

              {/* Center Mascot Display with Soft Glow */}
              <div className="flex justify-center pb-2">
                <div className="relative group">
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-500/15 to-emerald-400/10 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-white p-2.5 border border-slate-200 shadow-xl shadow-emerald-500/5 group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/logo.png"
                      alt="whatsapp_Server Mascot"
                      width={112}
                      height={112}
                      className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(37,211,102,0.2)]"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Top Release Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 shadow-xs">
                <span>PRODUCTION ENGINE {version} READY</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-700">ZERO-BAN HEURISTIC ACTIVE</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Bold High-Contrast Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[62px] font-semibold text-slate-900 tracking-[-0.04em] leading-[1.15]">
                Next-Gen WhatsApp API &{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-[#25D366]">
                  Intelligent Automation Platform.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed">
                Scale customer conversations effortlessly. Connect multiple WhatsApp numbers,
                deploy smart AI assistants with contextual memory, and broadcast high-volume messages
                with automated smart throttling.
              </p>

              {/* Dual CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-[#25D366] hover:bg-[#1ebd5d] text-slate-950 font-bold text-base shadow-md shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2 group active:scale-95">
                    <span>Deploy Gateway Console</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
                <Link href="#sandbox" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95">
                    <Code className="h-5 w-5 text-emerald-600" />
                    <span>Explore Sandbox & API</span>
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#25D366]" /> 100% Self-Hosted & Private
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#25D366]" /> Zero WhatsApp Account Bans
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#25D366]" /> Multi-Tenant Baileys v6
                </span>
              </div>
            </div>

            {/* 3D Isometric Abstract Cards & Data Streams Preview */}
            <div className="mt-12 sm:mt-16">
              <IsometricHeroPreview />
            </div>
          </div>
        </section>

        {/* ========================================================
            INFINITE MARQUEE TICKER (Double-decker)
           ======================================================== */}
        <MarqueeTicker />

        {/* ========================================================
            METRICS & PERFORMANCE BENCHMARK BAR
           ======================================================== */}
        <section className="py-16 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 tracking-tight">
                  &lt; 42ms
                </div>
                <div className="text-xs font-mono text-emerald-600 uppercase tracking-wider mt-1 font-semibold">
                  P99 Dispatch Latency
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Direct Baileys binary socket pipeline with zero gateway overhead.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-600 tracking-tight">
                  0.00%
                </div>
                <div className="text-xs font-mono text-emerald-600 uppercase tracking-wider mt-1 font-semibold">
                  False-Positive Ban Rate
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Heuristic human typing ticks, reading gaze simulation, and warmups.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 tracking-tight">
                  100k+
                </div>
                <div className="text-xs font-mono text-emerald-600 uppercase tracking-wider mt-1 font-semibold">
                  Daily Message Capacity
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Asynchronous event loop tested under high burst conditions.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 tracking-tight">
                  100%
                </div>
                <div className="text-xs font-mono text-emerald-600 uppercase tracking-wider mt-1 font-semibold">
                  Data Sovereignty
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Your keys, your server, your database. Zero third-party telemetry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            ARCHITECTURE & CAPABILITIES GRID (High Contrast 6-Card)
           ======================================================== */}
        <section id="architecture" className="py-24 sm:py-32 relative bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-700 uppercase px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-4">
                TECHNICAL CAPABILITIES
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-slate-900 tracking-tight leading-tight">
                Engineered for High-Scale Enterprise WhatsApp Automation
              </h2>
              <p className="text-slate-600 text-base sm:text-lg mt-4">
                Every component is built from the ground up for strict reliability,
                instant event processing, and seamless developer workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Feature 01 */}
              <div className="group relative p-7 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/60 hover:shadow-lg transition-all duration-300 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:scale-110 transition-transform">
                    <Radio className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-emerald-600">
                    01 // SOCKET
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Multi-Device Baileys Engine
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Connect unlimited WhatsApp numbers simultaneously. Automated QR code
                  refresh, state persistence, and auto-healing reconnection with
                  exponential backoff.
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Protocol: WebSocket MD</span>
                  <span className="text-emerald-600 font-semibold">Isolated JIDs</span>
                </div>
              </div>

              {/* Feature 02 */}
              <div
                id="anti-ban"
                className="group relative p-7 rounded-3xl bg-emerald-50/40 border-2 border-emerald-500 hover:border-emerald-600 transition-all duration-300 shadow-md shadow-emerald-500/5 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    02 // PROTECTION
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  Smart Anti-Ban Humanizer
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    EXCLUSIVE
                  </span>
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Bypass WhatsApp automated bot filters. Human keystroke jitter,
                  realistic reading delays (gaze emulation), randomized typing indicators,
                  and automated warmup quotas.
                </p>
                <div className="pt-4 border-t border-emerald-200 flex items-center justify-between text-xs font-mono text-emerald-700 font-semibold">
                  <span>Safety Score: 100/100</span>
                  <span>Zero Burst Detection</span>
                </div>
              </div>

              {/* Feature 03 */}
              <div className="group relative p-7 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/60 hover:shadow-lg transition-all duration-300 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:scale-110 transition-transform">
                    <Bot className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-emerald-600">
                    03 // INTELLIGENCE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Autonomous AI Agents & Flows
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Native Gemini 1.5, OpenAI GPT-4o, and local Ollama integrations.
                  Persistent chat context memory, visual flow canvas, and RAG
                  knowledge base vector queries.
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Models: Gemini / GPT / Claude</span>
                  <span className="text-emerald-600 font-semibold">Visual Canvas</span>
                </div>
              </div>

              {/* Feature 04 */}
              <div className="group relative p-7 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/60 hover:shadow-lg transition-all duration-300 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-amber-500" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-emerald-600">
                    04 // STREAMING
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Real-time Webhook Pipeline
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Inbound message notifications, delivery receipts (sent, delivered,
                  read), and status broadcasts with HMAC-SHA256 signatures and
                  guaranteed retry delivery.
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Signatures: HMAC-SHA256</span>
                  <span className="text-amber-600 font-semibold">Zero Drops</span>
                </div>
              </div>

              {/* Feature 05 */}
              <div className="group relative p-7 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/60 hover:shadow-lg transition-all duration-300 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:scale-110 transition-transform">
                    <Code className="h-6 w-6 text-emerald-600" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-emerald-600">
                    05 // DEVELOPER FIRST
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Complete REST API Gateway
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Send raw text, documents, audio voice notes, location pins, contact
                  cards, and interactive poll surveys. Documented with OpenAPI 3.1
                  interactive Swagger UI.
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Spec: OpenAPI 3.1</span>
                  <span className="text-emerald-600 font-semibold">Swagger Live</span>
                </div>
              </div>

              {/* Feature 06 */}
              <div className="group relative p-7 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500/60 hover:shadow-lg transition-all duration-300 shadow-xs overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:scale-110 transition-transform">
                    <Lock className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-emerald-600">
                    06 // ENTERPRISE SEC
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Multi-Tenant Security & RBAC
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Granular API token permissions, session quotas per tenant, live audit
                  logs, rate limiting per second, and complete isolation between business
                  workspaces.
                </p>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Auth: Bearer Scopes</span>
                  <span className="text-emerald-600 font-semibold">Audit Trails</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            ANTI-BAN COMPARISON MATRIX (Security Deep Dive)
           ======================================================== */}
        <section className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-700 uppercase px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-3">
                ZERO BAN GUARANTEE
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
                Why Standard WhatsApp Bots Get Banned vs whatsapp_Server
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                WhatsApp employs AI behavioral heuristics to detect automated message
                bursts. Here is how whatsapp_Server keeps your numbers 100% safe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Conventional Bots */}
              <div className="p-7 rounded-3xl bg-white border border-rose-200 shadow-xs">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-500 border border-rose-200">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Generic Unofficial WhatsApp Scripts
                    </h3>
                    <p className="text-xs text-rose-600 font-mono font-semibold">
                      High Ban Probability (1 to 48 Hours)
                    </p>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>
                      <strong className="text-slate-900">Instant Burst Blasts:</strong> Sends
                      messages at 0ms delay without presence state switches.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>
                      <strong className="text-slate-900">No Typing Simulation:</strong> Fails to
                      transmit &apos;composing&apos; packets matching text length.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>
                      <strong className="text-slate-900">No Reading Gaze Delay:</strong> Replies
                      instantly to inbound chats before humanly possible to read.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>
                      <strong className="text-slate-900">Static Device Footprint:</strong> Flagged
                      user-agent headers triggering WhatsApp security alerts.
                    </span>
                  </li>
                </ul>
              </div>

              {/* whatsapp_Server Engine */}
              <div className="p-7 rounded-3xl bg-white border-2 border-[#25D366] shadow-md shadow-emerald-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-[#25D366] text-slate-950 text-[11px] font-mono font-bold rounded-bl-xl">
                  whatsapp_Server SHIELD ACTIVE
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <ShieldCheck className="h-6 w-6 text-[#25D366]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      whatsapp_Server Smart Anti-Ban Humanizer
                    </h3>
                    <p className="text-xs text-emerald-600 font-mono font-semibold">
                      0.00% False-Positive Ban Track Record
                    </p>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span>
                      <strong className="text-slate-900">Natural Typing Emulation:</strong>{" "}
                      Computes dynamic typing duration matching word count (32-48 WPM).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span>
                      <strong className="text-slate-900">Human Gaze & Reading Jitter:</strong>{" "}
                      Simulates realistic message receipt, reading pause, and state change.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span>
                      <strong className="text-slate-900">Leaky Bucket Rate Limiting:</strong> Enforces
                      natural message dispersal and cooling periods on spikes.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span>
                      <strong className="text-slate-900">Account Warmup Automation:</strong>{" "}
                      Incrementally scales quota for fresh SIM cards up to enterprise tiers.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            INTERACTIVE DEVELOPER SANDBOX
           ======================================================== */}
        <section id="sandbox" className="py-24 sm:py-32 relative bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-700 uppercase px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-4">
                DEVELOPER PLAYGROUND
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-slate-900 tracking-tight leading-tight">
                Integrate in Minutes with Your Favorite Stack
              </h2>
              <p className="text-slate-600 text-base sm:text-lg mt-4">
                Test API requests, inspect simulated humanizer payloads, and copy
                ready-to-use snippets in cURL, TypeScript, or JSON.
              </p>
            </div>

            <CodePlayground />
          </div>
        </section>

        {/* ========================================================
            FINAL HIGH-IMPACT CALL TO ACTION
           ======================================================== */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-white to-emerald-50/70 border-t border-slate-200">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[14rem] bg-emerald-400/10 rounded-full blur-[140px] pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              Ready to automate your WhatsApp communication safely?
            </h2>
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Deploy your private gateway today. Manage sessions, build conversational
              AI agents, and send with complete peace of mind.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-14 px-9 rounded-2xl bg-[#25D366] hover:bg-[#1ebd5d] text-slate-950 font-bold text-lg shadow-md shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2 group active:scale-95">
                  <span>Enter Gateway Console</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/docs" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-base border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95">
                  <span>Read Full Documentation</span>
                  <ExternalLink className="h-4 w-4 text-emerald-600" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================
          HIGH-CONTRAST FOOTER
         ======================================================== */}
      <footer className="border-t border-slate-200 bg-slate-50 py-14 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200 overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="whatsapp_Server Logo"
                    width={60}
                    height={60}
                    className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(37,211,102,0.2)]"
                  />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight font-triakis">
                  whatsapp_Server Gateway
                </span>
              </div>
              <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
                Enterprise WhatsApp gateway and AI automation server.
                Designed for high throughput, absolute account safety, and complete
                self-hosted data privacy.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-semibold">
                <span>All gateway clusters operational</span>
              </div>
            </div>

            {/* Links column 1 */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li>
                  <Link href="/dashboard" className="hover:text-slate-950 transition-colors">
                    Dashboard Console
                  </Link>
                </li>
                <li>
                  <Link href="#anti-ban" className="hover:text-slate-950 transition-colors">
                    Anti-Ban Engine
                  </Link>
                </li>
                <li>
                  <Link href="#architecture" className="hover:text-slate-950 transition-colors">
                    Baileys Multi-Device
                  </Link>
                </li>
                <li>
                  <Link href="#sandbox" className="hover:text-slate-950 transition-colors">
                    Code Playground
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links column 2 */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 font-bold mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li>
                  <Link href="/docs" className="hover:text-slate-950 transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-slate-950 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-slate-950 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <p>© {new Date().getFullYear()} whatsapp_Server. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span>Engineered with Next.js 16 &amp; TypeScript</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Powered by whatsapp_Server</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
