/**
 * Shortens a URL for display by removing the middle, not the end.
 *
 * The end is where two links to the same site differ — `/docs/a/settings` and
 * `/docs/b/settings` are identical for the first thirty characters. Cutting the tail
 * hides exactly the part the reader is checking.
 */
export function truncateMiddle(text: string, max = 56) {
  if (text.length <= max) return text

  const keep = max - 1
  const head = Math.ceil(keep * 0.62)
  return `${text.slice(0, head)}…${text.slice(-(keep - head))}`
}
