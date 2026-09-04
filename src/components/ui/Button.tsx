import type { ButtonHTMLAttributes, Ref } from 'react'

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

/**
 * A toggle that is currently on, drawn as physically pushed in — sitting on its shadow
 * rather than above it. Selection is depth first and colour second, which is the same
 * language the rest of the system uses and needs no new token.
 */
const PRESSED = `${RAISED} bg-ink text-plate shadow-plate-pressed translate-x-[3px] translate-y-[3px]`

/**
 * Pass `pressed` for a toggle — a filter that is on, a view that is selected. It replaces
 * the variant's own fill rather than layering over it: Tailwind resolves two conflicting
 * utilities by their order in the stylesheet, not by their order in the class attribute,
 * so `bg-ink text-plate` appended after `bg-plate text-ink` is a coin toss. It came up
 * ink-on-ink, and the selected filter's label was invisible.
 */
export function Button({
  variant = 'secondary',
  pressed,
  type = 'button',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  pressed?: boolean
  // React 19 passes `ref` as an ordinary prop to function components, so there is no
  // forwardRef wrapper here — it only has to be declared to be forwarded by the spread.
  ref?: Ref<HTMLButtonElement>
}) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={`${BASE} ${pressed ? PRESSED : VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}
