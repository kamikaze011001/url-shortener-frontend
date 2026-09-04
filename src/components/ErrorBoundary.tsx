import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Button } from './ui/Button'

interface State {
  error: Error | null
}

/**
 * The last line of defence: an error thrown during render unmounts the entire React tree
 * and leaves a blank page — no header, no message, nothing to act on.
 *
 * This exists because that happened. A `toLocaleString` call combined `timeStyle` with
 * `timeZoneName`, which ECMA-402 rejects; the throw took the whole app with it and the
 * only evidence was in the console. The formatting bug is fixed, but the failure mode it
 * exposed is general, and a white screen is the worst thing that can happen in front of
 * an audience.
 *
 * A class component because React still has no hook equivalent.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Not a logging service — just make sure the real cause is somewhere findable rather
    // than swallowed by the fallback.
    console.error('Unhandled render error', error, info.componentStack)
  }

  override render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="mx-auto max-w-[1120px] px-6 py-24">
        <h1 className="font-display text-title">Something broke on this screen.</h1>
        <p className="text-ink-soft mt-4 max-w-md text-[15px]">
          Your links are safe — this is a display problem, not a data one. Reloading usually clears
          it.
        </p>
        <Button variant="primary" className="mt-6" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </main>
    )
  }
}
