'use client'

/**
 * VisualBuilderBridge
 *
 * A zero-render client component that listens for postMessage events from
 * Optimizely CMS Visual Builder (running in the parent iframe) and triggers
 * a Next.js router refresh so preview content updates instantly — no full
 * page reload required.
 *
 * Supported Optimizely CMS message types:
 *   contentSaved, previewUpdated, block:save, content:update
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CMS_ORIGIN_PATTERN = /optimizely\.com$/i

export default function VisualBuilderBridge() {
  const router = useRouter()

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Only trust messages from *.optimizely.com
      if (!CMS_ORIGIN_PATTERN.test(event.origin)) return

      const data = event.data
      if (!data || typeof data !== 'object') return

      const type = (data.type ?? data.action ?? data.event ?? '') as string
      if (
        type === 'contentSaved'    ||
        type === 'previewUpdated'  ||
        type === 'block:save'      ||
        type === 'content:update'
      ) {
        router.refresh()
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [router])

  return null
}
