import type { Link } from '@/api/types'
import { Badge } from '@/components/ui/Badge'
import { CopyButton } from '@/components/ui/CopyButton'
import { truncateMiddle } from '@/lib/truncate'

/**
 * One Link, as a row on desktop and a stacked plate below `md`.
 *
 * The patch line between the code and the destination is the switchboard idea made
 * literal: an operator's cord running from one to the other. It is decoration with a
 * meaning, and it is `aria-hidden` because a screen reader reading "line" would be told
 * nothing.
 */
export function LinkRow({ link }: { link: Link }) {
  return (
    <li className="border-hairline flex flex-col gap-4 border-b px-6 py-5 last:border-b-0 md:flex-row md:items-center">
      <a
        href={link.shortUrl}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-lg font-medium underline decoration-2 underline-offset-4"
      >
        {link.code}
      </a>

      <span aria-hidden="true" className="bg-hairline hidden h-px w-8 shrink-0 md:block" />

      <a
        href={link.destination}
        target="_blank"
        rel="noreferrer"
        title={link.destination}
        className="text-ink-soft hover:text-ink mr-auto font-mono text-[13px]"
      >
        {truncateMiddle(link.destination)}
      </a>

      <div className="flex flex-wrap items-center gap-4">
        <Badge status={link.status} />

        <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
          {link.clickCount} {link.clickCount === 1 ? 'click' : 'clicks'}
        </p>

        <CopyButton value={link.shortUrl} variant="ghost" />
      </div>
    </li>
  )
}
