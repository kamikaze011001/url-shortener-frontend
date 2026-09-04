import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import { ApiError } from '@/api/client'
import { useLink } from '@/api/queries'
import { Badge } from '@/components/ui/Badge'
import { CopyButton } from '@/components/ui/CopyButton'
import { Plate } from '@/components/ui/Plate'
import { formatMoment } from '@/lib/datetime'
import { EditLinkForm } from './EditLinkForm'
import { DeleteLinkButton, StatusToggle } from './LinkActions'
import { LinkStatsSection } from './LinkStatsSection'

/**
 * One Link, in full: what it is, where it points, and the two things that can be done to
 * it that the list deliberately does not offer.
 *
 * Editing lives on its own addressable screen rather than in a modal on the dashboard. A
 * modal would need focus management built by hand, and a URL that can be linked to, sent
 * to someone, or reloaded after a mistake is worth more than the saved click.
 */
export function LinkDetailScreen() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: link, isPending, error } = useLink(id)

  if (isPending) return null

  if (error) {
    const missing = error instanceof ApiError && error.problem.status === 404
    return (
      <main className="mx-auto max-w-[1120px] px-6 py-16">
        <h1 className="font-display text-title">
          {missing ? 'No such link.' : 'Could not load this link.'}
        </h1>
        <p className="text-ink-soft mt-4 text-[15px]">
          {missing
            ? 'It may have been deleted, or it belongs to someone else.'
            : 'Reload the page to try again.'}{' '}
          <RouterLink to="/" className="text-ink underline decoration-2 underline-offset-4">
            Back to your links
          </RouterLink>
          .
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-12">
      <RouterLink
        to="/"
        className="text-ink-soft hover:text-ink font-body text-xs font-semibold tracking-[0.08em] uppercase"
      >
        ← Your links
      </RouterLink>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <h1 className="font-display mr-auto font-mono text-[2.5rem] leading-none font-medium">
          {link.code}
        </h1>
        <Badge status={link.status} />
        <StatusToggle link={link} variant="secondary" />
        <DeleteLinkButton link={link} onDeleted={() => void navigate('/', { replace: true })} />
      </div>

      <Plate as="section" className="mt-8 p-6">
        <dl className="grid gap-6 md:grid-cols-2">
          <Detail label="Short link">
            <div className="flex flex-wrap items-center gap-3">
              {/* Server-assembled. Never built here from a base URL and a code. */}
              <a
                href={link.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[15px] underline decoration-2 underline-offset-4"
              >
                {link.shortUrl}
              </a>
              <CopyButton value={link.shortUrl} variant="ghost" />
            </div>
          </Detail>

          <Detail label="Clicks">
            <p className="font-mono text-[15px]">{link.clickCount}</p>
          </Detail>

          <Detail label="Destination">
            <a
              href={link.destination}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[15px] break-all underline decoration-2 underline-offset-4"
            >
              {link.destination}
            </a>
          </Detail>

          <Detail label="Code">
            <p className="text-[15px]">{link.isCustomAlias ? 'Custom alias' : 'Generated'}</p>
          </Detail>

          <Detail label="Created">
            <p className="text-[15px]">{formatMoment(link.createdAt)}</p>
          </Detail>

          <Detail label="Expires">
            <p className="text-[15px]">{link.expiresAt ? formatMoment(link.expiresAt) : 'Never'}</p>
          </Detail>
        </dl>
      </Plate>

      <LinkStatsSection linkId={link.id} />

      <div className="mt-8">
        {/* Keyed on updatedAt: a save re-seeds the fields from the server's answer. */}
        <EditLinkForm key={link.updatedAt} link={link} />
      </div>
    </main>
  )
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
        {label}
      </dt>
      <dd className="mt-2">{children}</dd>
    </div>
  )
}
