import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { ApiError } from './api/client'
import { keys } from './api/queries'
import { ErrorBoundary } from './components/ErrorBoundary'
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

      // On, and this reverses an earlier default that was never given a reason.
      //
      // The way a Click count actually goes stale is not that the reader sat still — it
      // is that they copied a short link, opened it somewhere else or sent it to
      // somebody, and came back. That is a focus event, not a button press, which is why
      // the dashboard gets this instead of a refresh control: its header already carries
      // four filters and a search box, and the one thing in it that was not a filter
      // would sit among four that were.
      //
      // The detail screen keeps its explicit button as well, for the case this cannot
      // cover — a reader who never leaves the page and wants to look again.
      refetchOnWindowFocus: true,

      // What keeps the line above from being chatty. Without it every tab switch
      // refetches everything on screen; with it, only data older than half a minute is
      // reconsidered. Half a minute is the right order of magnitude because Click counts
      // are approximate by design (FR-5.5) — this is a number that need not be exact,
      // and paying for exactness on every alt-tab would buy nothing anyone can perceive.
      staleTime: 30_000,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
