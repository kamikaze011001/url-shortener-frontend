import { useState } from 'react'
import { ApiError } from '@/api/client'
import { useCreateLink } from '@/api/queries'
import type { CreateLinkRequest, Link } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { FormAlert } from '@/components/ui/FormAlert'
import { RetryCountdown } from '@/components/ui/RetryCountdown'
import { Plate } from '@/components/ui/Plate'

/**
 * The product's whole moment: a long URL goes in, a Short Code comes out.
 *
 * The Owner hands over the created Link rather than the form rendering the result itself,
 * because the reveal belongs to the page — it survives the form being cleared and typed
 * into again.
 */
export function CreateLinkForm({ onCreated }: { onCreated: (link: Link) => void }) {
  const create = useCreateLink()

  const [destination, setDestination] = useState('')
  const [alias, setAlias] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const failure = create.error instanceof ApiError ? create.error : null

  return (
    <Plate as="section" className="p-6">
      <h2 className="font-display text-title">Shorten a URL</h2>

      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault()

          const request: CreateLinkRequest = { destination: destination.trim() }
          if (alias.trim()) request.alias = alias.trim()
          // `datetime-local` gives a wall-clock string with no zone. The contract wants an
          // instant, so it is resolved in the browser's zone — which is the one the user
          // was reading the clock in when they typed it.
          if (expiresAt) request.expiresAt = new Date(expiresAt).toISOString()

          create.mutate(request, {
            onSuccess: (link) => {
              onCreated(link)
              setDestination('')
              setAlias('')
              setExpiresAt('')
            },
          })
        }}
      >
        <Field
          label="Destination"
          type="url"
          name="destination"
          required
          placeholder="https://"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          error={destinationError(failure)}
        />

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label="Custom alias"
            name="alias"
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            hint="Optional. Leave empty for a generated code."
            error={aliasError(failure)}
            className="font-mono"
          />

          <Field
            label="Expires"
            type="datetime-local"
            name="expiresAt"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            hint="Optional. The link stops resolving after this."
            error={failure?.fieldError('expiresAt')}
          />
        </div>

        {failure?.problem.code === 'RATE_LIMITED' ? (
          <FormAlert className="mt-5">
            {/* Keyed on the attempt so each rejection restarts the count. */}
            <RetryCountdown key={create.failureCount} seconds={failure.retryAfterSeconds ?? 60} />
          </FormAlert>
        ) : formError(failure) ? (
          <FormAlert className="mt-5">{formError(failure)}</FormAlert>
        ) : null}

        <Button type="submit" variant="primary" className="mt-6" disabled={create.isPending}>
          Shorten URL
        </Button>
      </form>
    </Plate>
  )
}

/**
 * Problems are routed to the field that can fix them, on `code` and never on `title` —
 * the contract fixes `code`, the prose is for humans and may be reworded.
 */
function aliasError(failure: ApiError | null) {
  if (!failure) return undefined
  switch (failure.problem.code) {
    case 'ALIAS_TAKEN':
      return 'That alias is already taken. Try another.'
    case 'RESERVED_ALIAS':
      return 'That alias is reserved. Try another.'
    default:
      return failure.fieldError('alias')
  }
}

function destinationError(failure: ApiError | null) {
  if (!failure) return undefined
  switch (failure.problem.code) {
    case 'INVALID_DESTINATION':
      return 'Enter a full web address, starting with http:// or https://.'
    // The server refuses to shorten anything on a private network or one of our own
    // hostnames. Saying so plainly beats a generic rejection: the address looks perfectly
    // valid to the person who pasted it.
    case 'DESTINATION_NOT_ALLOWED':
      return 'That address is not reachable from the public internet, so it cannot be shortened.'
    default:
      return failure.fieldError('destination')
  }
}

function formError(failure: ApiError | null) {
  if (!failure) return undefined
  switch (failure.problem.code) {
    case 'RATE_LIMITED': // rendered as a countdown by the caller
    case 'ALIAS_TAKEN':
    case 'RESERVED_ALIAS':
    case 'INVALID_DESTINATION':
    case 'DESTINATION_NOT_ALLOWED':
    case 'VALIDATION_FAILED':
      return undefined
    default:
      return failure.problem.detail ?? 'Something went wrong. Try again.'
  }
}
