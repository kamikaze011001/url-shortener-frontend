import { useEffect, useRef, useState } from 'react'
import { Button } from './Button'

/**
 * Copy, with confirmation — the one case where feedback is not optional. The clipboard is
 * invisible: nothing on screen changes, so without a reply the user cannot tell a
 * successful copy from a dead button. That is the test DESIGN.md sets for a toast, and
 * this passes it — but the answer belongs on the control that was pressed, not in a
 * corner of the screen.
 */
export function CopyButton({
  value,
  label = 'Copy',
  variant = 'secondary',
  className = '',
}: {
  value: string
  label?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), 2000)
        })
      }}
    >
      {/* The verb survives the action: Copy becomes Copied, never "Success". */}
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </Button>
  )
}
