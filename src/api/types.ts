/**
 * The domain vocabulary, named.
 *
 * Everything here is an alias into the generated schema, so these names cost nothing at
 * runtime and break loudly when the contract changes. Features import from this file and
 * never reach into `components['schemas'][...]` themselves — that indirection is how a
 * contract rename stays a one-line edit instead of a find-and-replace.
 */
import type { components } from './schema'

export type Owner = components['schemas']['Owner']
export type Link = components['schemas']['Link']
export type LinkPage = components['schemas']['LinkPage']
export type LinkStats = components['schemas']['LinkStats']
export type CreateLinkRequest = components['schemas']['CreateLinkRequest']
export type UpdateLinkRequest = components['schemas']['UpdateLinkRequest']

/** `EXPIRED` is derived by the server from `expiresAt`; it is never stored. */
export type LinkStatus = Link['status']

export type DestinationChange = components['schemas']['DestinationChange']
export type ApiKey = components['schemas']['ApiKey']
export type ApiKeyCreated = components['schemas']['ApiKeyCreated']
