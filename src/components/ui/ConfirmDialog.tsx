import { useEffect, useRef } from 'react'
import { Button } from './Button'

/**
 * A confirmation for something that cannot be undone.
 *
 * Built on the native `<dialog>` rather than a div with a high z-index: `showModal()`
 * brings focus trapping, Escape to dismiss, inert page content behind it and correct
 * screen-reader semantics with no library and no chance of getting them subtly wrong.
 *
 * `body` names what is about to be destroyed. A confirmation that only asks "are you
 * sure?" moves the click without adding any information to it.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  body: React.ReactNode
  confirmLabel: string
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return

    if (open && !element.open) {
      element.showModal()
      // `showModal()` focuses the first focusable descendant, which here is the
      // destructive button — one stray Enter and the Link is gone. DESIGN.md says a
      // danger action is never the default focus, so the safe choice takes it instead.
      cancel.current?.focus()
    }

    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      // Escape and a backdrop dismissal both close the element directly, without React
      // knowing. Mirroring `close` back into state keeps the two from drifting apart.
      onClose={onCancel}
      className="border-ink bg-plate shadow-plate-lg backdrop:bg-ink/40 m-auto max-w-md border-3 p-6"
    >
      <h2 className="font-display text-title">{title}</h2>
      <div className="text-ink-soft mt-4 text-[15px]">{body}</div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {confirmLabel}
        </Button>
        <Button ref={cancel} onClick={onCancel} disabled={pending}>
          Keep it
        </Button>
      </div>
    </dialog>
  )
}
