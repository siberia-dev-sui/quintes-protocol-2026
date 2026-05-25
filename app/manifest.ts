import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Quintes Protocol',
    short_name: 'Quintes',
    description: 'Shariah-compliant DeFi yield protocol — 33% APY target, 200% overcollateralized on Arbitrum.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#FFC700',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
