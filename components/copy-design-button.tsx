'use client'

import { useState } from 'react'
import { PARTICLE_CONFIG } from './gl'

const DESIGN_CONFIG = `QUINTES PROTOCOL — Design Config
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Brand Colors
  Gold (primary):   #FFC700
  Gold (light):     #D4A500
  Cyan (accent):    #00E0FF
  BG dark:          #000000
  BG light:         #f8f7f2

Typography
  Display:          Sentient (serif italic)
  Body / UI:        Geist Mono

Particle System
  Speed:            ${PARTICLE_CONFIG.speed}
  Focus:            ${PARTICLE_CONFIG.focus}
  Aperture:         ${PARTICLE_CONFIG.aperture}
  Noise scale:      ${PARTICLE_CONFIG.noiseScale}
  Noise intensity:  ${PARTICLE_CONFIG.noiseIntensity}
  Time scale:       ${PARTICLE_CONFIG.timeScale}
  Point size:       ${PARTICLE_CONFIG.pointSize}
  Opacity:          ${PARTICLE_CONFIG.opacity}
  Plane scale:      ${PARTICLE_CONFIG.planeScale}
  Simulation size:  ${PARTICLE_CONFIG.size}px

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
quintes.org`

export function CopyDesignButton({ isDark }: { isDark: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(DESIGN_CONFIG)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`font-mono text-[11px] tracking-widest transition-all duration-300 px-3 py-1.5 rounded border ${
        isDark
          ? 'text-white/30 border-white/10 hover:text-white/60 hover:border-white/25'
          : 'text-black/30 border-black/10 hover:text-black/60 hover:border-black/25'
      }`}
      title="Copy design config to clipboard"
    >
      {copied ? '[ copied ]' : '[ copy config ]'}
    </button>
  )
}
