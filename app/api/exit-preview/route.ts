/**
 * GET /api/exit-preview?path=/about
 *
 * Disables Draft Mode and returns to the live page.
 * The "Exit Preview" link in DraftBanner.tsx calls this.
 */
import { draftMode } from 'next/headers'
import { redirect }  from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const returnPath = searchParams.get('path') ?? '/'

  const draft = await draftMode()
  draft.disable()

  redirect(returnPath)
}
