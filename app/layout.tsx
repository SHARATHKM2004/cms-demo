import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header              from '@/components/layout/Header'
import Footer              from '@/components/layout/Footer'
import VisualBuilderBridge from '@/components/VisualBuilderBridge'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title:       'My CMS Site',
  description: 'A sample website powered by Optimizely CMS and Next.js.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]">
        <VisualBuilderBridge />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
