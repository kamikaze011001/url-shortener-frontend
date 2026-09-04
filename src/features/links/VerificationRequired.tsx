import { ButtonLink } from '@/components/ui/ButtonLink'
import { Plate } from '@/components/ui/Plate'

/**
 * Stands where the create form would be, for an Owner who has not confirmed their
 * address.
 *
 * Replaces the form rather than disabling it. A disabled form invites the user to fill
 * it in and then discover it does nothing, and a form that submits and returns 403 is
 * worse — it spends their typing to tell them something the screen already knew.
 *
 * The list below stays visible. FR-1.7 blocks creating Links, not reading them, and
 * hiding an Owner's own data would be a punishment nobody asked for.
 */
export function VerificationRequired({ email }: { email: string }) {
  return (
    <Plate as="section" className="p-6">
      <h2 className="font-display text-title">Confirm your email first</h2>

      <p className="text-ink-soft mt-4 max-w-xl text-[15px]">
        We sent a code to <span className="text-ink font-mono text-[13px]">{email}</span>. Once you
        confirm it, you can start shortening URLs.
      </p>

      <ButtonLink to="/verify-email" className="mt-6">
        Enter the code
      </ButtonLink>
    </Plate>
  )
}
