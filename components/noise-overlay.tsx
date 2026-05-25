'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function NoiseOverlay() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = !mounted || resolvedTheme !== 'light'

  return (
    <div
      className="grain-overlay"
      style={{ opacity: isDark ? 0.08 : 0.035 }}
      aria-hidden
    />
  )
}
