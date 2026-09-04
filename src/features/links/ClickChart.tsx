import type { LinkStats } from '@/api/types'

/**
 * The daily Click series, as bars.
 *
 * Hand-built rather than pulled from a charting library, for the same reason CLAUDE.md
 * gives about shadcn: a library arrives with rounded corners, soft shadows and a
 * gradient fill, and every one of those has to be fought back to the tokens. Thirty-one
 * divs is less code than the configuration would be.
 *
 * Accessibility is not the `title` attribute — that is a mouse affordance and nothing
 * else. The bars are `aria-hidden` and the same numbers are exposed as a real table,
 * visually hidden, so a screen reader gets the data rather than a description of a
 * picture of the data.
 */
export function ClickChart({ daily }: { daily: LinkStats['daily'] }) {
  const busiest = Math.max(...daily.map((point) => point.clicks), 1)
  const first = daily.at(0)
  const last = daily.at(-1)

  return (
    <figure className="m-0">
      <div aria-hidden="true" className="border-hairline flex h-32 items-end gap-px border-b pt-2">
        {daily.map((point) => (
          <div
            key={point.date}
            title={`${point.date}: ${point.clicks}`}
            className="flex flex-1 items-end self-stretch"
          >
            {/* A day with no clicks still gets a sliver, so the axis reads as a series
                of days rather than as a gap where data is missing. */}
            <div
              className={point.clicks > 0 ? 'bg-ink w-full' : 'bg-hairline w-full'}
              style={{ height: point.clicks > 0 ? `${(point.clicks / busiest) * 100}%` : '2px' }}
            />
          </div>
        ))}
      </div>

      <figcaption className="text-ink-soft font-body mt-2 flex justify-between text-xs font-semibold tracking-[0.08em] uppercase">
        <span>{first?.date}</span>
        <span>Busiest day: {busiest}</span>
        <span>{last?.date}</span>
      </figcaption>

      <table className="sr-only">
        <caption>Clicks per day</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Clicks</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((point) => (
            <tr key={point.date}>
              <th scope="row">{point.date}</th>
              <td>{point.clicks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
