import { Route, Routes } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { ApiKeysScreen } from '@/features/keys/ApiKeysScreen'
import { AuthScreen } from '@/features/auth/AuthScreen'
import { ForgotPasswordScreen } from '@/features/auth/ForgotPasswordScreen'
import { ResetPasswordScreen } from '@/features/auth/ResetPasswordScreen'
import { VerifyEmailScreen } from '@/features/auth/VerifyEmailScreen'
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
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/reset-password" element={<ResetPasswordScreen />} />

      {/* Outside RequireSession's shell on purpose: it needs a session but not a
          verified one, and it must stay reachable to the Owner who is stuck. */}
      <Route path="/verify-email" element={<VerifyEmailScreen />} />

      <Route element={<RequireSession />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/links/:id" element={<LinkDetailScreen />} />
          <Route path="/api-keys" element={<ApiKeysScreen />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  )
}
