import type { ReactNode } from 'react'

/**
 * A failure that belongs to the submission rather than to any one field — a wrong
 * password, a rate limit, a server that broke.
 *
 * Extracted because the same markup had been written out in three forms, which is three
 * chances for one of them to drift. `shadow-plate-signal` is the only place in the
 * system where a shadow is not brass; DESIGN.md records why.
 */
export function FormAlert({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      role="alert"
      className={`border-signal shadow-plate-signal text-signal border-3 p-3 text-[13px] font-medium ${className}`}
    >
      {children}
    </p>
  )
}
