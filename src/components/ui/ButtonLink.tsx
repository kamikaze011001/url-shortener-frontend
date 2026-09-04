import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router'

/**
 * A navigation that looks like a button.
 *
 * Separate from {@link Button} rather than a prop on it, because the two are different
 * elements with different semantics: this one navigates and belongs in the tab order as
 * a link, and a screen reader should say "link", not "button". Sharing the styling
 * without sharing the element is exactly the split.
 *
 * The classes are duplicated from Button's primary variant on purpose — they were
 * already copied into two screens by hand, which is the drift this file stops.
 */
export function ButtonLink({
  to,
  children,
  className = '',
}: {
  to: string
  children: ReactNode
  className?: string
}) {
  return (
    <RouterLink
      to={to}
      className={`border-ink bg-ink text-plate shadow-plate hover:bg-ink-soft hover:shadow-plate-lg active:shadow-plate-pressed font-body inline-flex min-h-11 items-center border-3 px-5 text-xs font-semibold tracking-[0.08em] uppercase transition-shadow active:translate-x-[3px] active:translate-y-[3px] ${className}`}
    >
      {children}
    </RouterLink>
  )
}
