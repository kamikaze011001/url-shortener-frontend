import { Outlet } from 'react-router'
import { useLogout, useMe } from '@/api/queries'
import { Button } from '@/components/ui/Button'

/**
 * The frame around every signed-in screen. A header and a content column — no sidebar,
 * because navigation for four screens is four screens' worth of chrome for nothing.
 */
export function AppShell() {
  const { data: owner } = useMe()
  const logout = useLogout()

  return (
    <div className="min-h-screen">
      <header className="border-ink bg-plate border-b-3">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-4 px-6 py-4">
          <p className="font-display mr-auto text-xl font-extrabold tracking-[-0.02em]">
            Switchboard
          </p>

          {owner ? (
            <>
              <p className="text-ink-soft font-mono text-[13px]">{owner.email}</p>
              <Button onClick={() => logout.mutate()} disabled={logout.isPending}>
                Sign out
              </Button>
            </>
          ) : null}
        </div>
      </header>

      <Outlet />
    </div>
  )
}
