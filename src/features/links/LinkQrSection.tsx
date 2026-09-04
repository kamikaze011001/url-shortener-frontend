import type { Link } from '@/api/types'
import { Plate } from '@/components/ui/Plate'
import { QrCode } from '@/components/ui/QrCode'

/**
 * The Short Link as something a phone can read.
 *
 * On the detail screen and **not** in the creation reveal, which is a deliberate
 * restraint: the split-flap is the one bold moment in this design, and putting a QR
 * beside it would split the attention it exists to hold. Someone who wants the code
 * wants to print or project it, which is a considered act, not a reflex at creation.
 *
 * The download is an SVG rather than a PNG. A QR ends up on a poster or a slide, and
 * vector is the format that survives being scaled up — a raster at the wrong size is
 * exactly how a code stops scanning.
 */
export function LinkQrSection({ link }: { link: Link }) {
  return (
    <Plate as="section" className="mt-8 p-6">
      <h2 className="font-display text-title">QR code</h2>

      <div className="mt-6 flex flex-wrap items-start gap-8">
        <QrCode value={link.shortUrl} size={180} />

        <div className="max-w-sm">
          <p className="text-ink-soft text-[15px]">
            Points at <span className="text-ink font-mono text-[13px]">{link.shortUrl}</span>, so it
            follows the Destination wherever you point it next — a printed code does not go stale
            when you edit the Link.
          </p>

          <button
            type="button"
            onClick={() => download(link)}
            className="border-ink bg-plate shadow-plate hover:bg-paper hover:shadow-plate-lg active:shadow-plate-pressed font-body mt-6 inline-flex min-h-11 cursor-pointer items-center border-3 px-5 text-xs font-semibold tracking-[0.08em] uppercase transition-shadow active:translate-x-[3px] active:translate-y-[3px]"
          >
            Download SVG
          </button>
        </div>
      </div>
    </Plate>
  )
}

/**
 * Serialises the rendered SVG straight out of the DOM rather than regenerating it, so
 * the file is exactly what is on screen. The object URL is revoked immediately — the
 * click has already been dispatched by then, and leaving it alive holds the blob for
 * the lifetime of the document.
 */
function download(link: Link) {
  const svg = document.querySelector(`svg[aria-label="QR code for ${link.shortUrl}"]`)
  if (!svg) return

  const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${link.code}.svg`
  anchor.click()

  URL.revokeObjectURL(url)
}
