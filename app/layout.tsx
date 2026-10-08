import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TV Online HD -Gazetv Futemax Canais filmes e Esportes Ao Vivo',
  description: 'Assista TV ao vivo online grátis. Conteúdo completo com canais de futebol, filmes, séries e programação 24 horas em alta definição.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: 'https://images.vexels.com/media/users/3/128877/isolated/preview/b012e0730a5f9c0c4566d887bbed95d1-icone-de-tv-plana.png',
        type: 'image/png',
        sizes: '96x96',
      },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="font-sans antialiased bg-background">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
