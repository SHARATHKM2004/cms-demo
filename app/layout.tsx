import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header              from '@/components/layout/Header'
import Footer              from '@/components/layout/Footer'
import VisualBuilderBridge from '@/components/VisualBuilderBridge'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title:       'DemoSite — Optimizely CMS + Next.js',
  description: 'A demo marketing website powered by Optimizely CMS and Next.js.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {/* Listens for Visual Builder postMessage events → router.refresh() */}
        <VisualBuilderBridge />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
