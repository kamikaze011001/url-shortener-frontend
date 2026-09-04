import { useState } from 'react'
import { Link as RouterLink, Navigate } from 'react-router'
import { ApiError } from '@/api/client'
import { useLogin, useMe, useRegister } from '@/api/queries'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Plate } from '@/components/ui/Plate'

/**
 * Sign in and register are one screen. They take the same two fields, hit endpoints with
 * the same shape, and differ only in wording — splitting them would duplicate the error
 * mapping, which is the only part with any substance in it.
 */
export function AuthScreen({ mode }: { mode: 'login' | 'register' }) {
  const { data: owner, isPending: sessionPending } = useMe()
  const login = useLogin()
  const register = useRegister()
  const submit = mode === 'login' ? login : register

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Already signed in? There is nothing to do here. Handled by redirecting rather than by
  // hiding the route, so a bookmarked /login still lands somewhere useful.
  if (sessionPending) return null
  if (owner) return <Navigate to="/" replace />

  const failure = submit.error instanceof ApiError ? submit.error : null

  return (
    <main className="mx-auto grid min-h-screen max-w-[1120px] content-center gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:gap-16">
      <div>
        <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
          Switchboard
        </p>
        <h1 className="font-display text-display mt-3">
          One string,
          <br />
          patched through.
        </h1>
        <p className="text-ink-soft text-lede mt-6 max-w-sm">
          Shorten a URL, point it wherever you like, and change where it goes without reprinting
          anything.
        </p>
      </div>

      <Plate className="p-6 md:p-8">
        <h2 className="font-display text-title">
          {mode === 'login' ? 'Sign in' : 'Create an account'}
        </h2>

        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            submit.mutate({ email, password })
          }}
        >
          <Field
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldError(failure, 'email', mode)}
          />

          <Field
            label="Password"
            type="password"
            name="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={mode === 'register' ? 8 : undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint={mode === 'register' ? 'At least 8 characters.' : undefined}
            error={fieldError(failure, 'password', mode)}
          />

          {formError(failure) ? (
            <p
              role="alert"
              className="border-signal shadow-plate-signal text-signal border-3 p-3 text-[13px] font-medium"
            >
              {formError(failure)}
            </p>
          ) : null}

          <Button type="submit" variant="primary" disabled={submit.isPending}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="text-ink-soft mt-6 text-[13px]">
          {mode === 'login' ? (
            <>
              No account yet?{' '}
              <RouterLink
                to="/register"
                className="text-ink underline decoration-2 underline-offset-4"
              >
                Create one
              </RouterLink>
            </>
          ) : (
            <>
              Already registered?{' '}
              <RouterLink
                to="/login"
                className="text-ink underline decoration-2 underline-offset-4"
              >
                Sign in
              </RouterLink>
            </>
          )}
        </p>
      </Plate>
    </main>
  )
}

/**
 * Maps a Problem onto the field the user has to fix. Switching on `code` and never on
 * `title` — the contract fixes `code`; the prose is for humans and may be reworded.
 */
function fieldError(failure: ApiError | null, field: string, mode: 'login' | 'register') {
  if (!failure) return undefined
  if (failure.problem.code === 'EMAIL_TAKEN' && field === 'email') {
    return mode === 'register' ? 'That email is already registered. Sign in instead.' : undefined
  }
  return failure.fieldError(field)
}

function formError(failure: ApiError | null) {
  if (!failure) return undefined
  switch (failure.problem.code) {
    // The server answers a wrong email and a wrong password identically, on purpose: a
    // distinguishable response tells an attacker which emails are registered. The UI has
    // no more information than the user does, so it says the same thing.
    case 'UNAUTHENTICATED':
      return 'Email or password is incorrect.'
    case 'RATE_LIMITED':
      return 'Too many attempts. Wait a minute and try again.'
    case 'EMAIL_TAKEN':
    case 'VALIDATION_FAILED':
      return undefined
    default:
      return failure.problem.detail ?? 'Something went wrong. Try again.'
  }
}
