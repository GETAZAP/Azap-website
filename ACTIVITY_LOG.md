# Website Activity Log

Newest first. Records what was done, what was found, what was verified, what's left.

This file covers `getazap.com` only. The mobile app, the admin console and the
database live in the `Azap` repository and are logged there.

---

## [2026-09-10] — Instagram link in the footer

AZAP has one social account, so the footer now carries one link rather than a
social row. It sits in the bottom bar opposite the copyright, with the glyph
*and* the word "Instagram": a row built for one icon reads as though the other
four failed to load, and a bare glyph makes the reader guess.

The mark is an inlined Simple Icons path. Loading a glyph from a CDN would put a
third party back on every page of a site that currently contacts none, and would
need a CSP amendment to do it.

Driven by a `SOCIALS` array, so a second account is one entry and the visible
label can drop to icons at that point.

The profile was also added to `sameAs` in the `LocalBusiness` structured data,
which is how a search engine ties the business to accounts claiming to be it.
Anything added to the footer should be added there too.

### Verified

Link resolves (`HTTP/2 200`). Rendered: `target="_blank"` with
`rel="noopener noreferrer"`, an `aria-hidden` glyph, an sr-only "(opens in a new
tab)", a 44px tap target and 6.46:1 contrast at 12px.

| width | flex-direction | layout |
|---|---|---|
| 1280px | `row` | same row — copyright left (64..387), Instagram right (1106..1216), both centred at y 3827 |
| 375px | `column-reverse` | Instagram above the copyright, centred, inside the viewport |

### Trade list removed from the last five places

The narrowing corrected in the page title and the hero survived in five more
spots, two of which mattered more than either:

| where | why it mattered |
|---|---|
| `Layout.astro` default `description` | shown under the search result for every page that sets no description of its own |
| `Footer.tsx` strapline | on every page of the site |
| `Layout.astro` JSON-LD `description` | what structured data tells a search engine the business is |
| `about.astro` description | the page people read to understand the company |
| `site.webmanifest` description | shown when the site is added to a home screen |

The footer now reads "Vetted pros in Enugu, whatever the job. Free to book, and
we take no commission on your job." The site-wide default is "AZAP sends vetted
service providers across Enugu, whatever the job", with the money facts after
it — the homepage and `/services` set their own descriptions and carry the
category keywords, so the fallback does not need to.

`/services` still lists all eleven trades, deliberately: that is the page whose
job is the list.

Verified: no page outside `/services` names a fixed set of trades, every page
still has a description, and contrast and overflow are unchanged across all
sixteen.

---

## [2026-09-10] — 404 rebuilt, and a character flip written rather than installed

### The flip

Asked whether a `flip-text` component from a third-party shadcn registry could be
used. Read the manifest before answering: it ships a single `.tsx` that sets
`--flip-duration`, `--flip-delay` and `--flip-iteration` on per-character spans
and **no CSS at all** — the string `keyframes` appears nowhere in the payload —
so installed as published it splits text into spans and animates nothing. It
also imports `cn` from `@/lib/utils`, and this project has no `@/` alias, no
`components.json`, and none of `clsx` / `tailwind-merge` / `cva`. Initialising
shadcn to get a broken decoration was not worth it.

The whole effect is fifteen lines. `@keyframes azap-flip` and `.flip` / `.flip-char`
now sit in `global.css` beside `.rise`, with the same discipline: the base state
is the readable one, so if the animation never runs the characters simply sit
there, and `prefers-reduced-motion` switches it off.

The rotation completes at 40% of the duration and holds to 100%, which gives a
pause between passes instead of relentless spinning.

Deliberately **not** used on the homepage: the hero headline has to render on bad
connections, already carries a `.rise` entrance, and is captured into the Open
Graph image, where an animating headline would freeze mid-flip.

### The page

Rebuilt to the supplied reference layout — oversized numeral, heading, one short
line, two buttons, whitespace. The template's square buttons were not copied;
every button on this site is a capsule and a 404 is a poor place to introduce a
second button shape.

The numeral is split per character in the frontmatter rather than by a client
component: three characters of decoration do not justify shipping JavaScript,
and the text is in the HTML either way. It carries `aria-hidden` with an
`sr-only` "Error 404." twin, because three separate spans get announced
character by character and the `<h1>` underneath already says what happened.

### Verified

Animation driven by the Web Animations API rather than a wall clock — set
`currentTime` at each phase and read the computed matrix back:

| phase | transform |
|---|---|
| 0% | identity |
| 10–30% | rotating (matrix3d) |
| 40%–100% | identity, held |

Contrast, overflow and headings clean at 375, 390, 768 and 1280px. Numeral
measured centred and inside the viewport at every width (83..292 in a 375
viewport), buttons 24..351 at 46px tall. Reduced-motion capture confirms the
resting design and that the guard works.

**Two more headless-Chrome traps, on top of the scroll ones already logged.**
A screenshot taken with `--virtual-time-budget` catches a CSS animation at an
arbitrary point, so it showed the numeral upside down and looked like a broken
keyframe when the animation was correct. And `--window-size=390,844` does not
emulate a mobile device, so the mobile capture rendered wider than the window and
appeared clipped, while direct measurement at the same width showed a correct,
centred layout. Measure the DOM; do not diagnose from headless screenshots.

---

## [2026-09-10] — Navbar swapped treatment 24px into a full-screen hero

The glass navbar turned from transparent to light while the hero was still
filling the whole screen. Cause: `window.scrollY > 24`. Two notches of the wheel
and you had a white bar sitting on a dark photograph for the remaining height of
a viewport.

The threshold is now measured rather than assumed — the hero section's own
height minus the navbar's height, recomputed on resize. A constant cannot work
here: the hero is `min-h-[100svh]`, so it grows when the copy wraps on a narrow
phone, and `svh` itself changes as a mobile URL bar hides. Pages without
`overHero` keep the small offset, since they never render the transparent
treatment at all and it only drives their border and shadow.

Measured on the built site at 1280x900:

| scrollY | navbar |
|---:|---|
| 0, 24, 300, 761, 816 | transparent |
| 826, 881, 1400 | light glass |

Hero is 900px, navbar 79px, so the swap lands at 821 — the frame the bar's lower
edge clears the hero. `/about` confirmed light at every scroll position, as
before.

**Testing note for next time.** Two headless-Chrome traps cost time here. `html`
carries `scroll-smooth`, so `window.scrollTo(0, y)` animates and the animation
never runs under `--virtual-time-budget` — scrollY stays 0 and every reading is
meaningless. And even with `behavior: 'instant'`, a programmatic scroll inside an
iframe does not deliver a `scroll` event, so listeners never fire; the state has
to be nudged with an explicit `dispatchEvent(new Event('scroll'))`. Both look
exactly like a broken component.

### Hero body

Settled at:

> **A vetted pro at your door.**
> Whatever the job, we check their ID, bank and guarantor first.

Briefly ran as "we make sure they're vetted before we send them", which was
shorter still but repeated "vetted" from the headline immediately above it and
dropped the named checks. Naming them is the whole reason a reader should
believe the word, since every competitor also claims it. This wording keeps the
specifics at the same length.

One line at every width from 768px up, two at 375px. Share image regenerated.

---

## [2026-09-10] — Homepage CTA copy

Both calls to action on the homepage were rewritten.

### Hero

Was:

> **Your Space, Managed.**
> Plumbers, electricians, cleaners and cooks in Enugu. Every one is ID-checked,
> bank-verified and guarantor-backed. Free to book. You agree the price with your
> pro, and AZAP takes no cut of it.

The headline was brand language that gave a first-time visitor nothing to act
on, and the paragraph named four of the eleven trades AZAP covers — the same
narrowing the page title had just been corrected for, in the more visible place
of the two, and now also burned into the link-preview image.

Now:

> **A vetted pro at your door.**
> Whatever the job, we send someone whose ID, bank account and guarantor we have
> checked ourselves. Free to book, and you agree the price directly with your
> pro. AZAP takes no cut of it.

It leads with the thing the customer is actually deciding — whether to let a
stranger into the house — because that is the claim AZAP can make and a saved
phone number cannot. No trade is named; `/services` is where the list belongs.

Then cut again, to one sentence:

> **A vetted pro at your door.**
> Whatever the job, we check their ID, bank account and guarantor before we send
> them.

The two money facts came out because the strapline forty pixels below already
carries them — "No app to install. No booking fee. No commission." Free-to-book
and no-commission were being stated twice inside one screen, which did not make
them twice as true; it made the hero something to read rather than something to
glance at. Trust in the paragraph, money in the strapline, numbers on
`/pricing`. The paragraph's `max-w-2xl` dropped to `max-w-xl` to match.

Hero body is now 3 lines at 375px, 2 at 768px and above (was 5 and 3).

### Closing CTA

Header kept. The body said "Booking is free and takes a minute. We'll call you
back to confirm," which led on speed. It now leads on what happens next, since
that is the last unanswered question before the button:

> Tell us what needs doing and a real person calls you back to confirm before
> anyone is sent. It takes about a minute and costs nothing.

### Regenerated

The share image is a render of the homepage, so it carried the old headline and
was recaptured.

### Verified

Homepage rendered at 375px, 768px and 1280px: no contrast failures, no
horizontal overflow, heading hierarchy clean at every width. Copy confirmed from
the built DOM rather than the source.

---

## [2026-09-10] — Hero flash traced to a single frame; homepage trimmed

### The hero flash was one frame of video

The complaint was that an image appeared for a moment before the video started.
The hero was stacking three layers: a blurred data-URI placeholder, then
`hero.jpg` — a standing portrait — and then the video on top. Because `hero.jpg`
and the video's opening frame were two different photographs, you saw the
portrait and then watched it get replaced.

`hero-poster.jpg` was already the video's first frame (verified: 0.54/255 mean
difference against `ffmpeg` frame zero, which is JPEG noise). But frame zero
itself turned out to be a motion-blurred whip-pan of a tilted face — a poor
still, which is presumably why `hero.jpg` was introduced in the first place.
Frame 1 onwards is a clean, well-composed shot.

So the fix was to drop exactly one frame: both videos were re-encoded from
t=0.0417s and the poster regenerated from the new frame zero. The hero now
renders a single image, and it is byte-identical to what the video opens on, so
there is nothing left to flash.

`hero.jpg` and the blurred placeholder derived from it are deleted.

Re-encoding also brought the files back under their previous weights, which a
first pass had not: mp4 1385KB (was 1418KB), webm 1007KB (was ~1200KB). The webm
must stay below the mp4 or serving it first is pointless.

### Removed: "Repairs and household help"

The three-card services section is gone from the homepage. It held the last
`<motion.div>` and the last icon on the page, so `framer-motion`, the `Icons`
object and the two unused variant objects went with it. **`framer-motion` is no
longer a dependency of this site at all** — `AnimatedLanding` is now 7KB.
`cooking_hd.jpg` became orphaned and was deleted.

### Share image is now a render of the site

The composed 1200x630 card was replaced with an actual headless-Chrome capture of
the homepage, taken at 2x and downsampled, so the type in a link preview is the
site's own Plus Jakarta Sans and the picture cannot drift out of date. The exact
command is recorded in `Layout.astro` next to the `image` default.

### Homepage title

"Book a vetted plumber, electrician or cleaner in Enugu" named three of the
eleven trades AZAP covers, which implies the other eight are not on offer. Now
"Book a vetted service provider near you today".

### Verified after all of the above

Re-ran the full sweep across all sixteen pages: zero contrast failures, zero
mobile overflow, heading hierarchy clean, no missing alt text, no unlabelled
inputs, no undersized tap targets, title/description/icons/manifest/CSP present
throughout. The video gate confirmed passing at 1440px in a real headless window
(the Browser pane reports `innerWidth: 0` while hidden, which fails the 768px
check — a pane artefact, not a defect).

### Noticed, not changed

- The hero paragraph still opens "Plumbers, electricians, cleaners and cooks in
  Enugu" — the same narrowing the page title was just corrected for, and it is
  now visible in the share image too.
- `chef_localized.jpg` and `smart_lock.jpg` are referenced from nowhere.

---

## [2026-09-10] — Site-wide audit: accessibility, security, consent, mobile, metadata

A checklist pass over all sixteen pages. Everything below was measured in a real
browser against the production build rather than inferred from the source, and
the numbers quoted are the numbers the browser reported.

### Colour contrast — 13 genuine failures, all one cause

An automated WCAG pass over every rendered text node on every page, computing
each element's effective background by walking its ancestors, found thirteen
elements below the AA threshold. All thirteen were the brand green `#10B981`
used as *text* on a light background: **2.43:1 measured, against 4.5:1
required.**

Twelve of them were the contact links on `/terms` and `/privacy` — the email
addresses someone uses to exercise a data right were the least readable text on
the site.

Rather than darken the brand, `--color-accent-ink: #047857` was added alongside
it. Same hue, 5.48:1 on white. `--color-accent` stays exactly as it was for
fills, borders, dots, icons and for text on dark backgrounds, where it already
measures 7.84:1 against `--color-ink`.

Also raised: form labels and hints from `zinc-400` (2.46:1) to `zinc-600`
(7.41:1), and the "(optional)" markers from `zinc-300`, which measured **1.42:1**
and was effectively invisible.

Re-run after the fix: **zero failures across all sixteen pages.** The single
remaining report is the navbar wordmark in white over the hero video, which the
audit cannot see behind — a limitation of the tool, not a defect.

### Third parties — the site now has none

Two existed. **Google Fonts** was on every page view, which meant Google received
every visitor's IP address and referring URL simply because they opened the site.
The typeface is now self-hosted via `@fontsource-variable`, bundled by Vite and
served from our own origin.

A network trace of all sixteen pages of the production build confirms **every
single request is same-origin.** Nothing leaves getazap.com when a page loads.

The second, **Web3Forms**, only receives anything when someone actually submits
the contact form, and is disclosed as a processor in the privacy policy.

### Cookies and consent

Verified by search rather than assumed: no analytics, no tag manager, no pixel,
no `document.cookie`, no `localStorage`, no `sessionStorage` anywhere in the
source. The privacy policy's claim that the site sets no cookies is true.

**No cookie banner has been added, deliberately.** There is no consent to
collect. With Google Fonts gone there is no longer even an arguable case for one.
The policy now says this explicitly, so the absence reads as a decision rather
than an oversight.

What was added instead is consent copy at the point of collection — on the
booking form, the contact form and the footer capture — each stating the purpose,
who receives the data and a link to the policy. The booking form names the
address specifically, because that is the sensitive field and it is shared with
the assigned pro.

### Security

**HTML injection into the dispatch email (real, fixed).** `notificationHtml()` in
the `web-booking` edge function interpolated `customer_name`, `address`, `notes`
and `preferred_time` — all public form input — straight into HTML with no
escaping. A booking named
`<a href="https://not-azap.example">Call this number instead</a>` rendered as a
working link in the dispatcher's inbox; a name containing `</td><td>` could
rearrange the table so the number displayed was not the number stored. Neither
needs script execution to do damage, because the person reading it is about to
ring whichever number they see. All interpolation is now escaped, and CRLF is
stripped from the email subject.

**Origin check bypass (real, fixed).** The guard read
`if (origin && !ALLOWED_ORIGINS.includes(origin))`, so a request with **no**
Origin header skipped it entirely — which is exactly what `curl -X POST` sends.
Now requires the header. The site and the function are on different hosts, so a
browser always sends one.

Verified against both projects after deploying:

| Request | Result |
|---|---|
| No Origin header | `403 forbidden_origin` |
| `Origin: https://evil.example` | `403 forbidden_origin` |
| Honeypot filled | `200` with a null reference, no row written |
| Valid preflight from `www.getazap.com` | `200`, correct `Access-Control-Allow-Origin` |

`concierge_bookings` remained at **0 rows** on both staging and production
throughout — the rejections happen before any database call, so no dispatch
emails were sent this time.

**Content Security Policy.** A hand-written `script-src 'self'` was tried first
and silently killed all hydration: Astro emits its island bootstrap as inline
`<script>` blocks whose contents change per page and per build. Astro's
build-time CSP (`security.csp`) now hashes every inline script and writes a
per-page policy — no `'unsafe-inline'` for scripts, nothing to maintain by hand.
Verified by clicking through the booking form on the built output: all three
islands report `ssr=false`, meaning hydration completed under the policy.

`frame-ancestors` cannot be enforced from a `<meta>` tag, so clickjacking is
covered by a header in the new `vercel.json`, alongside `X-Content-Type-Options`,
`Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `COOP` and HSTS. The
live site previously sent **only** HSTS.

**Rate limiting.** The booking endpoint's limits already live in Postgres
(3/phone and 6/IP-hash per 30 minutes) — that was fixed on 2026-09-09 after an
in-memory limit was found not to work. The two Web3Forms-backed forms have no
server of ours to throttle at, so they gained honeypot fields instead; the
booking form's honeypot is enforced in the edge function, which drops the request
and answers with the same shape a real booking gets, so a bot learns nothing
about which check caught it.

`set:html` is used in two places (`/terms`, `/privacy`) and both interpolate
author-controlled constants from the same file. No user input reaches it.

### Accessibility

Alt text was present everywhere but wrong in four places, all the same mistake:
describing an image whose caption is already rendered as adjacent text. The
`PageHero` photo used `alt={title}`, so a screen reader read every page's
headline twice. Those are now `alt=""`, which is what a decorative image should
carry.

Heading hierarchy was broken on all sixteen pages: the footer's column headings
were `<h4>` sitting directly under page `<h2>`s. Fixed at source, plus `h3`s that
preceded any `h2` on `/faq`, `/provider`, `/verification` and the homepage.
Verified clean across all sixteen.

One tap target under the 44px minimum ("Book this", 20px tall) was enlarged.
No unlabelled inputs, no controls without accessible names, one `<h1>` per page.

### Mobile

Rendered every page at 375px. **No horizontal overflow anywhere** — and confirmed
by re-running with the new `overflow-x: hidden` guard forcibly disabled, so the
guard is a safety net rather than something masking a real defect.

### Metadata and icons

The site had no favicon: it pointed at `logo.png`, a 1080×1080 black glyph on
transparency that vanishes against dark browser chrome and reads as a smudge at
16px. A full icon set is now generated from it — white mark on an ink tile —
covering `favicon.ico` (16/32/48), PNG favicons, a 180px `apple-touch-icon` with
no alpha (iOS renders transparency as black), and 192/512/maskable icons with a
web manifest.

A 1200×630 Open Graph image was created. Every other image on the site is square,
which crops to a sliver in a WhatsApp preview — which is how a link to this site
actually travels in Enugu.

The homepage title was "Your Space, Managed." — brand language that names neither
the service nor the city. It is now "Book a vetted plumber, electrician or
cleaner in Enugu". `/404` is now `noindex`. Structured data (`LocalBusiness`) was
added, and `og:locale`, `theme-color` and image dimensions.

### Contact details

**The phone number appeared nowhere on the site.** `+234 704 723 1349` is now a
`tel:` link in the footer and on `/contact`, in E.164 so it dials correctly from
a saved contact. The support address is a `mailto:` link in both places.

### Also corrected

- The footer's out-of-area capture posted `access_key: undefined` when the
  variable was unset, so the visitor was told "that didn't send" with no reason.
  It now fails with a clear message and a 15s timeout, and no longer logs the
  visitor's email address to the browser console.
- Success states on all three forms had no live region — a screen reader user
  heard nothing at all after pressing submit, on the one screen where the
  outcome is the whole point.
- "Become a Provider" and "Join as a pro" both promised an application route that
  does not exist; `/provider` itself says there is no online application. Relabelled.
- Vite was inlining one 1.7kB font subset as a `data:` URI, which the new
  font-src policy then blocked — a console error on every page load for a subset
  this site never renders. Fonts are now always emitted as files.

### Still open

- `PUBLIC_BOOKING_ENDPOINT` and `PUBLIC_WEB3FORMS_ACCESS_KEY` need setting on
  Vercel and a redeploy; Astro inlines them at build time, so adding them alone
  changes nothing.
- Vercel preview URLs are not on the edge function's origin allowlist, so a
  booking submitted from a preview deployment fails with `forbidden_origin`.
- No CAC number, registered office address or named DPO in the legal pages.
- Team bios are still one line short of written.
