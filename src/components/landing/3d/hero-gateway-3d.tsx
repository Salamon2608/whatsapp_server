"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Activity,
  ShieldCheck,
  Zap,
  Bot,
  Radio,
  Cpu,
  Layers,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

interface NodeData {
  id: string;
  name: string;
  role: string;
  badge: string;
  color: string;
  pos: [number, number, number];
  icon: any;
  metric: string;
  description: string;
  tags: string[];
  telemetry: { label: string; value: string }[];
}

const ALL_NODES: NodeData[] = [
  {
    id: "core",
    name: "Central WhatsApp Core",
    role: "Binary WebSocket MD Gateway",
    badge: "GATEWAY ENGINE",
    color: "#25D366",
    pos: [0, 0, 0],
    icon: Radio,
    metric: "<42ms Latency",
    description:
      "Mission-critical binary state machine managing multiple WhatsApp phone numbers simultaneously. Handles authenticated state persistence, auto-reconnect backoff, and sub-42ms packet routing.",
    tags: ["Multi-Device Pool", "AuthState Encryption", "Zero-Proxy Binary Pipeline"],
    telemetry: [
      { label: "Dispatch Latency", value: "<42ms P99" },
      { label: "Throughput", value: "100k+ msgs/day" },
      { label: "Session Health", value: "100% Operational" },
    ],
  },
  {
    id: "baileys",
    name: "Baileys MD v7 Core",
    role: "Multi-Session Driver",
    badge: "PROTOCOL CORE",
    color: "#10B981",
    pos: [-3.2, 1.2, 0],
    icon: Cpu,
    metric: "0.04s Ping",
    description:
      "Direct multi-device WebSocket connection to WhatsApp servers without third-party middleman dependencies. Streams dynamic QR codes and auto-heals disconnected sessions.",
    tags: ["Isolated JID Instances", "Dynamic QR Streaming", "Automated Session Healing"],
    telemetry: [
      { label: "Socket Ping", value: "0.04s" },
      { label: "Tenant Isolation", value: "Active" },
      { label: "QR State", value: "Real-Time WebSocket" },
    ],
  },
  {
    id: "antiban",
    name: "Smart Anti-Ban Humanizer",
    role: "Heuristic Safety Suite",
    badge: "0.00% BAN RATE",
    color: "#22c55e",
    pos: [3.2, 1.5, 0.5],
    icon: ShieldCheck,
    metric: "100% Safety Score",
    description:
      "Advanced heuristic human typing emulation (32-48 WPM), reading gaze pause delays, and spintax phrase randomization to bypass WhatsApp's automated bot detection filters.",
    tags: ["Dynamic WPM Jitter", "Gaze Reading Delays", "Spintax Text Mutations"],
    telemetry: [
      { label: "False-Positive Rate", value: "0.00%" },
      { label: "Typing Cadence", value: "42 WPM (Jitter)" },
      { label: "Safety Shield", value: "Optimal" },
    ],
  },
  {
    id: "ai",
    name: "Premium Quality Agents",
    role: "Vector RAG Intelligence",
    badge: "MULTI-LLM",
    color: "#06B6D4",
    pos: [-2.6, -1.8, 1],
    icon: Bot,
    metric: "Gemini & GPT-4o",
    description:
      "Native integrations for Google Gemini 1.5, OpenAI GPT-4o, Anthropic Claude, and local Ollama. Queries custom business documents and knowledge bases for intelligent customer replies.",
    tags: ["Vector Document RAG", "Context Memory Buffers", "Automated Human Handoff"],
    telemetry: [
      { label: "Inference Latency", value: "142ms" },
      { label: "Token Tracking", value: "Real-Time" },
      { label: "Active Models", value: "Gemini / GPT / Claude" },
    ],
  },
  {
    id: "webhooks",
    name: "Real-Time Webhook Pipeline",
    role: "Event Dispatch Stream",
    badge: "ZERO DROPPED",
    color: "#F59E0B",
    pos: [2.8, -1.6, -0.5],
    icon: Zap,
    metric: "HMAC-SHA256 Signed",
    description:
      "Guaranteed event delivery pipeline forwarding inbound chats, delivery receipts (sent, delivered, read), and connection state changes with cryptographic HMAC signatures and automatic retry queues.",
    tags: ["Cryptographic Signatures", "Exponential Retries", "Bi-Directional Sockets"],
    telemetry: [
      { label: "Delivery Guarantee", value: "100% ACK" },
      { label: "Security", value: "HMAC-SHA256" },
      { label: "Retry Queue", value: "Enabled" },
    ],
  },
];

export function HeroGateway3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  // Default to the Central Core so it's NEVER empty, even before hovering!
  const [selectedNode, setSelectedNode] = useState<NodeData>(ALL_NODES[0]);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [activePackets, setActivePackets] = useState<number>(154);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isVisible = true;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.018);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 9.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const centerLight = new THREE.PointLight(0x25d366, 8, 24);
    centerLight.position.set(0, 0, 2);
    scene.add(centerLight);

    const cyanRimLight = new THREE.PointLight(0x0284c7, 3.5, 25);
    cyanRimLight.position.set(-6, 4, -4);
    scene.add(cyanRimLight);

    const amberLight = new THREE.PointLight(0xd97706, 2.5, 18);
    amberLight.position.set(5, -4, -3);
    scene.add(amberLight);

    // 3. Central Core Group (WhatsApp Gateway Engine)
    const centralGroup = new THREE.Group();
    scene.add(centralGroup);

    // Hit test array containing meshes with valid NodeData
    const interactableMeshes: THREE.Mesh[] = [];

    // Central Core Hit Target (invisible large sphere for easy hovering)
    const coreHitGeo = new THREE.SphereGeometry(1.6, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const coreHitMesh = new THREE.Mesh(coreHitGeo, hitMat);
    coreHitMesh.userData = ALL_NODES[0];
    centralGroup.add(coreHitMesh);
    interactableMeshes.push(coreHitMesh);

    // Inner glowing icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(1.25, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      emissive: 0x22c55e,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.85,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.userData = ALL_NODES[0];
    centralGroup.add(coreMesh);
    interactableMeshes.push(coreMesh);

    // Inner solid core
    const innerGeo = new THREE.SphereGeometry(0.72, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.95,
      roughness: 0.1,
      metalness: 0.8,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.userData = ALL_NODES[0];
    centralGroup.add(innerMesh);
    interactableMeshes.push(innerMesh);

    // Orbital Rings
    const createRing = (radius: number, tiltX: number, tiltY: number, color: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.02, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.55,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = tiltX;
      ringMesh.rotation.y = tiltY;
      return ringMesh;
    };

    const ring1 = createRing(1.9, Math.PI / 3, Math.PI / 6, 0x25d366);
    const ring2 = createRing(2.35, -Math.PI / 4, Math.PI / 4, 0x0284c7);
    const ring3 = createRing(2.75, Math.PI / 2.2, -Math.PI / 5, 0x10b981);
    centralGroup.add(ring1);
    centralGroup.add(ring2);
    centralGroup.add(ring3);

    // 4. Satellite Nodes Group
    const satelliteNodesData = ALL_NODES.slice(1);
    const satelliteMeshes: THREE.Mesh[] = [];
    const beamLines: THREE.Line[] = [];

    satelliteNodesData.forEach((node) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...node.pos);
      scene.add(nodeGroup);

      // Hit sphere for responsive hovering
      const satHitGeo = new THREE.SphereGeometry(0.9, 16, 16);
      const satHitMesh = new THREE.Mesh(satHitGeo, hitMat);
      satHitMesh.userData = node;
      nodeGroup.add(satHitMesh);
      interactableMeshes.push(satHitMesh);

      // Visible sphere
      const nodeGeo = new THREE.SphereGeometry(0.42, 24, 24);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.color),
        emissive: new THREE.Color(node.color),
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.userData = node;
      nodeGroup.add(mesh);
      satelliteMeshes.push(mesh);
      interactableMeshes.push(mesh);

      // Outer wireframe halo
      const haloGeo = new THREE.IcosahedronGeometry(0.58, 0);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.userData = node;
      mesh.add(halo);
      interactableMeshes.push(halo);

      // Connection beam line
      const beamGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(...node.pos),
      ]);
      const beamMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(node.color),
        transparent: true,
        opacity: 0.45,
      });
      const beam = new THREE.Line(beamGeo, beamMat);
      scene.add(beam);
      beamLines.push(beam);
    });

    // 5. Data Packet Flow Particles
    const packetCount = 200;
    const packetGeo = new THREE.BufferGeometry();
    const packetPositions = new Float32Array(packetCount * 3);
    const packetProgress = new Float32Array(packetCount);
    const packetTargets = new Uint8Array(packetCount);

    for (let i = 0; i < packetCount; i++) {
      packetProgress[i] = Math.random();
      packetTargets[i] = i % satelliteNodesData.length;
    }

    packetGeo.setAttribute("position", new THREE.BufferAttribute(packetPositions, 3));

    const packetMat = new THREE.PointsMaterial({
      color: 0x16a34a,
      size: 0.085,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const packetSystem = new THREE.Points(packetGeo, packetMat);
    scene.add(packetSystem);

    // 6. Ambient Floating Matrix Particles
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 22;
      starPositions[i + 1] = (Math.random() - 0.5) * 16;
      starPositions[i + 2] = (Math.random() - 0.5) * 14;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.035,
      transparent: true,
      opacity: 0.4,
    });
    const starSystem = new THREE.Points(starGeo, starMat);
    scene.add(starSystem);

    // 7. Interactive Parallax & Raycasting
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Raycaster for robust node hovering
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handlePointerHover = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(interactableMeshes, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        // Search up the hierarchy until valid NodeData is found
        while (hitObj && (!hitObj.userData || !hitObj.userData.name) && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.userData && hitObj.userData.name) {
          setSelectedNode(hitObj.userData as NodeData);
          setIsHovering(true);
          container.style.cursor = "pointer";
          return;
        }
      }

      setIsHovering(false);
      container.style.cursor = "default";
    };

    container.addEventListener("mousemove", handlePointerHover);

    // 8. Visibility optimization
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // FPS tracking
      frameCount++;
      const now = performance.now();
      if (now - lastFpsUpdate >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsUpdate = now;
      }

      // Parallax smooth camera lerp
      targetX += (mouseX * 1.5 - targetX) * 0.05;
      targetY += (mouseY * 1.2 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      // Core rotation
      centralGroup.rotation.y = elapsedTime * 0.4;
      centralGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;

      ring1.rotation.z = elapsedTime * 0.5;
      ring2.rotation.z = -elapsedTime * 0.35;
      ring3.rotation.z = elapsedTime * 0.65;

      coreMesh.rotation.y = -elapsedTime * 0.6;
      innerMesh.scale.setScalar(1 + Math.sin(elapsedTime * 3) * 0.06);

      // Satellite node oscillations
      satelliteMeshes.forEach((mesh, idx) => {
        const parent = mesh.parent;
        if (parent) {
          parent.position.y =
            satelliteNodesData[idx].pos[1] + Math.sin(elapsedTime * 2 + idx) * 0.15;
        }

        const halo = mesh.children[0];
        if (halo) {
          halo.rotation.y = elapsedTime * 1.2;
          halo.rotation.x = elapsedTime * 0.8;
        }

        // Update beam line points dynamically
        const beam = beamLines[idx];
        if (beam && parent) {
          const positions = beam.geometry.attributes.position.array as Float32Array;
          positions[3] = parent.position.x;
          positions[4] = parent.position.y;
          positions[5] = parent.position.z;
          beam.geometry.attributes.position.needsUpdate = true;
        }
      });

      // Update data packet flows
      const posArray = packetSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < packetCount; i++) {
        packetProgress[i] += 0.012;
        if (packetProgress[i] > 1) {
          packetProgress[i] = 0;
        }

        const t = packetProgress[i];
        const targetNode = satelliteNodesData[packetTargets[i]];
        const targetMesh = satelliteMeshes[packetTargets[i]];
        const currentTargetY = targetMesh?.parent ? targetMesh.parent.position.y : targetNode.pos[1];

        if (i % 2 === 0) {
          posArray[i * 3] = THREE.MathUtils.lerp(0, targetNode.pos[0], t);
          posArray[i * 3 + 1] = THREE.MathUtils.lerp(0, currentTargetY, t);
          posArray[i * 3 + 2] = THREE.MathUtils.lerp(0, targetNode.pos[2], t);
        } else {
          posArray[i * 3] = THREE.MathUtils.lerp(targetNode.pos[0], 0, t);
          posArray[i * 3 + 1] = THREE.MathUtils.lerp(currentTargetY, 0, t);
          posArray[i * 3 + 2] = THREE.MathUtils.lerp(targetNode.pos[2], 0, t);
        }
      }
      packetSystem.geometry.attributes.position.needsUpdate = true;

      // Stars drift
      starSystem.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    const packetInterval = setInterval(() => {
      setActivePackets((prev) => prev + Math.floor(Math.random() * 7) - 2);
    }, 1500);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(packetInterval);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mousemove", handlePointerHover);
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
    };
  }, []);

  const IconComponent = selectedNode.icon;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 border border-slate-200/90 shadow-2xl shadow-slate-200/60 font-manrope">
      {/* 3D WebGL Canvas Viewport */}
      <div className="relative w-full h-[320px] xs:h-[360px] sm:h-[480px] lg:h-[540px]">
        <div ref={mountRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Ambient Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.035) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top Left HUD Telemetry Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex flex-col gap-1.5 sm:gap-2 pointer-events-none">
          <div className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-[11px] sm:text-xs font-mono text-slate-800 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-[10px] sm:text-[11px] text-slate-900">
              GATEWAY MATRIX
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-semibold">{fps} FPS</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-lg bg-white/85 border border-slate-200/80 backdrop-blur-xs text-[11px] font-mono text-slate-600 shadow-xs">
            <span>
              Active Packets: <strong className="text-emerald-700">{activePackets}/s</strong>
            </span>
            <span>•</span>
            <span>
              Binary Socket: <strong className="text-cyan-700">CONNECTED</strong>
            </span>
          </div>
        </div>

        {/* Top Right Cluster Health */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-mono text-slate-700 shadow-sm">
          <Activity className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          <span>P99: &lt;42ms</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-bold">Zero Ban Active</span>
        </div>

        {/* Quick Hint Overlay */}
        <div className="absolute top-18 right-4 z-20 hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-slate-200/60 text-[10px] font-mono text-slate-500 shadow-xs">
          <Info className="h-3 w-3 text-emerald-600" />
          <span>Hover any 3D node or tap buttons below to inspect</span>
        </div>
      </div>

      {/* Interactive Subsystem Tabs Selector (Touch-friendly horizontal scroll on mobile) */}
      <div className="relative z-20 px-3 sm:px-8 py-2.5 sm:py-3 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            Subsystem Nodes:
          </span>
          <span className="sm:hidden text-[10px] font-mono text-slate-400">
            Swipe ➔
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 sm:flex-wrap no-scrollbar">
          {ALL_NODES.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                onMouseEnter={() => setSelectedNode(node)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 border whitespace-nowrap shrink-0 active:scale-95 ${
                  isSelected
                    ? "bg-[#25D366] text-slate-950 border-[#25D366] shadow-sm font-bold scale-[1.02]"
                    : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300 shadow-xs"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: node.color }}
                />
                <span>{node.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Technical Dossier HUD Card (ALWAYS VISIBLE & DEEPLY INFORMATIVE) */}
      <div className="relative z-20 p-4 sm:p-7 bg-white/95 border-t border-slate-200/80 backdrop-blur-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
          {/* Left Column: Title, Role, and Detailed Explanation */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                className="p-2 sm:p-2.5 rounded-xl text-white shadow-sm shrink-0"
                style={{ backgroundColor: selectedNode.color }}
              >
                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    {selectedNode.name}
                  </h4>
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {selectedNode.badge}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-tight">
                  {selectedNode.role} • <span className="text-emerald-700">{selectedNode.metric}</span>
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {selectedNode.description}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
              {selectedNode.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-slate-100/80 border border-slate-200 text-[11px] sm:text-xs font-medium text-slate-700 shadow-xs"
                >
                  <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Live Telemetry Metrics Box */}
          <div className="lg:col-span-4 rounded-2xl bg-slate-50 border border-slate-200/90 p-3.5 sm:p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                Telemetry Diagnostics
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-2.5">
              {selectedNode.telemetry.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-xs font-mono bg-white sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none border border-slate-200/60 sm:border-0"
                >
                  <span className="text-slate-500 truncate">{stat.label}:</span>
                  <strong className="text-slate-900 font-semibold truncate">{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
