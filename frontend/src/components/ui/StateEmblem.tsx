/* eslint-disable @next/next/no-img-element */
"use client";

interface StateEmblemProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StateEmblem({ className = "", size = "md" }: StateEmblemProps) {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-11 w-auto",
    lg: "h-14 w-auto",
  };

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      {/* Official Ashoka Lion Capital Vector / Graphic Treatment */}
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTr9OzakyGLRHgdpKRa6i5vV8RfYOS8Mi83lEyG4YgytQ73IjlSqBh6W3ONEu1H2gWTWhphlyuBubp0HIZs20LKoMECb4Xi_r3SGBCeeAWzxVAHEyoXnGK7oudaPDwvW6-uvtTfy7QWHhnXHvsBYn31NT0ZKTxbaPhXTgTUlwEdzY_BL6sPgKv-OJNW5DGG_PDEFGYSaWv5tRid2ZHEeoxw-ZHsdiEAGb7TzwPEMMX9uo3bF_tfUpbhA"
        alt="State Emblem of India"
        className={`${sizeClasses[size]} object-contain`}
        loading="eager"
      />
    </div>
  );
}
