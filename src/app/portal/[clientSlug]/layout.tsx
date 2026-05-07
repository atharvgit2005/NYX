import { Playfair_Display, Inter } from 'next/font/google'
import type { Metadata } from 'next'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-portal-display',
  display: 'swap',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-portal-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Brand Partner Portal',
  robots: { index: false, follow: false },
}

export default function PortalSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${playfair.variable} ${inter.variable}`}>
      {children}
    </div>
  )
}
