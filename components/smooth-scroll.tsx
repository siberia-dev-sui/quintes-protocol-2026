'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const lenisRef = useRef<any>(null)
  const rafCallbackRef = useRef<((time: number) => void) | null>(null)
  const gsapRef = useRef<any>(null)
  const ScrollTriggerRef = useRef<any>(null)

  // Lenis + GSAP imports — only once
  useEffect(() => {
    async function initCore() {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])

      gsap.registerPlugin(ScrollTrigger)
      gsapRef.current = gsap
      ScrollTriggerRef.current = ScrollTrigger

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
      lenisRef.current = lenis

      const rafCallback = (time: number) => lenis.raf(time * 1000)
      rafCallbackRef.current = rafCallback
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(rafCallback)
      gsap.ticker.lagSmoothing(0)
    }

    initCore().catch(console.error)

    return () => {
      lenisRef.current?.destroy()
      if (gsapRef.current && rafCallbackRef.current) {
        gsapRef.current.ticker.remove(rafCallbackRef.current)
      }
    }
  }, [])

  // GSAP animations — re-run every time theme settles so both modes get the effect
  useEffect(() => {
    if (!resolvedTheme) return

    const gsap = gsapRef.current
    const ScrollTrigger = ScrollTriggerRef.current

    // If GSAP isn't loaded yet, wait for it
    if (!gsap || !ScrollTrigger) {
      const timer = setTimeout(() => {
        const g = gsapRef.current
        const st = ScrollTriggerRef.current
        if (g && st) setupAnimations(g, st)
      }, 400)
      return () => clearTimeout(timer)
    }

    setupAnimations(gsap, ScrollTrigger)
  }, [resolvedTheme])

  return <>{children}</>
}

function setupAnimations(gsap: any, ScrollTrigger: any) {
  // Kill all existing scroll triggers before re-creating
  ScrollTrigger.getAll().forEach((t: any) => t.kill())

  const ctx = gsap.context(() => {
    const sections = ['#about', '#assets', '#faq', '#whitelist']

    // H2 heading reveals
    sections.forEach((id: string) => {
      const h2 = document.querySelector(`${id} h2`)
      if (!h2) return
      gsap.fromTo(h2,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: h2, start: 'top 88%', once: true },
        }
      )
    })

    // Subtitle paragraphs
    sections.forEach((id: string) => {
      const p = document.querySelector(`${id} .text-center p`)
      if (!p) return
      gsap.fromTo(p,
        { y: 35, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.12,
          scrollTrigger: { trigger: p, start: 'top 90%', once: true },
        }
      )
    })

    // Pill badges
    sections.forEach((id: string) => {
      const pill = document.querySelector(`${id} .text-center > div`)
      if (!pill) return
      gsap.fromTo(pill,
        { scale: 0.85, opacity: 0, y: 15 },
        {
          scale: 1, opacity: 1, y: 0,
          duration: 0.5,
          ease: 'back.out(1.7)',
          scrollTrigger: { trigger: pill, start: 'top 92%', once: true },
        }
      )
    })

    // Feature cards stagger
    const featureCards = gsap.utils.toArray('.feature-card') as HTMLElement[]
    if (featureCards.length) {
      gsap.fromTo(featureCards,
        { y: 70, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: featureCards[0],
            start: 'top 85%',
            once: true,
          },
        }
      )
    }
  })

  return ctx
}
