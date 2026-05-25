'use client'

import { useEffect } from 'react'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cleanup: (() => void) | undefined

    async function init() {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])

      gsap.registerPlugin(ScrollTrigger)

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })

      const rafCallback = (time: number) => lenis.raf(time * 1000)
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(rafCallback)
      gsap.ticker.lagSmoothing(0)

      const ctx = gsap.context(() => {
        const sections = ['#about', '#assets', '#faq', '#whitelist']

        // H2 heading reveals
        sections.forEach((id) => {
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

        // Subtitle paragraphs in text-center blocks
        sections.forEach((id) => {
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

        // Pill badges in section text-center blocks
        sections.forEach((id) => {
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
        const featureCards = gsap.utils.toArray<HTMLElement>('.feature-card')
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

      cleanup = () => {
        lenis.destroy()
        gsap.ticker.remove(rafCallback)
        ctx.revert()
      }
    }

    init().catch(console.error)

    return () => cleanup?.()
  }, [])

  return <>{children}</>
}
