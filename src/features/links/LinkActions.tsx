import { useState } from 'react'
import { useDeleteLink, useUpdateLink } from '@/api/queries'
import type { Link } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

/**
 * Turn a Link off, or back on.
 *
 * No confirmation and no toast: the badge beside the button changes the moment the server
 * answers, and the action reverses with the same click. Announcing a change the user can
 * see is noise, and confirming a reversible one is friction.
 */
export function StatusToggle({
  link,
  variant = 'ghost',
}: {
  link: Link
  variant?: 'secondary' | 'ghost'
}) {
  const update = useUpdateLink(link.id)

  // An EXPIRED Link has no toggle. `EXPIRED` is derived from `expiresAt` rather than
  // stored, so the underlying state is unknowable from here and disabling something that
  // already refuses to resolve changes nothing the user can observe. The action that
  // actually helps is editing the expiry, which is the form directly below.
  if (link.status === 'EXPIRED') return null

  const disabling = link.status === 'ACTIVE'

  return (
    <Button
      variant={variant}
      disabled={update.isPending}
      onClick={() => update.mutate({ status: disabling ? 'DISABLED' : 'ACTIVE' })}
    >
      {disabling ? 'Disable' : 'Enable'}
    </Button>
  )
}

/**
 * Delete, behind a confirmation that names the Short Code and says what deletion actually
 * does. "Are you sure?" moves the click without adding anything to it.
 */
export function DeleteLinkButton({ link, onDeleted }: { link: Link; onDeleted: () => void }) {
  const remove = useDeleteLink(link.id)
  const [asking, setAsking] = useState(false)

  return (
    <>
      <Button variant="danger" onClick={() => setAsking(true)}>
        Delete
      </Button>

      <ConfirmDialog
        open={asking}
        title="Delete this link?"
        confirmLabel="Delete"
        pending={remove.isPending}
        onCancel={() => setAsking(false)}
        onConfirm={() => remove.mutate(undefined, { onSuccess: onDeleted })}
        body={
          <>
            <p>
              <span className="text-ink font-mono">{link.code}</span> will stop resolving and leave
              your list.
            </p>
            <p className="mt-3">
              The code itself is never reused. Anyone who already has this short link will get a 404
              rather than somebody else&rsquo;s destination.
            </p>
          </>
        }
      />
    </>
  )
}
