import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header              from '@/components/layout/Header'
import Footer              from '@/components/layout/Footer'
import VisualBuilderBridge from '@/components/VisualBuilderBridge'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title:       'Portfolio — Optimizely CMS + Next.js',
  description: 'Personal portfolio built with Next.js and Optimizely SaaS CMS.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg)] text-[var(--text)]">
        {/* Listens for Visual Builder postMessage events → router.refresh() */}
        <VisualBuilderBridge />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
