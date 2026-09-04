import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const BASE =
  'font-body inline-flex min-h-11 cursor-pointer items-center justify-center px-5 text-xs font-semibold tracking-[0.08em] uppercase transition-shadow disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:shadow-none'

/**
 * Depth is the entire interaction language: hover deepens the shadow, press moves the
 * button *toward* it. No fades, no scale — DESIGN.md, Elevation & Depth.
 */
const RAISED =
  'border-ink shadow-plate hover:shadow-plate-lg active:shadow-plate-pressed border-3 active:translate-x-[3px] active:translate-y-[3px]'

const VARIANTS: Record<Variant, string> = {
  // Ink, not brass. A brass fill under a brass shadow has no visible shadow, which left
  // the most important control on the page as the only flat one. DESIGN.md records it.
  primary: `${RAISED} bg-ink text-plate hover:bg-ink-soft`,
  secondary: `${RAISED} bg-plate text-ink hover:bg-paper`,
  danger: `${RAISED} bg-signal text-plate`,
  // No border: row actions in a table would otherwise render as a grid of cages.
  ghost: 'text-ink-soft hover:text-ink underline decoration-2 underline-offset-4',
}

export function Button({
  variant = 'secondary',
  type = 'button',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />
}
