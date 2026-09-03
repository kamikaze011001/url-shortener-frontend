import { useState } from 'react'
import { SplitFlapCode } from './components/SplitFlapCode'
import { Plate } from './components/ui/Plate'

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function sampleCode() {
  return Array.from(
    { length: 7 },
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
  ).join('')
}

/**
 * Scaffold only: proves the token layer renders and the signature animation works.
 * Replaced by the router and real screens in the next step.
 */
export function App() {
  const [code, setCode] = useState(sampleCode)

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-16">
      <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
        Switchboard
      </p>
      <h1 className="font-display mt-3 text-[3.5rem] leading-[0.95] font-extrabold tracking-[-0.03em]">
        One string,
        <br />
        patched through.
      </h1>

      <Plate className="mt-10 flex max-w-xl flex-col items-start p-6">
        <p className="text-ink-soft font-body mb-4 text-xs font-semibold tracking-[0.08em] uppercase">
          Short code
        </p>
        <SplitFlapCode code={code} />
        <button
          type="button"
          onClick={() => setCode(sampleCode())}
          className="border-ink bg-ink text-plate shadow-plate hover:bg-ink-soft active:shadow-plate-pressed font-body mt-6 min-h-11 border-3 px-5 text-xs font-semibold tracking-[0.08em] uppercase transition-shadow active:translate-x-[3px] active:translate-y-[3px]"
        >
          Generate another
        </button>
      </Plate>
    </main>
  )
}
