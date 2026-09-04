import { Route, Routes } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { AuthScreen } from '@/features/auth/AuthScreen'
import { RequireSession } from '@/features/auth/RequireSession'
import { DashboardScreen } from '@/features/links/DashboardScreen'
import { LinkDetailScreen } from '@/features/links/LinkDetailScreen'
import { NotFoundScreen } from '@/features/NotFoundScreen'

/**
 * Declarative routes rather than a data router: TanStack Query already owns fetching,
 * caching and invalidation, so route loaders would be a second, competing answer to the
 * same question.
 *
 * The whole signed-in area sits under one `RequireSession`, which is why no screen inside
 * it handles a missing Owner.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthScreen mode="login" />} />
      <Route path="/register" element={<AuthScreen mode="register" />} />

      <Route element={<RequireSession />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/links/:id" element={<LinkDetailScreen />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  )
}
