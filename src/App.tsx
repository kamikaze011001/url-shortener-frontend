import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { ApiError } from './api/client'
import { keys } from './api/queries'
import { AppRoutes } from './routes'

/**
 * A 401 from *any* request means the session ended while the app was open — the JWT
 * expired, or someone signed out in another tab. There is no way to see that coming: the
 * cookie is `httpOnly`, so the app cannot inspect the token's expiry and find out early.
 *
 * Recording it as "signed out" in one place lets the route guard do what it already does,
 * instead of every screen learning to handle a dead session. Without this the user gets a
 * dashboard that answers nothing.
 */
function recordSignedOutOn401(error: unknown) {
  if (error instanceof ApiError && error.problem.status === 401) {
    queryClient.setQueryData(keys.me, null)
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: recordSignedOutOn401 }),
  mutationCache: new MutationCache({ onError: recordSignedOutOn401 }),
  defaultOptions: {
    queries: {
      // Every failure that reaches here is an `ApiError` carrying a Problem, and a 401 or
      // a 404 is a final answer — retrying it only delays the screen the user should be
      // seeing. A genuinely flaky network is not worth three seconds of nothing.
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
