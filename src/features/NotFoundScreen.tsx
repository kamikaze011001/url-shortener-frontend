import { Link as RouterLink } from 'react-router'

/**
 * The app's own 404, which is a different thing from a Short Code that does not resolve:
 * that one is answered by the backend on the short host and never reaches this bundle.
 */
export function NotFoundScreen() {
  return (
    <main className="mx-auto max-w-[1120px] px-6 py-24">
      <p className="text-ink-soft font-mono text-xs font-semibold tracking-[0.08em] uppercase">
        404
      </p>
      <h1 className="font-display text-display mt-3">No such page.</h1>
      <p className="text-ink-soft text-lede mt-6 max-w-md">
        The address is not part of this app.{' '}
        <RouterLink to="/" className="text-ink underline decoration-2 underline-offset-4">
          Go to your links
        </RouterLink>
        .
      </p>
    </main>
  )
}
