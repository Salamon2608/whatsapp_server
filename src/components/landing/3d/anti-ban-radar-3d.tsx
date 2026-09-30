"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ShieldCheck, ShieldAlert, Zap, Activity, Sliders, Play, RotateCcw } from "lucide-react";

export function AntiBanRadar3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"protected" | "unprotected">("protected");
  const [burstRate, setBurstRate] = useState<number>(35); // Messages per burst
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [banRiskScore, setBanRiskScore] = useState<number>(0);
  const [typingCadence, setTypingCadence] = useState<string>("42 WPM (Human)");

  // State refs for Three.js animation loop access
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const burstRef = useRef(burstRate);
  burstRef.current = burstRate;

  useEffect(() => {
    if (mode === "protected") {
      setBanRiskScore(0);
      setTypingCadence(`${38 + Math.floor(burstRate * 0.15)} WPM (Dynamic Jitter)`);
    } else {
      setBanRiskScore(Math.min(99, Math.round(burstRate * 2.4)));
      setTypingCadence("0ms Burst (No Presence Packet)");
    }
  }, [mode, burstRate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isVisible = true;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b10, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x25d366, 4, 15);
    mainLight.position.set(0, 2, 4);
    scene.add(mainLight);

    // 3. Central Protective Shield Dome (whatsapp_Server Safety Sphere)
    const domeGeo = new THREE.SphereGeometry(1.8, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.7);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x25d366,
      emissive: 0x052e16,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.9,
    });
    const shieldDome = new THREE.Mesh(domeGeo, domeMat);
    shieldDome.position.y = -0.5;
    shieldDome.rotation.x = Math.PI;
    scene.add(shieldDome);

    // Inner Phone / SIM Avatar in Center
    const simGeo = new THREE.BoxGeometry(0.7, 1.2, 0.12);
    const simMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8,
    });
    const simMesh = new THREE.Mesh(simGeo, simMat);
    simMesh.position.y = 0.2;
    scene.add(simMesh);

    // Glow border around the SIM
    const simWireGeo = new THREE.BoxGeometry(0.74, 1.24, 0.14);
    const simWireMat = new THREE.MeshBasicMaterial({
      color: 0x25d366,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const simWire = new THREE.Mesh(simWireGeo, simWireMat);
    simMesh.add(simWire);

    // 4. Wave Particle Waveform Rings (Cadence Monitor)
    const ringCount = 3;
    const ringMeshes: THREE.Line[] = [];

    for (let r = 0; r < ringCount; r++) {
      const radius = 2.4 + r * 0.5;
      const segments = 64;
      const points: THREE.Vector3[] = [];
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, -0.6, Math.sin(theta) * radius));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
      const ringLineMat = new THREE.LineBasicMaterial({
        color: 0x25d366,
        transparent: true,
        opacity: 0.4 - r * 0.1,
      });
      const ringLine = new THREE.Line(ringGeo, ringLineMat);
      scene.add(ringLine);
      ringMeshes.push(ringLine);
    }

    // 5. Message Particle Streams (Approaching the WhatsApp AI Detection Filter)
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleAngles[i] = Math.random() * Math.PI * 2;
      particleRadii[i] = 2.8 + Math.random() * 2.5;
      particleSpeeds[i] = 0.02 + Math.random() * 0.03;

      particlePositions[i * 3] = Math.cos(particleAngles[i]) * particleRadii[i];
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      particlePositions[i * 3 + 2] = Math.sin(particleAngles[i]) * particleRadii[i];
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x25d366,
      size: 0.09,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 6. Interactive Visibility Observer
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    // 7. Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // 8. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();
      const currentMode = modeRef.current;
      const currentBurst = burstRef.current;

      // Color tuning based on mode
      if (currentMode === "protected") {
        domeMat.color.setHex(0x25d366);
        domeMat.opacity = 0.5 + Math.sin(elapsed * 2) * 0.1;
        simWireMat.color.setHex(0x25d366);
        particleMat.color.setHex(0x25d366);
        mainLight.color.setHex(0x25d366);
      } else {
        // Red alert state for raw script
        const flash = Math.sin(elapsed * 8) > 0 ? 0xf43f5e : 0xbe123c;
        domeMat.color.setHex(0xe11d48);
        domeMat.opacity = 0.25;
        simWireMat.color.setHex(flash);
        particleMat.color.setHex(0xf43f5e);
        mainLight.color.setHex(0xf43f5e);
      }

      // Rotate Shield and Phone
      shieldDome.rotation.y = elapsed * 0.35;
      simMesh.rotation.y = Math.sin(elapsed * 0.8) * 0.25;

      // Pulse rings
      ringMeshes.forEach((ring, idx) => {
        const scale = 1 + Math.sin(elapsed * 2 + idx) * 0.08;
        ring.scale.set(scale, 1, scale);
      });

      // Update particle positions
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      const speedFactor = currentMode === "protected" ? 0.015 : 0.045 + (currentBurst / 100) * 0.04;

      for (let i = 0; i < particleCount; i++) {
        particleRadii[i] -= speedFactor;
        if (particleRadii[i] < 0.6) {
          particleRadii[i] = 3.8 + Math.random() * 1.5;
        }

        // Unprotected = erratic jitter spikes; Protected = smooth harmonic wave
        let jitter = 0;
        if (currentMode === "unprotected") {
          jitter = (Math.random() - 0.5) * 0.4;
        } else {
          jitter = Math.sin(elapsed * 3 + particleAngles[i]) * 0.08;
        }

        positions[i * 3] = Math.cos(particleAngles[i]) * particleRadii[i] + jitter;
        positions[i * 3 + 1] = Math.sin(elapsed * 2 + i) * 0.4 + jitter;
        positions[i * 3 + 2] = Math.sin(particleAngles[i]) * particleRadii[i];
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Camera gentle hover
      camera.position.x = Math.sin(elapsed * 0.3) * 0.4;
      camera.position.y = Math.cos(elapsed * 0.4) * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-8 shadow-xl shadow-slate-200/50 overflow-hidden font-manrope">
      {/* Background radial glow */}
      <div
        className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
          mode === "protected" ? "bg-emerald-500/10" : "bg-rose-500/15"
        }`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
        {/* Left Column: Interactive 3D Canvas Visualizer */}
        <div className="lg:col-span-7 relative h-[280px] xs:h-[320px] sm:h-[420px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-lg">
          <div ref={mountRef} className="absolute inset-0 w-full h-full z-10" />

          {/* Top Overlay Badge */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-[10px] sm:text-xs font-mono">
            {mode === "protected" ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                SHIELD ACTIVE: 100% SAFE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold animate-pulse">
                <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                BAN RISK: CRITICAL ({banRiskScore}%)
              </span>
            )}
          </div>

          {/* Bottom Telemetry HUD (Mobile-friendly 3-col layout) */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 grid grid-cols-3 gap-1 px-2.5 py-1.5 sm:flex sm:items-center sm:justify-between sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[10px] sm:text-[11px] font-mono text-slate-300">
            <div className="truncate text-center sm:text-left">
              <span className="text-slate-500 block sm:inline">Cadence: </span>
              <strong className={mode === "protected" ? "text-emerald-400" : "text-rose-400"}>
                {mode === "protected" ? "Human Jitter" : "0ms Burst"}
              </strong>
            </div>
            <div className="truncate text-center">
              <span className="text-slate-500 block sm:inline">Gaze: </span>
              <strong className="text-cyan-400">{mode === "protected" ? "1.4s" : "0.0s"}</strong>
            </div>
            <div className="truncate text-center sm:text-right">
              <span className="text-slate-500 block sm:inline">Spintax: </span>
              <strong className="text-amber-400">{mode === "protected" ? "MUTATED" : "STATIC"}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Simulator Controls */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3">
              <span>LIVE 3D HEURISTIC SIMULATOR</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Test WhatsApp Bot Detection In Real-Time
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 sm:mt-2 leading-relaxed font-normal">
              Toggle between standard burst scripts and whatsapp_Server’s Anti-Ban
              Humanizer to inspect how WhatsApp filters analyze packet cadences.
            </p>
          </div>

          {/* Mode Selector Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 sm:p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setMode("protected")}
              className={`py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 ${
                mode === "protected"
                  ? "bg-[#25D366] text-slate-950 shadow-md shadow-[#25D366]/25 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate">whatsapp_Server Shield</span>
            </button>
            <button
              onClick={() => setMode("unprotected")}
              className={`py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 ${
                mode === "unprotected"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/25 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate">Generic Bot Script</span>
            </button>
          </div>

          {/* Burst Volume Slider */}
          <div className="space-y-2.5 sm:space-y-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 flex items-center gap-1.5 text-[11px] sm:text-xs">
                <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                Dispatch Burst Intensity
              </span>
              <span className="text-emerald-700 font-bold font-mono text-[11px] sm:text-xs">{burstRate} msgs / min</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={burstRate}
              onChange={(e) => setBurstRate(Number(e.target.value))}
              className="w-full accent-[#25D366] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] sm:text-[11px] font-medium text-slate-500">
              <span>Warmup Pace (10)</span>
              <span>Enterprise Volume (100)</span>
            </div>
          </div>

          {/* Key Advantages Summary */}
          <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs font-medium">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Leaky-Bucket Jitter Algorithm prevents algorithmic flags</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 shrink-0" />
              <span>Realistic presence state transitions (`composing` & `paused`)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0" />
              <span>Multi-tenant rate limits enforced per unique JID connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
