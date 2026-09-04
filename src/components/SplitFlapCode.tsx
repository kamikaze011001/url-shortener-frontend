import { useEffect, useState } from 'react'

/**
 * The signature element: a newly created Short Code flips into place one character at a
 * time, like a departure board.
 *
 * It appears **once**, on creation, and nowhere else. Generation is the whole moment of
 * a URL shortener, and the flaps cycle through the real base62 alphabet — so the
 * animation shows what the code is made of rather than decorating it.
 *
 * Accessibility: the flapping characters are noise to a screen reader, so the animated
 * row is `aria-hidden` and the finished code is exposed once, as text. Under
 * `prefers-reduced-motion` there is no animation at all — the code is simply rendered.
 */

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

/** Slow enough to read as mechanical, fast enough that seven characters take ~400ms. */
const FLIPS_PER_CHAR = 6
const FLIP_MS = 28
const STAGGER_MS = 45

/** Read at call time rather than cached: a viewer can change the setting mid-session. */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function SplitFlapCode({ code }: { code: string }) {
  const animate = !prefersReducedMotion()
  const [flaps, setFlaps] = useState('')

  // The displayed string is derived, never stored twice. With motion off this is just
  // the code — no effect runs, no state is written, and there is nothing to fall out of
  // sync. Padding keeps render safe if `code` changes length before the timers catch up.
  const display = animate ? flaps.padEnd(code.length, ' ').slice(0, code.length) : code

  useEffect(() => {
    if (!animate) return

    const characters = code.split('')
    const timers: ReturnType<typeof setTimeout>[] = []

    const write = (index: number, char: string) =>
      setFlaps((current) => {
        const next = current.padEnd(code.length, ' ').split('')
        next[index] = char
        return next.join('')
      })

    // Every update is scheduled, never synchronous: each character runs its own burst of
    // random flaps and then settles, and the per-character stagger is what produces the
    // left-to-right cascade of a real board.
    characters.forEach((char, index) => {
      for (let flip = 0; flip < FLIPS_PER_CHAR; flip++) {
        timers.push(
          setTimeout(
            () => write(index, ALPHABET[Math.floor(Math.random() * ALPHABET.length)] ?? char),
            index * STAGGER_MS + flip * FLIP_MS,
          ),
        )
      }
      timers.push(
        setTimeout(() => write(index, char), index * STAGGER_MS + FLIPS_PER_CHAR * FLIP_MS),
      )
    })

    return () => timers.forEach(clearTimeout)
  }, [code, animate])

  return (
    <span className="inline-flex gap-1">
      <span className="sr-only">{code}</span>
      <span aria-hidden="true" className="inline-flex gap-1">
        {display.split('').map((char, index) => (
          <span
            key={index}
            className="border-ink bg-ink text-plate inline-flex h-11 w-8 items-center justify-center border-3 font-mono text-xl font-medium tabular-nums"
          >
            {char}
          </span>
        ))}
      </span>
    </span>
  )
}
