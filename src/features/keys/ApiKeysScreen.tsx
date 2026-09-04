import { useState } from 'react'
import { ApiError } from '@/api/client'
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/api/queries'
import type { ApiKey, ApiKeyCreated } from '@/api/types'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CopyButton } from '@/components/ui/CopyButton'
import { Field } from '@/components/ui/Field'
import { FormAlert } from '@/components/ui/FormAlert'
import { Plate } from '@/components/ui/Plate'
import { formatMoment } from '@/lib/datetime'

/**
 * API Keys: the credential a program uses instead of a browser session.
 *
 * The session cookie is `httpOnly` by design (ADR-0014), which is exactly what stops a
 * script from holding it. This screen is the other door.
 */
export function ApiKeysScreen() {
  const { data: keys } = useApiKeys()
  const create = useCreateApiKey()
  const revoke = useRevokeApiKey()

  const [name, setName] = useState('')
  const [revealed, setRevealed] = useState<ApiKeyCreated | null>(null)
  const [doomed, setDoomed] = useState<ApiKey | null>(null)

  const failure = create.error instanceof ApiError ? create.error : null

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-12">
      <h1 className="font-display text-display">API keys</h1>
      <p className="text-ink-soft text-lede mt-6 max-w-xl">
        For scripts, CI jobs and automation — anything that needs to create links without a browser.
        Send it as <span className="text-ink font-mono text-[15px]">Authorization: Bearer</span>.
      </p>

      <Plate as="section" className="mt-10 p-6">
        <h2 className="font-display text-title">Create a key</h2>

        <form
          className="mt-6 flex flex-wrap items-end gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            create.mutate(name, {
              onSuccess: (created) => {
                setRevealed(created)
                setName('')
              },
            })
          }}
        >
          <Field
            label="Name"
            name="name"
            required
            maxLength={64}
            value={name}
            onChange={(event) => setName(event.target.value)}
            hint="For your own reference, like “CI pipeline”."
            error={failure?.fieldError('name')}
            className="min-w-64 flex-1"
          />
          <Button type="submit" variant="primary" disabled={!name.trim() || create.isPending}>
            Create key
          </Button>
        </form>

        {failure && failure.problem.code !== 'VALIDATION_FAILED' ? (
          <FormAlert className="mt-5">
            {failure.problem.detail ?? 'Could not create the key. Try again.'}
          </FormAlert>
        ) : null}
      </Plate>

      {revealed ? <Revealed created={revealed} onDismiss={() => setRevealed(null)} /> : null}

      <section className="mt-10">
        <h2 className="font-display text-title">Your keys</h2>

        <Plate className="mt-6">
          {keys && keys.length > 0 ? (
            <ul>
              {keys.map((key) => (
                <li
                  key={key.id}
                  className="border-hairline flex flex-col gap-3 border-b px-6 py-5 last:border-b-0 md:flex-row md:items-center"
                >
                  <div className="mr-auto">
                    <p className="text-[15px] font-medium">{key.name}</p>
                    {/* Enough to tell keys apart, nowhere near enough to use one — the
                        plaintext is gone the moment its creation response is closed. */}
                    <p className="text-ink-soft mt-1 font-mono text-[13px]">
                      {key.keyPrefix}…{key.last4}
                    </p>
                  </div>

                  <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
                    {key.lastUsedAt ? `Used ${formatMoment(key.lastUsedAt)}` : 'Never used'}
                  </p>

                  <Button variant="ghost" onClick={() => setDoomed(key)}>
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft px-6 py-10 text-[15px]">
              No keys yet. Create one above to call the API from a script.
            </p>
          )}
        </Plate>
      </section>

      <ConfirmDialog
        open={doomed !== null}
        title="Revoke this key?"
        confirmLabel="Revoke"
        pending={revoke.isPending}
        onCancel={() => setDoomed(null)}
        onConfirm={() => doomed && revoke.mutate(doomed.id, { onSuccess: () => setDoomed(null) })}
        body={
          <>
            <p>
              <span className="text-ink font-mono">{doomed?.name}</span> stops working on its next
              request.
            </p>
            <p className="mt-3">
              Anything still using it starts failing immediately, and it cannot be restored — you
              would create a new key and update whatever holds it.
            </p>
          </>
        }
      />
    </main>
  )
}

/**
 * The one-time reveal.
 *
 * Only a SHA-256 of the key is stored, so this is the single moment it can ever be
 * shown. The panel says so plainly and does not offer a dismiss-and-forget path that
 * looks like the copy button — losing the value here means creating another key, and
 * the interface should make that consequence obvious before it happens rather than
 * after.
 */
function Revealed({ created, onDismiss }: { created: ApiKeyCreated; onDismiss: () => void }) {
  return (
    <Plate as="section" className="mt-6 p-6">
      <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
        Copy it now
      </p>

      <h2 className="font-display text-title mt-2">This is the only time you will see it</h2>

      <p className="mt-4 max-w-xl text-[15px]">
        We store a hash, not the key. If you lose it, revoke this one and create another — there is
        no way to look it up.
      </p>

      <div className="border-ink bg-paper mt-6 flex flex-wrap items-center gap-4 border-3 p-4">
        <code className="mr-auto font-mono text-[15px] break-all">{created.key}</code>
        <CopyButton value={created.key} label="Copy key" variant="primary" />
      </div>

      <Button className="mt-6" onClick={onDismiss}>
        I have saved it
      </Button>
    </Plate>
  )
}
