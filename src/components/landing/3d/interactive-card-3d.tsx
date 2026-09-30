"use client";

import React, { useRef, useState } from "react";

interface InteractiveCard3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function InteractiveCard3D({
  children,
  className = "",
  glowColor = "#25D366",
}: InteractiveCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 10;
    const rotY = ((x - centerX) / centerX) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.22,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: "1000px" }}
      className="relative h-full"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px) scale3d(1.02, 1.02, 1.02)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
        }}
        className={`relative h-full rounded-3xl overflow-hidden transition-shadow duration-300 will-change-transform ${className}`}
      >
        {/* Dynamic Specular Glare Layer */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.4) 0%, transparent 65%)`,
          }}
        />

        {/* Ambient Corner Glow */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
          style={{ backgroundColor: glowColor }}
        />

        {/* Card Content with 3D Depth */}
        <div className="relative z-20 h-full">{children}</div>
      </div>
    </div>
  );
}
