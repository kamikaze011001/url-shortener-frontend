import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { ApiError } from '@/api/client'
import { useMe, useResendVerification, useVerifyEmail } from '@/api/queries'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { FormAlert } from '@/components/ui/FormAlert'
import { Plate } from '@/components/ui/Plate'
import { RetryCountdown } from '@/components/ui/RetryCountdown'

/**
 * Confirming the address, with the code from the email.
 *
 * Reachable while unverified, which is the whole point — an Owner who cannot get past
 * this screen must still be able to ask for another code from it. That is why
 * verification does not gate signing in (ADR-0016): gating login would put the resend
 * button behind the door it is meant to open.
 */
export function VerifyEmailScreen() {
  const { data: owner, isPending } = useMe()
  const verify = useVerifyEmail()
  const resend = useResendVerification()
  const navigate = useNavigate()

  const [code, setCode] = useState('')

  if (isPending) return null
  if (!owner) return <Navigate to="/login" replace />
  if (owner.emailVerified) return <Navigate to="/" replace />

  const failure = verify.error instanceof ApiError ? verify.error : null
  const resendFailure = resend.error instanceof ApiError ? resend.error : null

  return (
    <main className="mx-auto grid min-h-screen max-w-[1120px] content-center gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:gap-16">
      <div>
        <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
          Switchboard
        </p>
        <h1 className="font-display text-display mt-3">
          Check your
          <br />
          inbox.
        </h1>
        <p className="text-ink-soft text-lede mt-6 max-w-sm">
          We sent a six-digit code to{' '}
          <span className="text-ink font-mono text-[15px]">{owner.email}</span>. It expires in ten
          minutes.
        </p>
      </div>

      <Plate className="p-6 md:p-8">
        <h2 className="font-display text-title">Confirm your email</h2>

        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            verify.mutate(code, { onSuccess: () => void navigate('/', { replace: true }) })
          }}
        >
          <Field
            label="Confirmation code"
            name="code"
            required
            // A numeric keypad on a phone, and no autocorrect mangling six digits. Not
            // `type="number"`, which brings spinners and drops leading zeros — and a
            // code of 000042 is perfectly valid.
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            className="font-mono"
            error={codeError(failure)}
          />

          {formError(failure) ? <FormAlert>{formError(failure)}</FormAlert> : null}

          <Button type="submit" variant="primary" disabled={code.length !== 6 || verify.isPending}>
            Confirm
          </Button>
        </form>

        <div className="border-hairline mt-6 border-t pt-6">
          <p className="text-ink-soft text-[13px]">Nothing arrived? Check spam, or send another.</p>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Button onClick={() => resend.mutate()} disabled={resend.isPending}>
              Send another code
            </Button>

            {/* The server answers 202 whether or not it sent anything, so this says what
                we actually know — not "sent", which we cannot promise. */}
            {resend.isSuccess ? (
              <output className="text-patch font-body text-xs font-semibold tracking-[0.08em] uppercase">
                On its way
              </output>
            ) : null}
          </div>

          {resendFailure ? (
            <FormAlert className="mt-4">
              {resendFailure.problem.code === 'RATE_LIMITED' ? (
                <RetryCountdown
                  key={resend.failureCount}
                  seconds={resendFailure.retryAfterSeconds ?? 60}
                />
              ) : (
                'Could not send the email just now. Try again in a moment.'
              )}
            </FormAlert>
          ) : null}
        </div>
      </Plate>
    </main>
  )
}

function codeError(failure: ApiError | null) {
  if (!failure) return undefined
  switch (failure.problem.code) {
    case 'INVALID_CODE':
      return 'That code is not correct. Check the digits, or send another.'
    // Distinguished from INVALID_CODE because the fix is different: there is nothing to
    // re-read, and the only way forward is a new code.
    case 'CODE_EXPIRED':
      return 'That code has expired. Send another one.'
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
