import type { ReactNode } from 'react'

/**
 * The one raised surface in the system: bone plate, 3px ink border, brass offset shadow.
 *
 * Everything visually elevated in this app is a Plate. Having exactly one such component
 * is what stops the shadow and border values from drifting into a dozen slightly
 * different card styles — the failure mode DESIGN.md's single elevation exists to prevent.
 */
export function Plate({
  children,
  as: Tag = 'div',
  interactive = false,
  className = '',
}: {
  children: ReactNode
  as?: 'div' | 'section' | 'article' | 'li'
  /** Adds the hover/press depth change. Only for plates that are themselves clickable. */
  interactive?: boolean
  className?: string
}) {
  return (
    <Tag
      className={[
        'border-ink bg-plate shadow-plate border-3',
        interactive &&
          'hover:shadow-plate-lg active:shadow-plate-pressed transition-shadow active:translate-x-[3px] active:translate-y-[3px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}
