import { useLinkHistory } from '@/api/queries'
import { Plate } from '@/components/ui/Plate'
import { formatMoment } from '@/lib/datetime'
import { truncateMiddle } from '@/lib/truncate'

/**
 * Every Destination this Link has pointed at.
 *
 * This is the record ADR-0009 relies on. That decision argues a changeable Destination
 * is accountable rather than a loophole *because* every change is kept — an argument
 * that was resting on a table nobody could see until this component existed.
 *
 * Renders nothing at all when the Link has never been edited. An "Edit history" heading
 * over the words "no changes yet" is a section that exists to announce its own
 * emptiness; the absence of the section says the same thing and takes no room.
 */
export function DestinationHistory({ linkId }: { linkId: string }) {
  const { data: changes } = useLinkHistory(linkId)

  if (!changes || changes.length === 0) return null

  return (
    <Plate as="section" className="mt-8 p-6">
      <div className="flex flex-wrap items-baseline gap-4">
        <h2 className="font-display text-title mr-auto">Destination history</h2>
        <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
          {changes.length} {changes.length === 1 ? 'change' : 'changes'}
        </p>
      </div>

      <ol className="mt-6 flex flex-col">
        {changes.map((change, index) => (
          <li
            key={change.id}
            className={`border-hairline flex flex-col gap-2 py-4 ${
              index === changes.length - 1 ? '' : 'border-b'
            }`}
          >
            <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
              {formatMoment(change.changedAt)}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {/* The old value is struck through rather than only labelled: the whole
                  point of the row is that this one stopped being true. */}
              <span
                title={change.oldDestination}
                className="text-ink-soft font-mono text-[13px] line-through decoration-2"
              >
                {truncateMiddle(change.oldDestination, 44)}
              </span>

              <span aria-hidden="true" className="text-ink-soft font-mono text-[13px]">
                →
              </span>

              <span title={change.newDestination} className="font-mono text-[13px]">
                {truncateMiddle(change.newDestination, 44)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Plate>
  )
}
