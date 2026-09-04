import { useState } from 'react'
import { Link as RouterLink } from 'react-router'
import { ApiError } from '@/api/client'
import { useForgotPassword } from '@/api/queries'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Field } from '@/components/ui/Field'
import { FormAlert } from '@/components/ui/FormAlert'
import { Plate } from '@/components/ui/Plate'
import { RetryCountdown } from '@/components/ui/RetryCountdown'

/**
 * Asking for a reset code.
 *
 * The success message is carefully worded: **"if that address is registered"**. The
 * server answers identically either way (FR-1.12), so claiming "we sent you an email"
 * would be a statement this screen cannot back up — and saying "no such account" would
 * hand back the account-enumeration oracle the uniform 401 on login exists to close.
 *
 * The cost is real and is accepted: someone who mistypes their address gets a
 * reassuring message and no email. The wording is what makes that recoverable, because
 * it never promises delivery.
 */
export function ForgotPasswordScreen() {
  const forgot = useForgotPassword()
  const [email, setEmail] = useState('')

  const failure = forgot.error instanceof ApiError ? forgot.error : null

  return (
    <main className="mx-auto grid min-h-screen max-w-[1120px] content-center gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:gap-16">
      <div>
        <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
          Switchboard
        </p>
        <h1 className="font-display text-display mt-3">
          Forgotten
          <br />
          password.
        </h1>
        <p className="text-ink-soft text-lede mt-6 max-w-sm">
          We will send a six-digit code to your address. You will use it to set a new password.
        </p>
      </div>

      <Plate className="p-6 md:p-8">
        <h2 className="font-display text-title">Send a reset code</h2>

        {forgot.isSuccess ? (
          <>
            <p className="text-ink-soft mt-6 text-[15px]">
              If that address is registered, a code is on its way. It expires in ten minutes.
            </p>
            <ButtonLink to="/reset-password" className="mt-6">
              I have a code
            </ButtonLink>
          </>
        ) : (
          <form
            className="mt-6 flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              forgot.mutate(email)
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

            {failure?.problem.code === 'RATE_LIMITED' ? (
              <FormAlert>
                <RetryCountdown
                  key={forgot.failureCount}
                  seconds={failure.retryAfterSeconds ?? 3600}
                />
              </FormAlert>
            ) : failure && failure.problem.code !== 'VALIDATION_FAILED' ? (
              <FormAlert>Something went wrong. Try again.</FormAlert>
            ) : null}

            <Button type="submit" variant="primary" disabled={forgot.isPending}>
              Send code
            </Button>
          </form>
        )}

        <p className="text-ink-soft mt-6 text-[13px]">
          Remembered it?{' '}
          <RouterLink to="/login" className="text-ink underline decoration-2 underline-offset-4">
            Sign in
          </RouterLink>
        </p>
      </Plate>
    </main>
  )
}
