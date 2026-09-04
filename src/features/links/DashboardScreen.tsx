import { useMe } from '@/api/queries'
import { Plate } from '@/components/ui/Plate'

/**
 * Placeholder. The create form and the Link table land here in the next step; this exists
 * so the router, the session gate and the shell can be exercised on their own.
 */
export function DashboardScreen() {
  const { data: owner } = useMe()

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-16">
      <h1 className="font-display text-display">Your links</h1>
      <Plate className="mt-10 p-6">
        <p className="text-ink-soft text-[15px]">
          Signed in as <span className="text-ink font-mono">{owner?.email}</span>. The create form
          and the link table arrive in the next step.
        </p>
      </Plate>
    </main>
  )
}
