---
version: 1.0
name: switchboard
description: >
  A warm-industrial neo-brutalist interface for a URL shortener. The system is built on
  the idea of a telephone switchboard — an operator patching a short code through to a
  destination — because that is literally what a redirect is. Oat paper and bone plates
  carry brass, oxidised green and signal red; hard 3px ink borders with offset shadows
  cast in brass rather than black. Type runs Bricolage Grotesque for display against
  JetBrains Mono for every Short Code and URL, because those are monospace by nature and
  not by decoration. The signature is a split-flap code reveal: when a link is created,
  the seven characters flip into place like a departure board.

colors:
  ink: '#16150F'
  ink-soft: '#4A483C'
  paper: '#E9E7DE'
  plate: '#FDFCF7'
  brass: '#C8912B'
  brass-deep: '#9A6D1C'
  patch: '#2F6B4F'
  signal: '#D93A2B'
  hairline: '#CBC8BA'

typography:
  display:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 56px
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: -0.03em
  title:
    fontFamily: "'Bricolage Grotesque', sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  lede:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 12px
    fontWeight: 600
    letterSpacing: 0.08em
    textTransform: uppercase
  code:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: 15px
    fontWeight: 500
    letterSpacing: 0

spacing:
  unit: 4px
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96]

shape:
  radius: 0
  borderWidth: 3px
  shadow: '4px 4px 0 #C8912B'
  shadowLarge: '7px 7px 0 #C8912B'
  shadowPressed: '1px 1px 0 #C8912B'
---

# Switchboard

The design system for the URL Shortener dashboard. **This file is the source of truth.**
`src/styles/tokens.css` is its executable half; a colour, size or shadow that appears in
a component but not here is a defect, not a variation.

## Overview

A URL shortener does one thing: it stands between a short string and a long one. The
interface is built around that act of patching one to the other — hence plates, labels,
and a visible connection between a code and its destination.

The direction is neo-brutalism, and it deliberately avoids that style's own template:
no `#FFFF00` on white, no black offset shadows, no Archivo Black, nothing rotated one
degree. Three specific decisions keep it away from that:

- **Shadows are brass, not black.** The single highest-leverage change; black offsets
  are what make neo-brutalist work read as a clone.
- **The palette is warm-industrial**, drawn from switchboard hardware — bakelite ink,
  brass fittings, oxidised copper, a signal red — rather than from the highlighter set.
- **Monospace is load-bearing, not decorative.** Short Codes and URLs are monospace in
  reality; setting them in mono is honesty about the material.

## Colors

### Surface

| Token   | Hex       | Use                                                        |
| ------- | --------- | ---------------------------------------------------------- |
| `paper` | `#E9E7DE` | Page background. Oat, deliberately cooler than cream.      |
| `plate` | `#FDFCF7` | Every card, row, input and panel. The only raised surface. |

Two surfaces only. A third would make the hierarchy ambiguous and would dilute the
border-and-shadow system that already does that job.

### Ink

| Token      | Hex       | Use                                                        |
| ---------- | --------- | ---------------------------------------------------------- |
| `ink`      | `#16150F` | Body text, all borders.                                    |
| `ink-soft` | `#4A483C` | Secondary text, labels, timestamps.                        |
| `hairline` | `#CBC8BA` | Table rules and dividers only — never a border on a plate. |

### Accent

| Token        | Hex       | Use                                                   |
| ------------ | --------- | ----------------------------------------------------- |
| `brass`      | `#C8912B` | Every offset shadow. Focus rings. Never a large fill. |
| `brass-deep` | `#9A6D1C` | Hover and pressed states of brass surfaces.           |
| `patch`      | `#2F6B4F` | Active status. Success. The "connected" state.        |
| `signal`     | `#D93A2B` | Destructive actions, errors, disabled links.          |

There is no separate `warning`. A thing is either working, broken, or being destroyed;
inventing a fourth state would mean inventing a meaning for it.

## Typography

Display **Bricolage Grotesque** — variable, slightly irregular, and specifically not the
Space Grotesk / Archivo Black pairing that ships with every neo-brutalist template.

Body **Inter Tight**: narrower than Inter, which suits a dense table without dropping to
a smaller size.

Code **JetBrains Mono**, for Short Codes, aliases, destination URLs and any HTTP status.

### Hierarchy

| Role      | Size / weight                 | Where                                      |
| --------- | ----------------------------- | ------------------------------------------ |
| `display` | 56 / 800                      | One per page, at most. The page's thesis.  |
| `title`   | 32 / 700                      | Section headings.                          |
| `lede`    | 18 / 400                      | One paragraph under a display, never more. |
| `body`    | 15 / 400                      | Everything else.                           |
| `label`   | 12 / 600, uppercase, `0.08em` | Field labels, column headers, status text. |
| `code`    | 15 / 500 mono                 | Codes, URLs, status codes.                 |

### Principles

- **A URL is always mono.** Including in the table, including in toasts, including when
  truncated. It is the thing the user is here to read carefully.
- **Uppercase is for labels only.** Uppercase body text is decoration pretending to be
  emphasis.
- **One display per page.** Two competing 56px headings means neither is the thesis.

## Layout

### Spacing

A 4px base. Use `4 8 12 16 24 32 48 64 96` and nothing between them — an arbitrary 18px
is how a system stops being one.

### Grid

Content is capped at `1120px`. The dashboard is a single column: a sidebar would be
navigation for four screens that do not need it.

### Whitespace

Neo-brutalism is dense, not airy. Plates sit close together and borders carry the
separation that whitespace would carry elsewhere. Where two plates are adjacent, the gap
is at least the shadow depth plus 4px, or the shadow lands on its neighbour.

## Elevation & Depth

One elevation, expressed three ways:

| Token                  | Value              | Meaning                                        |
| ---------------------- | ------------------ | ---------------------------------------------- |
| `shadow-plate`         | `4px 4px 0 brass`  | At rest.                                       |
| `shadow-plate-lg`      | `7px 7px 0 brass`  | Hover on an interactive plate.                 |
| `shadow-plate-pressed` | `1px 1px 0 brass`  | Active/pressed, with a matching 3px translate. |
| `shadow-plate-signal`  | `4px 4px 0 signal` | The one exception: a form-level error plate.   |

Press moves the element _toward_ its shadow, so the plate feels physically pushed. That
is the entire interaction language — no fades, no scale.

`shadow-plate-signal` exists because a form-level error is a plate, and a plate with a
brass shadow beside red text reads as decoration rather than as the thing that went
wrong. It is the only place a shadow is not brass, and it is deliberately not used on
field-level errors — one red border per problem is enough.

There are no blurred shadows anywhere. A soft shadow in this system reads as a bug.

## Shapes

**Radius is `0` everywhere.** No exceptions, including avatars and toasts. Half-rounded
neo-brutalism reads as a theme someone abandoned.

Borders are `3px solid ink` on every plate. Table rules are `1px hairline`.

## Components

### Buttons

| Variant   | Fill     | Border    | Shadow | Use                                                            |
| --------- | -------- | --------- | ------ | -------------------------------------------------------------- |
| Primary   | `ink`    | 3px `ink` | brass  | One per view: the thing you came to do.                        |
| Secondary | `plate`  | 3px `ink` | brass  | Everything else.                                               |
| Danger    | `signal` | 3px `ink` | brass  | Delete only. Never the default focus.                          |
| Ghost     | none     | none      | none   | Table row actions, where borders would create a grid of cages. |

All buttons: `label` type, 44px minimum height, translate-on-press.

**Primary is ink-filled, not brass-filled.** The first draft of this file said brass, and
rendering it showed the flaw immediately: a brass plate sitting under a brass shadow makes
the shadow vanish, so the most important button on the page was the only one with no
depth. Ink fill also ties the primary action to the split-flap plates, which are the other
ink surfaces in the system. `brass` remains the shadow and focus colour everywhere.

### Inputs

3px `ink` border on `plate`, no radius, 44px tall. Label above in `label` type, never a
placeholder standing in for a label — a placeholder disappears exactly when the user
needs it.

Errors: 3px `signal` border plus a message below in `signal`. Never colour alone;
colour alone excludes anyone who cannot distinguish it. The message is wired to the input
with `aria-describedby` and the input carries `aria-invalid`, so it is announced and not
merely visible.

A **form-level** error — one that belongs to the submission rather than to a field, such
as a wrong password — is a `signal`-bordered plate above the submit button, carrying
`shadow-plate-signal` and `role="alert"`.

### The link row

The core object. Left: the Short Code in `code` type, large. Right: the destination,
truncated from the middle so both the domain and the path tail stay visible — truncating
the end hides the part that distinguishes two links to the same site. Between them, a
horizontal **patch line** in `hairline`, which is the switchboard idea made literal.

Status is a plate-bordered badge: `patch` for active, `ink-soft` for disabled, `signal`
for expired.

### Data display

Statistics are drawn from the same three surfaces as everything else — no charting
library, because one arrives with rounded corners, soft shadows and a gradient fill, and
every one of those has to be fought back to the tokens.

- **The daily series is `ink` bars** on a `hairline` baseline, one per day in the window.
  A day with zero clicks keeps a 2px `hairline` sliver: the axis has to read as a run of
  days, not as a gap where data is missing.
- **Breakdown bars are `brass`,** and they are the one exception to "brass is never a
  fill". They are 4px tall, and the rule exists to stop brass becoming a large flat plate
  that swallows the shadow it is supposed to cast — a hairline-thin bar does not.
- **Each breakdown is scaled to the largest row in its own list**, never to the total.
  These are top-ten slices of an unbounded set, and a bar drawn as a share of the total
  would quietly claim the tail is empty.
- **A chart is not accessible by having a `title` attribute.** That is a mouse
  affordance. The bars are `aria-hidden` and the same numbers are exposed as a real,
  visually hidden table, so a screen reader gets the data rather than a description of a
  picture of the data.

### QR code

Drawn as one SVG path from the computed modules — `ink` on `plate`, 3px `ink` border,
zero radius, and a four-module quiet zone the spec requires for a scanner to find the
code's edges at all.

**Never decorated.** No logo through the middle, no rounded dots, no gradient. Each eats
into the error-correction budget and measurably lowers the scan rate, and a code that
fails on a poor camera in a lecture hall is worse than a plain one that works.

It appears on the link detail screen and **not** in the creation reveal. The split-flap
is the one bold moment in this system, and a QR beside it would split the attention it
exists to hold.

### Split-flap code reveal — the signature

When a link is created, its seven characters flip into place one at a time, ~40ms apart,
like a departure board. It appears **once**, on creation, and nowhere else.

This is the one bold element. It earns its place because generation is the product's
whole moment, and because it makes the base62 alphabet visible — the flaps cycle through
real candidate characters. It is skipped entirely under `prefers-reduced-motion`, where
the code simply appears.

## Do's and Don'ts

### Do

- Cast every shadow in `brass`.
- Set every URL, code and alias in mono.
- Put the label above the field.
- Give destructive actions a confirmation that names what is being destroyed.
- Write the empty state as an instruction: "Shorten your first URL" beats "No links yet".

### Don't

These are the patterns that make an interface look machine-generated. Each is banned by
name so "it looked fine" is not an argument:

- **Gradient text**, gradient buttons, or a purple/indigo gradient anywhere.
- **Glassmorphism** — backdrop blur, translucent panels.
- **Emoji as icons**, in buttons, headings, or empty states.
- **Rounded corners and soft shadows**, including any shadcn default that survives.
- **Marketing voice on a tool**: "Blazingly fast", "Supercharge", "Effortlessly".
- **A centred hero with three feature cards**, each with an icon and a two-line blurb.
- **`01 / 02 / 03` numbering** on things that are not a sequence.
- **Skeleton shimmer** on a table that loads in 40ms. Show the empty plate.
- **A toast for every action.** Toast what the user cannot see; a row that visibly
  changed does not need announcing.
- **Fake social proof**: invented testimonials, logo walls, "trusted by" counters.

## Responsive Behavior

### Breakpoints

`sm 640` · `md 768` · `lg 1024`. Three, because there are three real layouts: phone,
tablet, desk.

### Touch targets

44×44 minimum, including ghost buttons in table rows. Below `md` the row actions become
an explicit menu rather than three small icons.

### Collapsing

The link table becomes stacked plates below `md` — one plate per link, code above
destination. It does not become a horizontally scrolling table; a table you have to
scroll sideways to read is a table nobody reads.

## Iteration Guide

When adding a component:

1. Check whether an existing token covers it. If not, add the token **here first**.
2. Build it from `plate` + 3px `ink` + a brass shadow before reaching for anything else.
3. Check it against **Don't** above, item by item.
4. Tab to it. If the focus ring is invisible or the order is wrong, it is not finished.

## Known Gaps

- **No dark mode.** The palette is built on paper and brass; a dark inversion would be a
  different design, not a variant. Deferred rather than half-built.
- **Fonts load from Google Fonts**, which is a third-party request on the critical path.
  Self-hosting is the fix and is not done.
- **No icon set chosen.** Row actions use text labels today. That is deliberate for now —
  text is unambiguous — but a dense table will eventually need icons with accessible
  names.
- **The split-flap has one implementation** and has not been tested against a screen
  reader. It is decorative and marked `aria-hidden`, with the code announced separately.
