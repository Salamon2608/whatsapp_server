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
  title: "WhatsApp Server | Self-Hosted WhatsApp API Gateway & Automation",
  description:
    "Self-hosted WhatsApp API gateway with multi-device Baileys engine, anti-ban throttling, autonomous agents, visual flow builder, and 86+ REST endpoints.",
  openGraph: {
    title: "WhatsApp Server | Self-Hosted WhatsApp API Gateway & Automation",
    description:
      "Self-hosted WhatsApp API gateway with multi-device Baileys engine, anti-ban throttling, autonomous agents, visual flow builder, and 86+ REST endpoints.",
    type: "website",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://wa-server.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Server | Self-Hosted WhatsApp API Gateway & Automation",
    description:
      "Self-hosted WhatsApp API gateway with multi-device Baileys engine, anti-ban throttling, autonomous agents, visual flow builder, and 86+ REST endpoints.",
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
      title: "P99 binary dispatch",
      description: "Direct Baileys binary socket pipeline with zero gateway proxy overhead.",
      color: "text-slate-900",
      accent: "text-emerald-700",
    },
    {
      value: "Adaptive",
      title: "Anti-ban throttling",
      description: "Heuristic typing simulation, reading gaze pacing, and queue jitter.",
      color: "text-emerald-700",
      accent: "text-emerald-700",
    },
    {
      value: "86+",
      title: "REST API endpoints",
      description: "OpenAPI specification covering messages, media, stickers, and polls.",
      color: "text-slate-900",
      accent: "text-slate-700",
    },
    {
      value: "100%",
      title: "Data sovereignty",
      description: "Your encryption keys, your database, your server. Zero external telemetry.",
      color: "text-slate-900",
      accent: "text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-500/20 selection:text-slate-950 relative overflow-x-hidden font-sans">
      {/* Background Grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Navigation Bar */}
      <Navbar3D version={version} />

      <main className="pt-4 sm:pt-10 space-y-20 sm:space-y-32">
        {/* ========================================================
            HERO SECTION
           ======================================================== */}
        <section className="relative pt-6 sm:pt-14 pb-4 sm:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              {/* Quiet Version / Context Badge */}
              <FadeReveal direction="up" delayMs={50}>
                <Link
                  href="#architecture"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"
                >
                  <span className="font-mono text-slate-500">{version}</span>
                  <span className="text-slate-300">•</span>
                  <span>Baileys v7 Multi-Device Core</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </FadeReveal>

              {/* Exact Technical Headline */}
              <FadeReveal direction="up" delayMs={100}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-950 tracking-[-0.03em] leading-[1.12]">
                  Self-hosted WhatsApp API gateway and automation server
                </h1>
              </FadeReveal>

              {/* Specific Subtitle */}
              <FadeReveal direction="up" delayMs={160}>
                <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                  Connect multiple WhatsApp numbers concurrently through Baileys binary sockets. Handle high-volume inbound media, configure automated workflows, and dispatch messages through 86+ REST endpoints.
                </p>
              </FadeReveal>

              {/* Two Actions */}
              <FadeReveal direction="up" delayMs={220}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto h-11 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
                      <span>Open dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>

                  <Link href="#sandbox" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto h-11 px-6 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-center gap-2">
                      <Code className="h-4 w-4 text-slate-600" />
                      <span>API playground</span>
                    </button>
                  </Link>
                </div>
              </FadeReveal>
            </div>

            {/* Interactive Gateway Canvas */}
            <FadeReveal direction="up" delayMs={300} className="mt-12 sm:mt-16">
              <HeroGateway3D />
            </FadeReveal>
          </div>
        </section>

        {/* ========================================================
            INFINITE MARQUEE TICKER
           ======================================================== */}
        <MarqueeTicker />

        {/* ========================================================
            TELEMETRY & PERFORMANCE BENCHMARK
           ======================================================== */}
        <section className="py-10 sm:py-14 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {telemetryStats.map((stat, idx) => (
                <FadeReveal
                  key={stat.title}
                  direction="up"
                  delayMs={idx * 80}
                >
                  <div className="p-5 rounded-xl bg-white border border-slate-200/80 h-full flex flex-col justify-between">
                    <div>
                      <div className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-slate-900">
                        {stat.value}
                      </div>

                      <div className="text-xs font-medium text-slate-500 mt-1">
                        {stat.title}
                      </div>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {stat.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Verified</span>
                    </div>
                  </div>
                </FadeReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            ANTI-BAN RADAR SIMULATOR
           ======================================================== */}
        <section id="anti-ban" className="py-6 sm:py-8 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeReveal direction="up" delayMs={100}>
              <AntiBanRadar3D />
            </FadeReveal>
          </div>
        </section>

        {/* ========================================================
            ARCHITECTURE & CAPABILITIES
           ======================================================== */}
        <section id="architecture" className="py-8 sm:py-12 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeReveal direction="up" delayMs={50}>
              <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                <span className="text-xs font-mono text-emerald-700 tracking-wide uppercase">
                  Capabilities
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight mt-1">
                  Engineered for high-volume WhatsApp automation
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Every component is built for strict socket reliability, instant event dispatch, and direct API integration.
                </p>
              </div>
            </FadeReveal>

            <FadeReveal direction="up" delayMs={150}>
              <Features3DGrid />
            </FadeReveal>
          </div>
        </section>

        {/* ========================================================
            VISUAL FLOW BUILDER
           ======================================================== */}
        <section id="flows" className="py-6 sm:py-8 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeReveal direction="up" delayMs={100}>
              <FlowPreview3D />
            </FadeReveal>
          </div>
        </section>

        {/* ========================================================
            DEVELOPER SANDBOX & TERMINAL
           ======================================================== */}
        <section id="sandbox" className="py-8 sm:py-12 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeReveal direction="up" delayMs={100}>
              <TerminalPlayground3D />
            </FadeReveal>
          </div>
        </section>

        {/* ========================================================
            CALL TO ACTION
           ======================================================== */}
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200">
          <FadeReveal direction="up" delayMs={100}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-4xl font-semibold text-slate-950 tracking-tight">
                Ready to deploy your private WhatsApp gateway?
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
                Deploy on your own infrastructure. Manage sessions, build conversational workflows, and dispatch messages with complete data privacy.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-11 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
                    <span>Enter dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/docs" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-11 px-6 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-center gap-2">
                    <span>API reference</span>
                    <ExternalLink className="h-4 w-4 text-slate-500" />
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
      <footer className="border-t border-slate-200 bg-slate-50/90 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 shadow-xs border border-slate-200">
                  <Image
                    src="/logo.png"
                    alt="WhatsApp Server Logo"
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
                  WhatsApp Server Gateway
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-sm leading-relaxed font-normal">
                Self-hosted WhatsApp API gateway and automation server.
                Designed for high throughput, reliable socket lifecycle, and complete data privacy.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                <span>All gateway clusters operational</span>
              </div>
            </div>

            {/* Links column 1 */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-xs font-normal text-slate-600">
                <li>
                  <Link href="/dashboard" className="hover:text-slate-950 transition-colors">
                    Dashboard console
                  </Link>
                </li>
                <li>
                  <Link href="#anti-ban" className="hover:text-slate-950 transition-colors">
                    Anti-ban engine
                  </Link>
                </li>
                <li>
                  <Link href="#architecture" className="hover:text-slate-950 transition-colors">
                    Baileys multi-device
                  </Link>
                </li>
                <li>
                  <Link href="#flows" className="hover:text-slate-950 transition-colors">
                    Visual flow builder
                  </Link>
                </li>
                <li>
                  <Link href="#sandbox" className="hover:text-slate-950 transition-colors">
                    REST API sandbox
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links column 2 */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 mb-3">
                Resources
              </h4>
              <ul className="space-y-2 text-xs font-normal text-slate-600">
                <li>
                  <Link href="/docs" className="hover:text-slate-950 transition-colors">
                    API reference
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-slate-950 transition-colors">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-slate-950 transition-colors">
                    Terms of service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-normal">
            <p>© 2026 WhatsApp Server. All rights reserved.</p>
            <p className="flex items-center gap-2">
              <span>Baileys v7 Multi-Device Core</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">Self-hosted Gateway</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
