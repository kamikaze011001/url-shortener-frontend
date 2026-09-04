import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

/**
 * A labelled input. There is no bare `Input` export, and that is deliberate: a placeholder
 * standing in for a label disappears exactly when the user needs it, so the label is not
 * optional and cannot be forgotten.
 *
 * The error is announced as well as shown. Colour never carries meaning alone.
 */
export function Field({
  label,
  error,
  hint,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string | undefined
  hint?: string | undefined
}) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  // When there is an error, it is the only description. Announcing the hint first makes a
  // screen reader read the advice the user has just failed to follow before telling them
  // what actually went wrong; the hint stays on screen for anyone reading it.
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-ink-soft font-body block text-xs font-semibold tracking-[0.08em] uppercase"
      >
        {label}
      </label>

      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`font-body mt-2 min-h-11 w-full border-3 px-3 text-[15px] ${
          error ? 'border-signal bg-plate' : 'border-ink bg-plate'
        }`}
      />

      {hint ? (
        <p id={hintId} className="text-ink-soft mt-2 text-[13px]">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-signal mt-2 text-[13px] font-medium">
          {error}
        </p>
      ) : null}
    </div>
  )
}
