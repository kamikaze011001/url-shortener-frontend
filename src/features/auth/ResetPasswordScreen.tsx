import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router'
import { ApiError } from '@/api/client'
import { useResetPassword } from '@/api/queries'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { FormAlert } from '@/components/ui/FormAlert'
import { Plate } from '@/components/ui/Plate'

/**
 * Setting a new password with the code.
 *
 * Takes the address as well as the code, because this screen is reachable without a
 * session — an Owner who has forgotten their password cannot sign in, which is the
 * situation. The code alone would not say whose password to change.
 *
 * On success every session for this Owner is gone, including any this browser held, so
 * the only place to go is the sign-in screen. That is stated before they submit, not
 * discovered afterwards.
 */
export function ResetPasswordScreen() {
  const reset = useResetPassword()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')

  const failure = reset.error instanceof ApiError ? reset.error : null

  return (
    <main className="mx-auto grid min-h-screen max-w-[1120px] content-center gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:gap-16">
      <div>
        <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
          Switchboard
        </p>
        <h1 className="font-display text-display mt-3">
          New
          <br />
          password.
        </h1>
        <p className="text-ink-soft text-lede mt-6 max-w-sm">
          Setting a new password signs you out everywhere else. Any other browser or device stops
          working immediately.
        </p>
      </div>

      <Plate className="p-6 md:p-8">
        <h2 className="font-display text-title">Set a new password</h2>

        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            reset.mutate(
              { email, code, password },
              // Straight to sign-in. There is no session left to land on a dashboard
              // with, and signing in with the new password is also the proof it worked.
              { onSuccess: () => void navigate('/login', { replace: true }) },
            )
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
            error={failure?.fieldError('email')}
          />

          <Field
            label="Reset code"
            name="code"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            className="font-mono"
            error={codeError(failure)}
          />

          <Field
            label="New password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint="At least 8 characters."
            error={failure?.fieldError('password')}
          />

          {formError(failure) ? <FormAlert>{formError(failure)}</FormAlert> : null}

          <Button
            type="submit"
            variant="primary"
            disabled={code.length !== 6 || password.length < 8 || reset.isPending}
          >
            Set password
          </Button>
        </form>

        <p className="text-ink-soft mt-6 text-[13px]">
          Need a code?{' '}
          <RouterLink
            to="/forgot-password"
            className="text-ink underline decoration-2 underline-offset-4"
          >
            Request one
          </RouterLink>
        </p>
      </Plate>
    </main>
  )
}

/**
 * An unknown address answers INVALID_CODE too, so this message has to be true for both
 * without hinting which happened — the server refuses to distinguish them on purpose.
 */
function codeError(failure: ApiError | null) {
  if (!failure) return undefined
  switch (failure.problem.code) {
    case 'INVALID_CODE':
      return 'That code is not correct. Check the digits and the address.'
    case 'CODE_EXPIRED':
      return 'That code has expired. Request a new one.'
    default:
      return failure.fieldError('code')
  }
}

function formError(failure: ApiError | null) {
  if (!failure) return undefined
  switch (failure.problem.code) {
    case 'INVALID_CODE':
    case 'CODE_EXPIRED':
    case 'VALIDATION_FAILED':
      return undefined
    case 'RATE_LIMITED':
      return 'Too many attempts. Wait a few minutes and try again.'
    default:
      return failure.problem.detail ?? 'Something went wrong. Try again.'
  }
}
