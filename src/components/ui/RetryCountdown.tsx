import { useEffect, useState } from 'react'

/**
 * The wait after a `429`, counting down.
 *
 * A static "try again in 59 seconds" is correct for one second and misleading for the
 * next fifty-eight — the user who waits and re-reads it learns nothing. Demo script
 * step 6 in the KB asks for the retry delay specifically, and a number that stops being
 * true does not satisfy it.
 *
 * Mount this with a `key` that changes per rejection. State is seeded from the prop and
 * never written from an effect, so a second rejection produces a fresh instance rather
 * than a stale one that has to be reconciled.
 */
export function RetryCountdown({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    // Only ever decrements, and stops itself at zero — no dependency on the prop, so
    // there is nothing for this to fall out of sync with.
    const tick = setInterval(() => setRemaining((left) => Math.max(0, left - 1)), 1000)
    return () => clearInterval(tick)
  }, [])

  if (remaining === 0) return <>Too many requests. You can try again now.</>

  return (
    <>
      Too many requests. Try again in <span className="font-mono tabular-nums">{remaining}</span>{' '}
      {remaining === 1 ? 'second' : 'seconds'}.
    </>
  )
}
