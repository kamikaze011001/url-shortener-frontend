# url-shortener-frontend

The dashboard for the URL Shortener: register, log in, create and manage Links, read
their statistics.

**Two sources of truth, neither of them this file.**

- [DESIGN.md](./DESIGN.md) — every colour, size, shadow and component rule. A hex value
  that appears in a component but not in DESIGN.md is a defect.
- `contracts/openapi.yaml` — the API contract, vendored from
  [url-shortener-kb](https://github.com/kamikaze011001/url-shortener-kb) at the revision
  in `contracts/REVISION`. `src/api/schema.d.ts` is generated from it and is never
  hand-edited.

Where this code disagrees with either, this code is wrong.

## Commands

```bash
npm run dev         # :5173, proxies /api to the backend on :8080
npm run check       # typecheck + lint + format check — run before committing
npm run api:types   # regenerate src/api/schema.d.ts from the contract
```

## Where code goes

```
src/
├── api/          schema.d.ts (generated), the fetch client, TanStack Query hooks
├── components/
│   ├── ui/       design-system primitives: Button, Input, Plate, Badge
│   └── ...       composed pieces: LinkRow, CreateLinkForm, SplitFlapCode
├── features/     one folder per screen: auth, links
├── lib/          framework-free helpers
└── styles/       tokens.css — the executable half of DESIGN.md
```

The distinction that matters: **`components/ui/` knows about the design system and
nothing about URL shortening; `features/` knows about URL shortening and reaches for the
design system.** A component in `ui/` that mentions a Link, an Owner or a Short Code is
in the wrong folder.

## Design rules that are code rules

These are enforceable, so they are here as well as in DESIGN.md:

- **No hex values outside `tokens.css`.** Use the token utilities (`bg-plate`,
  `border-ink`, `shadow-plate`). A raw `#` in a component means a token is missing —
  add it to DESIGN.md, then `tokens.css`, then use it.
- **No `rounded-*`.** Radius is `0` everywhere in this system.
- **No blurred shadows.** Only `shadow-plate`, `shadow-plate-lg`, `shadow-plate-pressed`.
- **A shadcn default class that survives into a component is a bug.** shadcn is used as
  a source of accessible Radix behaviour; its visual defaults are exactly the generic
  look this design exists to avoid, so every variant is rewritten to the tokens.
- **The Don't list in DESIGN.md is binding.** Gradient text, glassmorphism, emoji icons,
  skeleton shimmer, a toast for every action — each is named there so "it looked fine"
  is not an argument.

## Interface writing

Copy is design material, and it is the fastest way to make a product look
machine-generated. The rules:

- **Name things by what the user controls**, never by how the system is built. "Link",
  not "resource". "Expires", not "TTL".
- **A button says what happens**: "Shorten URL", not "Submit". The verb survives the
  whole flow — a button that says "Delete" produces "Deleted", not "Success!".
- **Errors say what went wrong and what to do.** "That alias is taken. Try another." No
  apologies, no "Oops!", no exclamation marks.
- **Empty states are instructions**, not observations: "Shorten your first URL" over
  "No links yet".
- **Sentence case everywhere**, except `label` type, which is uppercase by design.
- **No marketing voice.** This is a tool. "Blazingly fast", "supercharge" and
  "effortlessly" are banned outright.

## Accessibility floor

Not a polish step — these are part of "done":

- Every input has a real `<label>`. A placeholder is not a label; it disappears exactly
  when the user needs it.
- Focus is visible on every interactive element. The brass ring in `tokens.css` is the
  system-wide answer; do not remove outlines.
- Colour never carries meaning alone. An expired Link is red **and** says "Expired".
- 44×44 minimum touch targets, table row actions included.
- `prefers-reduced-motion` is respected globally in `tokens.css`; the split-flap reveal
  degrades to the code simply appearing.

`oxlint` runs the `jsx-a11y` rules as errors. It catches the mechanical failures; it
cannot catch a wrong tab order, so tab through anything new before calling it done.

## Comments

Follow _A Philosophy of Software Design_: **a comment earns its place by holding
information the code cannot express.** Restating the code costs a line, teaches nothing,
and becomes a lie the first time the code changes without it.

**Write the interface comment first.** If describing a component takes a paragraph of
"and then, and also", the component does too much — the comment found the design problem
before the code did.

What to write:

- **Why, at the point of surprise.** Why the destination is truncated from the middle
  rather than the end; why the session is checked with a request instead of by reading
  storage.
- **What a caller must know but cannot see** — what a hook returns while loading, what
  it does on failure, what it will not do.
- **The decision behind something a reader would otherwise "fix"**, with a pointer to
  DESIGN.md or the relevant ADR.

Two properties keep comments honest:

- **A different abstraction level from the code.** `// map the links` above a `.map()`
  is noise; _why_ the list is not virtualised is information.
- **Placed where the reader is surprised**, not in a block at the top of the file.

## Facts a reader would otherwise get wrong

- **The session cookie is `httpOnly`.** JavaScript cannot read it, by design. "Am I
  logged in?" is answered by calling `GET /api/v1/auth/me`, never by inspecting storage.
  There is no token in `localStorage` and there must never be one.
- **`shortUrl` comes fully formed from the server.** Never build it by joining a base URL
  to a code — one place assembles that string and it reads the base from configuration.
- **Dev proxies `/api` to `:8080`** so development is same-origin, exactly like
  production behind Caddy. That is why there is no CORS configuration anywhere.
- **Errors are RFC 9457 `problem+json`.** Switch on the `code` field, which is part of
  the contract. `title` and `detail` are for humans and may be reworded at any time.
- **Tailwind v4 is CSS-first.** There is no `tailwind.config.js`; the theme lives in
  `@theme` inside `src/styles/tokens.css`.
- **This project uses `oxlint`, not ESLint** — it is what the current Vite template
  ships, and it runs the same `jsx-a11y` and `typescript` rule sets far faster.
