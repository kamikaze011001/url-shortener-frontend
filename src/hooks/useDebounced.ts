import { useEffect, useState } from 'react'

/**
 * Delays a value so that typing does not become one request per keystroke.
 *
 * The update is scheduled, never written synchronously during a render or an effect —
 * that is what keeps this from fighting React's own batching.
 */
export function useDebounced<T>(value: T, delayMs = 250) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
