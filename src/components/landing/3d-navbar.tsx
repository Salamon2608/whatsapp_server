"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface NavbarProps {
  version?: string;
}

export function Navbar3D({ version = "v1.6.4" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    {
      name: "Architecture",
      href: "#architecture",
    },
    {
      name: "Anti-Ban",
      href: "#anti-ban",
      hasIcon: true,
    },
    {
      name: "Flow Canvas",
      href: "#flows",
    },
    {
      name: "Sandbox",
      href: "#sandbox",
    },
    {
      name: "Docs",
      href: "/docs",
      external: true,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 font-manrope ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs"
          : "bg-white/85 backdrop-blur-md border-b border-slate-200/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo (Single-Line Clean Lockup) */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white p-1 border border-slate-200 group-hover:border-[#25D366] shadow-xs group-hover:scale-105 transition-all duration-200 overflow-hidden">
            <Image
              src="/logo.png"
              alt="WHATSAPP SERVER Logo"
              width={38}
              height={38}
              className="h-full w-full object-contain filter drop-shadow-[0_2px_4px_rgba(37,211,102,0.25)]"
              priority
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
              WHATSAPP SERVER
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
              GATEWAY
            </span>
          </div>
        </Link>

        {/* Center: Clean Navigation Links (Single-Line Guaranteed with whitespace-nowrap) */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-2 relative"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {navLinks.map((link, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <Link
                key={link.name}
                href={link.href}
                onMouseEnter={() => setHoveredIndex(idx)}
                className={`relative px-3.5 py-2 text-sm font-semibold transition-colors duration-150 flex items-center gap-1.5 rounded-xl whitespace-nowrap ${
                  isHovered ? "text-slate-950" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {/* Gliding Background Pill */}
                {isHovered && (
                  <span className="absolute inset-0 bg-slate-100 rounded-xl -z-10 transition-all duration-150 animate-in fade-in" />
                )}

                {link.hasIcon && (
                  <ShieldCheck
                    className={`h-4 w-4 transition-transform duration-150 shrink-0 ${
                      isHovered ? "text-[#25D366]" : "text-emerald-600"
                    }`}
                  />
                )}

                <span className="whitespace-nowrap">{link.name}</span>

                {link.external && (
                  <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Clean CTAs (Online Indication Removed completely) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sign In Link */}
          <Link href="/auth/login" className="hidden sm:inline-flex">
            <button className="px-3.5 py-2 text-sm font-semibold rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors whitespace-nowrap active:scale-95">
              Sign In
            </button>
          </Link>

          {/* Console CTA Button */}
          <Link href="/dashboard">
            <button className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-[#25D366] hover:bg-[#1ebd5d] text-slate-950 shadow-xs hover:shadow-sm transition-all duration-150 active:scale-95 flex items-center gap-1.5 whitespace-nowrap">
              <span>Console</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors active:scale-90"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 border-t border-slate-200 bg-white shadow-xl space-y-2.5 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 mb-1">
            <span className="font-semibold text-slate-800">
              WHATSAPP SERVER {version}
            </span>
            <span className="text-emerald-700 font-mono font-bold">Production Ready</span>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-50 active:scale-[0.98] transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  {link.hasIcon && <ShieldCheck className="h-4 w-4 text-[#25D366]" />}
                  <span className="whitespace-nowrap">{link.name}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>

          {/* Mobile Drawer Bottom Action CTAs */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebd5d] text-slate-950 font-bold text-sm shadow-xs transition-all active:scale-[0.98]"
            >
              <span>Launch Production Console</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors active:scale-[0.98]"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
