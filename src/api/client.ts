/**
 * The one place a request leaves this app.
 *
 * `credentials: 'same-origin'` is what carries the session: the cookie is httpOnly, so
 * the app never sees or sends a token itself. In development Vite proxies /api to the
 * backend so this really is same-origin, exactly as it is behind Caddy in production.
 */
const BASE = '/api/v1'

/** RFC 9457. `code` is part of the contract and is what callers switch on; `title` and
 * `detail` are for humans and may be reworded at any time. */
export interface Problem {
  type: string
  title: string
  status: number
  detail?: string
  code: ProblemCode
  errors?: { field: string; message: string }[]
}

/**
 * Mirrors the enum in the contract. Written out rather than derived from the generated
 * schema because these are the values the UI branches on — a rename upstream should
 * break this line loudly, not silently widen to `string`.
 */
export type ProblemCode =
  | 'VALIDATION_FAILED'
  | 'UNAUTHENTICATED'
  | 'NOT_FOUND'
  | 'ALIAS_TAKEN'
  | 'RESERVED_ALIAS'
  | 'EMAIL_TAKEN'
  | 'INVALID_DESTINATION'
  | 'DESTINATION_NOT_ALLOWED'
  | 'RATE_LIMITED'
  | 'INTERNAL'

/** Thrown for every non-2xx response, so callers handle one failure shape. */
export class ApiError extends Error {
  // Written out rather than a constructor parameter property: `erasableSyntaxOnly` is
  // on, so TypeScript-only syntax that emits runtime code is rejected.
  readonly problem: Problem

  constructor(problem: Problem) {
    super(problem.detail ?? problem.title)
    this.name = 'ApiError'
    this.problem = problem
  }

  /** True when the field is the one the server rejected — used to mark inputs. */
  fieldError(field: string): string | undefined {
    return this.problem.errors?.find((e) => e.field === field)?.message
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    // A response that is not problem+json means something upstream of the application
    // answered — a proxy, a crash. Present it as INTERNAL rather than crashing on a
    // missing field.
    throw new ApiError(
      (body as Problem | null) ?? {
        type: 'about:blank',
        title: 'Request failed',
        status: response.status,
        code: 'INTERNAL',
      },
    )
  }
  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
