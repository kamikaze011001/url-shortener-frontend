/**
 * Conversions between the instant the API speaks and the wall-clock string a
 * `datetime-local` input speaks.
 *
 * The input has no timezone at all — it is the time on the clock in front of the user.
 * Both directions therefore resolve in the browser's zone, which is the one they were
 * reading when they typed it.
 */

const pad = (value: number) => String(value).padStart(2, '0')

/** ISO instant → `YYYY-MM-DDTHH:mm` in local time, the only format the input accepts. */
export function toLocalInput(iso: string) {
  const date = new Date(iso)
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

/** Local input value → ISO instant. */
export function toInstant(localValue: string) {
  return new Date(localValue).toISOString()
}

/**
 * For display. Deliberately includes the zone: an expiry an hour out is worth being
 * precise about, and the reader may not be in the same zone as whoever set it.
 *
 * Spelled out component by component rather than with `dateStyle`/`timeStyle`, because
 * ECMA-402 forbids combining those shortcuts with individual options — asking for
 * `timeStyle` and `timeZoneName` together does not fall back, it throws `Invalid option`
 * and takes the screen down with it.
 */
export function formatMoment(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}
