"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create particles
    const particles: Particle[] = []
    const particleCount = 30

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
      })
    }

    // Animation loop
    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle with glow
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        
        // Create gradient for glow effect
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 3
        )
        gradient.addColorStop(0, `rgba(58, 207, 133, ${particle.opacity})`)
        gradient.addColorStop(0.5, `rgba(157, 78, 221, ${particle.opacity * 0.5})`)
        gradient.addColorStop(1, "rgba(58, 207, 133, 0)")
        
        ctx.fillStyle = gradient
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
      style={{ mixBlendMode: "screen" }}
    />
  )
}

// Breathing glow component for cards
export function BreathingGlow({ color = "primary", className = "" }: { color?: "primary" | "accent" | "secondary"; className?: string }) {
  const colorMap = {
    primary: "from-primary/20 to-primary/5",
    accent: "from-accent/20 to-accent/5",
    secondary: "from-secondary/20 to-secondary/5",
  }

  return (
    <div
      className={`absolute inset-0 -z-10 rounded-lg bg-gradient-to-br ${colorMap[color]} blur-xl animate-pulse ${className}`}
      style={{ animationDuration: "3s" }}
    />
  )
}

// Dynamic gradient glow for header
export function HeaderGlow() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "4s", animationDelay: "0s" }}
      />
      <div
        className="absolute -top-1/2 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "5s", animationDelay: "1s" }}
      />
      <div
        className="absolute -top-1/2 left-1/2 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "6s", animationDelay: "2s" }}
      />
    </div>
  )
}

