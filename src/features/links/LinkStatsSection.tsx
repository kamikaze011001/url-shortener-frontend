import { useLinkStats } from '@/api/queries'
import { Plate } from '@/components/ui/Plate'
import { ClickChart } from './ClickChart'

/**
 * Where the Clicks came from, over the last thirty days.
 *
 * The section renders nothing at all while loading and nothing on failure. Statistics
 * are the least important thing on this screen — the Link itself is above — and a
 * broken analytics query should not put an error banner between the Owner and the
 * controls they came for. The failure is visible in the network tab, where whoever can
 * act on it will be looking.
 */
export function LinkStatsSection({ linkId }: { linkId: string }) {
  const { data: stats } = useLinkStats(linkId)

  if (!stats) return null

  return (
    <Plate as="section" className="mt-8 p-6">
      <div className="flex flex-wrap items-baseline gap-4">
        <h2 className="font-display text-title mr-auto">Clicks</h2>
        <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
          {stats.from} to {stats.to} · UTC days
        </p>
      </div>

      <p className="font-display mt-4 font-mono text-[3rem] leading-none font-medium">
        {stats.totalClicks}
      </p>

      {stats.totalClicks === 0 ? (
        <p className="text-ink-soft mt-6 text-[15px]">
          No clicks in this window yet. Share the short link and they will appear here.
        </p>
      ) : (
        <>
          <div className="mt-8">
            <ClickChart daily={stats.daily} />
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Breakdown
              title="Referrer"
              rows={(stats.byReferrer ?? []).map((row) => ({
                // A null referrer is not an unknown one — the server has told us the
                // Visitor typed the link or followed it from somewhere that sends no
                // header. "Direct" is the honest word for that.
                label: row.referrer ?? 'Direct',
                clicks: row.clicks ?? 0,
              }))}
            />
            <Breakdown
              title="Device"
              rows={(stats.byDevice ?? []).map((row) => ({
                label: row.deviceType ? sentenceCase(row.deviceType) : 'Unknown',
                clicks: row.clicks ?? 0,
              }))}
            />
            <Breakdown
              title="Country"
              rows={(stats.byCountry ?? []).map((row) => ({
                // XX is what the backend records when Cloudflare's country header is
                // absent, which is every request outside production. Saying "Unknown"
                // is more use than showing the sentinel.
                label: row.countryCode === 'XX' ? 'Unknown' : (row.countryCode ?? 'Unknown'),
                clicks: row.clicks ?? 0,
              }))}
            />
          </div>
        </>
      )}
    </Plate>
  )
}

function sentenceCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

/**
 * One breakdown. The bar is sized against the largest row in its own list, not against
 * the total: these are top-ten slices of an unbounded set, so a bar drawn as a share of
 * the total would silently claim the tail is empty.
 */
function Breakdown({ title, rows }: { title: string; rows: { label: string; clicks: number }[] }) {
  const largest = Math.max(...rows.map((row) => row.clicks), 1)

  return (
    <div>
      <h3 className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
        {title}
      </h3>

      {rows.length === 0 ? (
        <p className="text-ink-soft mt-3 text-[13px]">Nothing recorded.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate font-mono text-[13px]" title={row.label}>
                  {row.label}
                </span>
                <span className="font-mono text-[13px] tabular-nums">{row.clicks}</span>
              </div>
              <div aria-hidden="true" className="bg-hairline mt-1 h-1 w-full">
                <div
                  className="bg-brass h-full"
                  style={{ width: `${(row.clicks / largest) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
