import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, api } from './client'
import type { Owner } from './types'

export const keys = {
  me: ['me'] as const,
}

/**
 * "Am I signed in?" — answered by a request, because the session cookie is `httpOnly`
 * and JavaScript cannot read it. There is no token in storage and there must never be
 * one; that is the whole point of the cookie (see CLAUDE.md).
 *
 * A 401 is resolved to `null` rather than thrown. Being signed out is a normal answer to
 * this question, not a failure, and collapsing it into the error channel would make every
 * caller distinguish "signed out" from "the network is down" by inspecting a status code.
 * With this, `data === null` means signed out and `isError` means something is actually
 * wrong.
 */
export function useMe() {
  return useQuery({
    queryKey: keys.me,
    queryFn: async () => {
      try {
        return await api.get<Owner>('/auth/me')
      } catch (error) {
        if (error instanceof ApiError && error.problem.status === 401) return null
        throw error
      }
    },
    staleTime: Infinity,
  })
}

/**
 * The session is written straight into the cache from the response body, so the app
 * renders the dashboard without a second round trip to `/auth/me` — the cookie is already
 * set by the time this resolves.
 */
function useSessionStart(path: '/auth/login' | '/auth/register') {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post<Owner>(path, credentials),
    onSuccess: (owner) => queryClient.setQueryData(keys.me, owner),
  })
}

export const useLogin = () => useSessionStart('/auth/login')
export const useRegister = () => useSessionStart('/auth/register')

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post<void>('/auth/logout'),
    onSuccess: () => {
      // Answer the session question first. `null` is what the route guard redirects on,
      // and it must reach the mounted observer.
      queryClient.setQueryData(keys.me, null)

      // Then drop everything else — every cached Link belongs to the Owner who just left.
      //
      // The order is not cosmetic, and `queryClient.clear()` is the wrong tool here even
      // though it reads like the right one. A mounted `useQuery` holds a reference to the
      // Query *object*; removing that object does not make the observer re-bind to a
      // later one created under the same key. So clearing first and writing `null`
      // afterwards leaves the guard subscribed to an orphan, still pending, and the user
      // stranded on a dashboard that is no longer theirs. Verified by doing exactly that.
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== keys.me[0] })
    },
  })
}
