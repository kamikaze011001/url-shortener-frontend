import { Navigate, Outlet } from 'react-router'
import { useMe } from '@/api/queries'

/**
 * The gate every signed-in screen sits behind, so no screen below it has to ask whether
 * an Owner exists.
 *
 * Three states, not two — the session lives in an `httpOnly` cookie, so knowing whether
 * one exists costs a request:
 *
 *   pending  → render nothing. Deliberately not a spinner: this resolves in around ten
 *              milliseconds, and a spinner that flashes and vanishes reads as a glitch.
 *   null     → signed out; go to /login.
 *   Owner    → render the app.
 *
 * `isError` (the network is down, the backend is not running) also lands on /login, which
 * is honest: we cannot show anyone's Links without reaching the server.
 */
export function RequireSession() {
  const { data: owner, isPending } = useMe()

  if (isPending) return null
  if (!owner) return <Navigate to="/login" replace />

  return <Outlet />
}
