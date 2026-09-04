import { useState } from 'react'
import { ApiError } from '@/api/client'
import { useUpdateLink } from '@/api/queries'
import type { Link, UpdateLinkRequest } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Plate } from '@/components/ui/Plate'
import { toInstant, toLocalInput } from '@/lib/datetime'

/**
 * Editing a Link. The Short Code is not here and never will be: renaming would release
 * the old string back into the Code Namespace for someone else to claim, and every copy
 * already shared would then resolve to a stranger's destination.
 *
 * Render with `key={link.updatedAt}` so a save re-seeds the fields from the server's
 * answer rather than leaving whatever was typed. That matters when the server normalises
 * a value — without it the form quietly disagrees with the Link it is editing.
 */
export function EditLinkForm({ link }: { link: Link }) {
  const update = useUpdateLink(link.id)

  const originalExpiry = link.expiresAt ? toLocalInput(link.expiresAt) : ''
  const [destination, setDestination] = useState(link.destination)
  const [expiry, setExpiry] = useState(originalExpiry)

  const failure = update.error instanceof ApiError ? update.error : null
  const changed = destination.trim() !== link.destination || expiry !== originalExpiry

  return (
    <Plate as="section" className="p-6">
      <h2 className="font-display text-title">Edit</h2>

      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault()

          // The three states the contract distinguishes, built explicitly:
          //   field absent      → leave it alone
          //   expiresAt null    → clear the expiry
          //   expiresAt string  → set it
          //
          // Sending every field on every save is what makes a PATCH quietly destructive:
          // editing only the destination would post `expiresAt: null` beside it and wipe
          // an expiry the user never touched.
          const request: UpdateLinkRequest = {}
          if (destination.trim() !== link.destination) request.destination = destination.trim()
          if (expiry !== originalExpiry) request.expiresAt = expiry ? toInstant(expiry) : null

          update.mutate(request)
        }}
      >
        <Field
          label="Destination"
          type="url"
          name="destination"
          required
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          hint="Changing this repoints every copy of the short link already shared."
          error={destinationError(failure)}
        />

        <Field
          label="Expires"
          type="datetime-local"
          name="expiresAt"
          className="mt-5"
          value={expiry}
          onChange={(event) => setExpiry(event.target.value)}
          hint="Clear the field to remove the expiry."
          error={failure?.fieldError('expiresAt')}
        />

        {formError(failure) ? (
          <p
            role="alert"
            className="border-signal shadow-plate-signal text-signal mt-5 border-3 p-3 text-[13px] font-medium"
          >
            {formError(failure)}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button type="submit" variant="primary" disabled={!changed || update.isPending}>
            Save changes
          </Button>

          {/* Nothing else on screen moves when a save succeeds — the fields already show
              the new values — so the confirmation has to be said out loud. */}
          {update.isSuccess && !changed ? (
            <output className="text-patch font-body text-xs font-semibold tracking-[0.08em] uppercase">
              Saved
            </output>
          ) : null}
        </div>
      </form>
    </Plate>
  )
}

function destinationError(failure: ApiError | null) {
  if (!failure) return undefined
  switch (failure.problem.code) {
    case 'INVALID_DESTINATION':
      return 'Enter a full web address, starting with http:// or https://.'
    case 'DESTINATION_NOT_ALLOWED':
      return 'That address is not reachable from the public internet, so it cannot be used.'
    default:
      return failure.fieldError('destination')
  }
}

function formError(failure: ApiError | null) {
  if (!failure) return undefined
  switch (failure.problem.code) {
    case 'INVALID_DESTINATION':
    case 'DESTINATION_NOT_ALLOWED':
    case 'VALIDATION_FAILED':
      return undefined
    case 'NOT_FOUND':
      return 'This link no longer exists.'
    default:
      return failure.problem.detail ?? 'Something went wrong. Try again.'
  }
}
