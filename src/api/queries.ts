import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, api } from './client'
import type {
  CreateLinkRequest,
  Link,
  LinkPage,
  LinkStatus,
  Owner,
  UpdateLinkRequest,
} from './types'

export const keys = {
  me: ['me'] as const,
  /** Every Link query starts with this, so one invalidate covers every page, filter
   *  and detail view at once. */
  links: ['links'] as const,
  link: (id: string) => ['links', 'detail', id] as const,
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

// ── links ────────────────────────────────────────────────────────────────────

export interface LinkListParams {
  page: number
  size: number
  /** Server-side substring match on Short Code or Destination. */
  search: string
  status: LinkStatus | ''
}

function linksPath({ page, size, search, status }: LinkListParams) {
  const query = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) query.set('search', search)
  if (status) query.set('status', status)
  return `/links?${query.toString()}`
}

/**
 * A page of the Owner's Links.
 *
 * `placeholderData` holds the previous page on screen while the next one loads. Without
 * it every keystroke in the search box empties the table and refills it, which reads as
 * the app breaking rather than as it working. It is also why there is no skeleton here:
 * there is nothing to cover, because the old rows never leave.
 */
export function useLinks(params: LinkListParams) {
  return useQuery({
    queryKey: [...keys.links, params],
    queryFn: () => api.get<LinkPage>(linksPath(params)),
    placeholderData: (previous) => previous,
  })
}

export function useCreateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateLinkRequest) => api.post<Link>('/links', request),
    // Invalidate rather than write the new Link into the cached page by hand: the server
    // decides the order, the page boundaries and the total, and a hand-patched list gets
    // all three wrong the moment a filter is active.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.links }),
  })
}

export function useLink(id: string) {
  return useQuery({
    queryKey: keys.link(id),
    queryFn: () => api.get<Link>(`/links/${id}`),
  })
}

/**
 * The response is written straight into the detail cache and the lists are invalidated.
 * Writing the response rather than refetching matters here: a PATCH answers with the Link
 * as the server now sees it, including `status` flipping to `EXPIRED` on its own when the
 * new `expiresAt` is in the past. Refetching would show the same thing a moment later;
 * this shows it immediately, and there is no window where the screen disagrees.
 */
export function useUpdateLink(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UpdateLinkRequest) => api.patch<Link>(`/links/${id}`, request),
    onSuccess: (link) => {
      queryClient.setQueryData(keys.link(id), link)
      void queryClient.invalidateQueries({ queryKey: keys.links })
    },
  })
}

/**
 * Soft delete. The Link stops resolving and leaves the list, but the row is kept and the
 * Short Code is never released — reusing a code would silently repoint a link somebody
 * has already shared. The UI says so at the point of confirmation.
 */
export function useDeleteLink(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.delete<void>(`/links/${id}`),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: keys.link(id) })
      void queryClient.invalidateQueries({ queryKey: keys.links })
    },
  })
}
