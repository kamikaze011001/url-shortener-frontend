import type { Link } from '@/api/types'
import { SplitFlapCode } from '@/components/SplitFlapCode'
import { CopyButton } from '@/components/ui/CopyButton'
import { Plate } from '@/components/ui/Plate'

/**
 * The signature moment, and the only place the split-flap appears.
 *
 * Render it with `key={link.id}` so a second creation remounts it and the flaps run
 * again — without that, React reuses the instance and the second code simply swaps into
 * place.
 */
export function NewLinkReveal({ link }: { link: Link }) {
  return (
    <Plate as="section" className="mt-6 p-6">
      <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
        Patched through
      </p>

      <div className="mt-4">
        <SplitFlapCode code={link.code} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {/* Straight from the server. Never assembled from a base URL and a code — one
            place in the system owns that string, and it reads it from configuration. */}
        <a
          href={link.shortUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[15px] underline decoration-2 underline-offset-4"
        >
          {link.shortUrl}
        </a>
        <CopyButton value={link.shortUrl} label="Copy link" />
      </div>
    </Plate>
  )
}
