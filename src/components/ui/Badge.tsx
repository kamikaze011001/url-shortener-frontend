import type { LinkStatus } from '@/api/types'

/**
 * Link status. Always the word as well as the colour — an Expired Link is red *and* says
 * "Expired", so the state survives being read by someone who cannot tell the two reds
 * apart, or by a screen reader.
 */
const STATUS: Record<LinkStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'border-patch text-patch' },
  DISABLED: { label: 'Disabled', className: 'border-ink-soft text-ink-soft' },
  EXPIRED: { label: 'Expired', className: 'border-signal text-signal' },
}

export function Badge({ status }: { status: LinkStatus }) {
  const { label, className } = STATUS[status]

  return (
    <span
      className={`font-body inline-flex items-center border-3 px-2 py-0.5 text-xs font-semibold tracking-[0.08em] uppercase ${className}`}
    >
      {label}
    </span>
  )
}
