import { useState } from 'react'
import type { Link } from '@/api/types'
import { CreateLinkForm } from './CreateLinkForm'
import { LinkTable } from './LinkTable'
import { NewLinkReveal } from './NewLinkReveal'

/**
 * The whole product on one screen: create at the top, everything you have below.
 *
 * The most recently created Link is held here rather than inside the form, so the reveal
 * stays on screen while the form clears and is typed into again.
 */
export function DashboardScreen() {
  const [created, setCreated] = useState<Link | null>(null)

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-12">
      <CreateLinkForm onCreated={setCreated} />

      {/* Keyed by id so a second creation remounts the reveal and the flaps run again. */}
      {created ? <NewLinkReveal key={created.id} link={created} /> : null}

      <LinkTable />
    </main>
  )
}
