// oxlint-disable jsx-a11y/prefer-tag-over-role -- the rule wants an <img> element, but
// this is an *inline* <svg> and cannot be one. `role="img"` with `aria-label` is the
// standard way to give an inline SVG an accessible name; without the role, some screen
// readers announce the child shapes instead of the label.
import { useMemo } from 'react'
import qrcode from 'qrcode-generator'

/**
 * A QR code, drawn as one SVG path.
 *
 * The library computes the modules and nothing else — no canvas, no image, no styling
 * of its own to override. Colours come from the theme tokens, so this cannot drift from
 * the rest of the system the way a library's own rendering would.
 *
 * **Deliberately undecorated.** No logo in the middle, no rounded dots, no gradient.
 * Each of those eats into the error-correction budget and measurably lowers the scan
 * rate, and a code that fails on a poor camera in a lecture hall is worse than a plain
 * one that works. DESIGN.md and the KB's non-goals both say so.
 */
export function QrCode({ value, size = 160 }: { value: string; size?: number }) {
  const { path, extent } = useMemo(() => build(value), [value])

  return (
    <svg
      viewBox={`0 0 ${extent} ${extent}`}
      width={size}
      height={size}
      role="img"
      aria-label={`QR code for ${value}`}
      // Without this the browser antialiases module edges and a phone camera reads
      // grey where it needs black or white.
      shapeRendering="crispEdges"
      className="border-ink border-3"
    >
      <rect width={extent} height={extent} fill="var(--color-plate)" />
      <path d={path} fill="var(--color-ink)" />
    </svg>
  )
}

/**
 * Error correction level M — about 15% recoverable. The higher levels exist to survive
 * a logo punched through the middle, which this does not have; choosing H regardless
 * would make the code denser, and therefore harder to scan, for no benefit.
 */
function build(value: string) {
  const qr = qrcode(0, 'M')
  qr.addData(value)
  qr.make()

  const count = qr.getModuleCount()

  // Four modules of blank margin, required by the spec. Scanners use it to find the
  // code's edges, and a QR rendered flush to its container is a QR that does not scan.
  const quiet = 4
  const extent = count + quiet * 2

  let path = ''
  for (let row = 0; row < count; row++) {
    for (let column = 0; column < count; column++) {
      if (qr.isDark(row, column)) {
        path += `M${column + quiet} ${row + quiet}h1v1h-1z`
      }
    }
  }

  return { path, extent }
}
