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
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

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
        aria-describedby={describedBy || undefined}
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
