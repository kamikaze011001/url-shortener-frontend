import { useState } from 'react'
import { useLinks, useMe } from '@/api/queries'
import type { LinkStatus } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { Plate } from '@/components/ui/Plate'
import { useDebounced } from '@/hooks/useDebounced'
import { LinkRow } from './LinkRow'

const PAGE_SIZE = 20

/**
 * An empty state is an instruction, so it has to point at something that exists. For an
 * unverified Owner there is no create form on the screen — VerificationRequired stands
 * where it would be — and telling them to use "the form above" would send them looking
 * for a control that is not there.
 */
function emptyMessage(filtered: boolean, verified: boolean) {
  if (filtered) return 'No links match that search. Try a different code or destination.'
  if (!verified) return 'Confirm your email address and your first link can go here.'
  return 'Shorten your first URL using the form above.'
}

const FILTERS: { value: LinkStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DISABLED', label: 'Disabled' },
  { value: 'EXPIRED', label: 'Expired' },
]

export function LinkTable() {
  const { data: owner } = useMe()
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<LinkStatus | ''>('')
  const [page, setPage] = useState(0)

  // Searching and filtering both reset to the first page. Changing a filter while on page
  // three of the old result lands on a page that no longer exists — an empty table that
  // looks like "no results" and is really "no page three".
  const search = useDebounced(searchInput)
  const changeSearch = (value: string) => {
    setSearchInput(value)
    setPage(0)
  }
  const changeStatus = (value: LinkStatus | '') => {
    setStatus(value)
    setPage(0)
  }

  const { data, isError } = useLinks({ page, size: PAGE_SIZE, search, status })
  const filtered = search !== '' || status !== ''

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end gap-4">
        <h2 className="font-display text-title mr-auto">Your links</h2>

        <div className="flex gap-2">
          {FILTERS.map((filter) => (
            <Button
              key={filter.label}
              onClick={() => changeStatus(filter.value)}
              pressed={status === filter.value}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <label className="mt-6 block">
        <span className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
          Search
        </span>
        <input
          type="search"
          value={searchInput}
          onChange={(event) => changeSearch(event.target.value)}
          placeholder="Code or destination"
          className="border-ink bg-plate font-body mt-2 min-h-11 w-full border-3 px-3 text-[15px]"
        />
      </label>

      <Plate className="mt-6">
        {isError ? (
          <p role="alert" className="text-signal px-6 py-8 text-[15px] font-medium">
            Could not load your links. Reload the page to try again.
          </p>
        ) : null}

        {data && data.content.length > 0 ? (
          <ul>
            {data.content.map((link) => (
              <LinkRow key={link.id} link={link} />
            ))}
          </ul>
        ) : null}

        {/* An empty plate, deliberately: at this size the query returns in tens of
            milliseconds, and a skeleton that appears and vanishes is a flicker, not
            feedback. Nothing is shown until there is something to show. */}
        {data && data.content.length === 0 ? (
          <p className="text-ink-soft px-6 py-10 text-[15px]">
            {emptyMessage(filtered, owner?.emailVerified ?? true)}
          </p>
        ) : null}
      </Plate>

      {data && data.totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <p className="text-ink-soft font-body mr-auto text-xs font-semibold tracking-[0.08em] uppercase">
            Page {data.page + 1} of {data.totalPages} · {data.totalElements} links
          </p>
          <Button onClick={() => setPage((current) => current - 1)} disabled={data.page === 0}>
            Previous
          </Button>
          <Button
            onClick={() => setPage((current) => current + 1)}
            disabled={data.page >= data.totalPages - 1}
          >
            Next
          </Button>
        </div>
      ) : null}
    </section>
  )
}
