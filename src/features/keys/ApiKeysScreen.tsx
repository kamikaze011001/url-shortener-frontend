import { useId, useState } from 'react'
import { ApiError } from '@/api/client'
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/api/queries'
import type { ApiKey, ApiKeyCreated, ApiKeyScope } from '@/api/types'
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
  const [scopes, setScopes] = useState<ApiKeyScope[]>(['links:read', 'links:write'])
  // Ninety days by default. Someone clicking in a dashboard is choosing hygiene; someone
  // calling POST /api-keys from a provisioning script is choosing operations, and the
  // contract defaults them to never for exactly that reason.
  const [expiresInDays, setExpiresInDays] = useState<number | null>(90)
  const [revealed, setRevealed] = useState<ApiKeyCreated | null>(null)
  const [doomed, setDoomed] = useState<ApiKey | null>(null)
  // One instant for the whole list, captured once. Calling the clock inside each row
  // would be impure in render *and* would let two rows disagree about the same moment;
  // this way every key is judged against a single "now". The list refetches when
  // anything changes, and a key crossing its expiry while the page sits open is not
  // worth a timer.
  const [now] = useState(() => Date.now())

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
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault()
            create.mutate(
              { name, scopes, expiresInDays },
              {
                onSuccess: (created) => {
                  setRevealed(created)
                  setName('')
                },
              },
            )
          }}
        >
          <Field
            label="Name"
            name="name"
            required
            maxLength={64}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={failure?.fieldError('name')}
            hint="For your own reference, like “CI pipeline”."
            className="max-w-md"
          />

          <ScopePicker selected={scopes} onChange={setScopes} />
          <ExpiryPicker value={expiresInDays} onChange={setExpiresInDays} />

          <Button
            type="submit"
            variant="primary"
            className="mt-8"
            disabled={!name.trim() || scopes.length === 0 || create.isPending}
          >
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
                    <p className="text-ink-soft mt-2 font-mono text-[13px]">
                      {key.scopes.join('  ·  ')}
                    </p>
                  </div>

                  <Lifetime expiresAt={key.expiresAt ?? null} now={now} />

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

const SCOPES: { value: ApiKeyScope; label: string; explains: string }[] = [
  {
    value: 'links:read',
    label: 'Read links',
    explains: 'List links, and read their stats and history.',
  },
  {
    value: 'links:write',
    label: 'Create and edit links',
    explains: 'Create, edit, disable and delete links.',
  },
]

/**
 * The two scopes, as checkboxes rather than a single "access level" dropdown.
 *
 * A dropdown would have to invent an ordering — read, then read-and-write — and that
 * ordering is a lie here: neither scope implies the other, and *write without read* is
 * the whole reason this exists. A load generator should be able to create links without
 * also being handed the ability to enumerate every link the account owns.
 *
 * Real checkboxes, not styled `div`s. Space toggles them, the label text is a hit
 * target, and a screen reader announces the state — none of which comes free.
 */
function ScopePicker({
  selected,
  onChange,
}: {
  selected: ApiKeyScope[]
  onChange: (next: ApiKeyScope[]) => void
}) {
  return (
    <fieldset className="mt-8">
      <legend className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
        Permissions
      </legend>

      <div className="mt-3 flex flex-col gap-3">
        {SCOPES.map((scope) => (
          <ScopeCheckbox
            key={scope.value}
            scope={scope}
            checked={selected.includes(scope.value)}
            onToggle={(checked) =>
              onChange(
                checked
                  ? [...selected, scope.value]
                  : selected.filter((value) => value !== scope.value),
              )
            }
          />
        ))}
      </div>

      {selected.length === 0 ? (
        // Not an error styled as a failure — nothing has failed yet, and the submit
        // button is already disabled. This says what to do, not what went wrong.
        <p className="text-ink-soft mt-3 text-[13px]">Pick at least one.</p>
      ) : null}
    </fieldset>
  )
}

/**
 * One scope, as a checkbox.
 *
 * The `<label>` carries **only** the scope's name, wired with `htmlFor`, and the
 * explanation is attached with `aria-describedby` instead. That split is the point: it
 * makes the checkbox's accessible *name* "Read links" rather than all three lines of
 * text read out as one run-on phrase, which is what wrapping everything in the label
 * would produce. The whole box stays clickable because the box is the label's row, and
 * the 44px minimum target is met by the padding rather than by the box alone.
 */
function ScopeCheckbox({
  scope,
  checked,
  onToggle,
}: {
  scope: (typeof SCOPES)[number]
  checked: boolean
  onToggle: (checked: boolean) => void
}) {
  const id = useId()
  const describedBy = `${id}-describes`

  return (
    <div
      className={`border-ink bg-plate flex max-w-md items-start gap-3 border-3 p-3 ${
        checked ? 'shadow-plate' : ''
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onToggle(event.target.checked)}
        aria-describedby={describedBy}
        className="accent-ink mt-1 size-4"
      />

      <div>
        <label htmlFor={id} className="block cursor-pointer text-[15px] font-medium">
          {scope.label}
        </label>

        <span id={describedBy}>
          <span className="text-ink-soft mt-1 block text-[13px]">{scope.explains}</span>
          {/* The wire value, shown because someone writing the script that will carry
              this key needs to recognise it in an INSUFFICIENT_SCOPE message. */}
          <span className="text-ink-soft mt-1 block font-mono text-[13px]">{scope.value}</span>
        </span>
      </div>
    </div>
  )
}

const LIFETIMES: { label: string; days: number | null }[] = [
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: '1 year', days: 365 },
  { label: 'Never expires', days: null },
]

/**
 * A native `<select>`, styled to match the inputs.
 *
 * "Never expires" is a real option and stays one. A key that dies on a schedule breaks
 * an unattended integration at an hour nobody is awake, and that objection did not stop
 * being true when expiry shipped (ADR-0020) — so a lifetime is offered with a sensible
 * default and never forced.
 */
function ExpiryPicker({
  value,
  onChange,
}: {
  value: number | null
  onChange: (next: number | null) => void
}) {
  const id = useId()

  return (
    <div className="mt-8 max-w-md">
      <label
        htmlFor={id}
        className="text-ink-soft font-body block text-xs font-semibold tracking-[0.08em] uppercase"
      >
        Expires
      </label>

      <select
        id={id}
        value={String(value)}
        onChange={(event) =>
          onChange(event.target.value === 'null' ? null : Number(event.target.value))
        }
        className="border-ink bg-plate font-body mt-2 min-h-11 w-full border-3 px-3 text-[15px]"
      >
        {LIFETIMES.map((lifetime) => (
          <option key={lifetime.label} value={String(lifetime.days)}>
            {lifetime.label}
          </option>
        ))}
      </select>

      <p className="text-ink-soft mt-2 text-[13px]">
        An expired key stops working but stays in this list, so you can see why something broke.
      </p>
    </div>
  )
}

/**
 * Whether a key is alive, and until when.
 *
 * The word as well as the colour, like {@link Badge} — an expired key is red *and* says
 * "Expired", so the state survives someone who cannot tell the two reds apart.
 *
 * Derived from `expiresAt` rather than sent as a status by the server. The timestamp is
 * the fact; "expired" is a rendering of it, and a second field would be a second thing
 * that can disagree with the first.
 *
 * `now` is passed in rather than read here, so every row in one render is judged against
 * the same instant.
 */
function Lifetime({ expiresAt, now }: { expiresAt: string | null; now: number }) {
  if (expiresAt === null) {
    return (
      <p className="text-ink-soft font-body text-xs font-semibold tracking-[0.08em] uppercase">
        No expiry
      </p>
    )
  }

  const expired = new Date(expiresAt).getTime() <= now

  return (
    <p
      className={`font-body text-xs font-semibold tracking-[0.08em] uppercase ${
        expired ? 'text-signal' : 'text-ink-soft'
      }`}
    >
      {expired ? 'Expired ' : 'Expires '}
      {formatMoment(expiresAt)}
    </p>
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

      {/* Repeated here on purpose. This panel is the last screen someone reads before
          pasting the key into a config file, and what it can do is the thing they will
          want to check against what they are about to give it to. */}
      <p className="text-ink-soft mt-6 font-mono text-[13px]">
        {created.scopes.join('  ·  ')}
        {created.expiresAt ? `  ·  expires ${formatMoment(created.expiresAt)}` : '  ·  no expiry'}
      </p>

      <Button className="mt-6" onClick={onDismiss}>
        I have saved it
      </Button>
    </Plate>
  )
}
