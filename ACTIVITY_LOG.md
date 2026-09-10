# Website Activity Log

Newest first. Records what was done, what was found, what was verified, what's left.

This file covers `getazap.com` only. The mobile app, the admin console and the
database live in the `Azap` repository and are logged there.

---

## [2026-09-10] — No visible divider above the footer, and a bad regex behind it

Spotted on the live site: nothing separates the closing CTA from the footer.

### The footer was the same colour as the page

`bg-zinc-50` is `#FAFAFA` and so is `--color-background`. So on every page
except the homepage the join was **#FAFAFA meeting #FAFAFA — 1.000:1, no edge
at all** — with a `border-zinc-200/70` hairline over it, which computes to about
`#e9e9ec` and is 1.16:1 against its own background. On the homepage the CTA is
white, so the join was 1.044:1. Effectively invisible either way.

The footer now sits on `zinc-100` with a solid `zinc-200` rule. Measured at the
boundary afterwards, three distinct values instead of one:

| | before | after |
|---|---|---|
| page above | `250,250,250` | `250,250,250` |
| rule | 70% hairline | `228,228,231` |
| footer | `250,250,250` | `244,244,245` |

Inner rules moved to `zinc-300/70` and the email field's border to `zinc-300`, so
they still read against the darker ground. Footer text re-checked on the new
surface across five pages: **no contrast failures**, zinc-600 at 7.03:1.

### The bug underneath it

Looking at the section above the footer turned up
`py-32 md:py-24 md:py-48` — a class with two `md:` values.

The mobile-first padding pass used `\bpy-32\b(?! md:)`, and `\b` matches after
the colon in `md:py-32`, so on any class that was **already responsive** the
regex rewrote the desktop half instead of the mobile one. Three sections on the
homepage were hit. The effect was silent: they kept their desktop padding on
mobile and gained a dead class, so the reduction that pass was supposed to make
never happened there.

Fixed to `py-16 md:py-32` and `py-20 md:py-48`. The homepage is now **5.3
screens at 375px, not the 5.6 previously recorded** — the earlier 9% figure was
understated because those three sections had not actually changed. No other file
was affected; the whole site was re-scanned for the pattern.

Worth keeping: a bulk regex over class names needs a guard against matching
inside a variant prefix, not just after one.

---

## [2026-09-10] — Photography: two AI images replaced with stock

The cofounders want photographs rather than AI images. Only three AI images were
actually in use, all as `PageHero` art; `about_hero`, `chef_localized` and
`smart_lock` had been referenced from nowhere for some time and were deleted.

### What changed

| page | was | now |
|---|---|---|
| `/verification` | `nfc_localized.jpg` | `verification_hero.jpg` |
| `/services` | `cleaning_localized.jpg` | `services_hero.jpg` |
| `/provider` | `provider_hero.jpg` | unchanged |

`/verification` needed replacing regardless of this decision. It showed **an NFC
card being tapped against a phone** — a capability AZAP does not have, since the
PIN system lives in the app and the app is not in the stores. A picture of a
feature that does not exist, on the page whose entire argument is that what we
say about a pro is checkable.

`/provider` was kept at first, as the only image on the site showing a tradesman
rather than a cleaner, then replaced on the founders' call with the fourth
supplied photograph — the laughing subject in red overalls. It reads well above
"Keep everything you charge", which is a page addressed to artisans, and it
breaks the repetition of one model across `/services` and `/verification`.

The crop is anchored 25% down rather than centred. The raised arm is the energy
of that frame and a centre square crop takes the hand off the top edge.

The consequence, stated when it was proposed: **every photograph on the site is
now of someone cleaning**, on a site that covers eleven trades. The hero video
is the only remaining image of other work.

Both new files are cropped square in the file at 1024x1024 rather than left to
`object-cover`: `PageHero` renders `aspect-square`, so shipping the 2:3 source
would have downloaded height the browser discards and left the crop point to
chance. 103KB and 118KB, against 193KB for the AI image that remains.

### Raised at the time

- **All four supplied images are cleaning.** The site covers eleven trades, so
  making every photograph on it a cleaning photograph says "cleaning company" —
  the same narrowing already corrected three times in the copy. Two were used,
  both on pages where cleaning is a reasonable illustration.
- **They lose Enugu.** The AI images were deliberately localised — burglar bars,
  banana plants, a Nigerian street. These are cool grey interiors, on a site
  whose position is one city, properly.
- **One image was not used at all**: the subject is pouting at the camera, which
  is the wrong expression for a brand promising someone you are glad to let in.
- **Licence**: Pexels permits commercial use but not implying the people
  depicted endorse or work for AZAP. Both are decorative page art with `alt=""`
  and no caption, which stays the right side of that.
- **The two new images are the same woman, same outfit, same room.** `/services`
  and `/verification` now read as two frames of one shoot. Tolerable, and an
  argument for asking the cofounders for photographs covering the other trades.

### Verified

All three hero images load at 1024x1024 into a 542x542 box, `alt=""`, lazy. Every
`/images/` reference in the source resolves to a file, and no file in
`public/images` is unreferenced. Total image payload 924KB.

---

## [2026-09-10] — Mobile: the video plays, and the pages got shorter

### The hero video on phones

It was withheld below 768px on purpose, on the grounds that 1.4MB of decoration
is expensive on Nigerian mobile data. That reasoning held against the desktop
file and not against a smaller one, so the floor now chooses *which* file rather
than whether to play one at all.

It was also the wrong shape. The source is 1920x1080, and `object-cover` on a
375x812 hero scales it by 0.752 and crops — a phone was only ever going to see
**26% of the frame width**, a vertical slice through the middle of a landscape
shot. The mobile pair is a 9:16 centre crop at 540x960, framed for the shape it
is displayed in, and a third of the weight:

| | desktop | mobile |
|---|---|---|
| mp4 | 1385KB | 461KB |
| webm | 1007KB | 415KB |
| poster | 83KB | 27KB |

All four shots in the montage were checked against the crop before encoding.
Save-Data, 2G and reduced-motion still get no video at all. The still is chosen
by `<picture>` rather than JavaScript, so whoever never gets the video still sees
a frame shot for their screen, before React runs.

### Why the pages felt long

Measured all fifteen pages at 375x812 and simulated each fix before writing any
of it. **The obvious fix was the wrong one.** Forcing cards two-up on mobile made
pages *longer* — the homepage by 24%, `/business` by 7% — because at 375px
halving the width wraps paragraphs into more lines than the pairing saves. It
only helps where a card is a short label. Tightening padding everywhere bought
5-10%, real but imperceptible.

The actual cost was **the footer: 1400px, 1.7 full screens, on every page**, and
on `/contact` taller than the page's own content. Twelve links at the 44px touch
minimum is 528px before headings, gaps or padding, so it was not spacing that
could be trimmed.

### What was done

- Footer link groups collapse on phones and are untouched from md: upwards.
  1400px to 975px.
- A mobile-first vertical rhythm across 34 padding declarations. Every one had
  been a desktop value applied unconditionally; the `md:` value is what was
  there before, so desktop is unchanged.
- Two-up **only** on `/services`, where the cards are a label and three words.
- `/faq` became an accordion, first answer open.

| page | before | after | |
|---|---|---|---|
| `/faq` | 6.6 screens | 3.1 | **-52%** |
| `/contact` | 3.4 | 2.8 | -18% |
| `/services` | 6.3 | 5.3 | -16% |
| `/verification` | 5.0 | 4.2 | -16% |
| `/about` | 5.2 | 4.4 | -15% |
| `/` | 6.1 | 5.6 | -9% |

Average across the site: **17% shorter on a phone.**

### A bug caught before it shipped

The first footer attempt used `<details>` closed by default, forced open on
desktop with `display: block !important`. **It rendered the desktop footer as
three headings and no links at all.** Chrome's UA stylesheet hides a closed
`<details>`'s content with `!important`, and in the cascade a UA `!important`
beats an author one, so CSS cannot force one open.

The markup now ships `<details open>` and JavaScript closes them below 768px.
The failure mode of that direction is "the footer is long", not "the footer has
no links" — all twelve hrefs are in the static HTML either way. Same reasoning
applies to the FAQ accordion and is commented in both places.

Worth noting how close this came to shipping: the DOM probe said the links were
present with real bounding boxes at 1280px, because `getBoundingClientRect()`
reports a would-be size for content hidden inside a closed `<details>`. Only a
screenshot showed the footer was empty.

### Verified

At 375px across all sixteen pages: no contrast failures, no horizontal overflow,
no heading jumps, no missing alt text, no tap target under 44px. Confirmed in a
real 1400px window driving two iframes, since the Browser pane reports
`innerWidth: 0` while hidden and therefore fails every width test:

| | desktop 1280 | mobile 390 |
|---|---|---|
| footer groups | 3/3 open | 0/3 collapsed |
| video | `hero.webm` | `hero-mobile.webm` |
| still | `hero-poster.jpg` | `hero-poster-mobile.jpg` |

---

## [2026-09-10] — Shipped to production

The website branch was merged to `master` and Vercel deployed it. This is the
first time any of this session's work has been public.

### Vercel preview origins

A booking submitted from a preview deployment failed with `forbidden_origin`, so
the one flow that most needs checking before a merge could not be checked.

Deliberately **not** a `*.vercel.app` suffix test: anyone can deploy anything to
vercel.app in thirty seconds, so that would have handed the endpoint to the whole
internet while looking like a restriction. Both ends of the hostname are pinned
instead — project name at the front, team slug at the end. `corsHeaders()` now
echoes the matched origin rather than falling back to the first entry, or the
browser would reject the response to a request that had already passed.

Eleven patterns were checked against the expression before deploying, then
against production afterwards:

| origin | result |
|---|---|
| `www.getazap.com` | 200, own ACAO |
| `azap-website-<hash>-admin-…-projects.vercel.app` | 200, own ACAO |
| `azap-website-git-<branch>-admin-…-projects.vercel.app` | 200, own ACAO |
| `evil-admin-56668191s-projects.vercel.app` | ACAO `www.getazap.com`, browser refuses; POST 403 |
| `azap-website-attacker.vercel.app` | ACAO `www.getazap.com`, browser refuses; POST 403 |

### Live and verified

The environment variables were set on Vercel before the merge, so the build
picked them up. Confirmed by reading the deployed bundles rather than the
dashboard:

- `BookingForm` posts to the **production** function
- `ContactForm` carries a Web3Forms key — the live site had never had one

Response headers now carry CSP `frame-ancestors`, COOP, Permissions-Policy,
Referrer-Policy, X-Content-Type-Options, X-Frame-Options and HSTS. Before this
deploy the site sent HSTS alone.

`/favicon.ico`, `/favicon-32x32.png`, `/apple-touch-icon.png`,
`/site.webmanifest` and `/images/og.jpg` all serve 200 with correct content
types. `/404` returns a real 404 status with the rebuilt page.

Nothing in the live homepage HTML reaches a third party on load. The only
external hosts named anywhere are the booking endpoint and Web3Forms, both in
`connect-src` and both only contacted on submit, and the Instagram href.

End to end: a POST to the endpoint the live bundle actually names, from the
production origin, returned `{"ok":true}`. Run with the honeypot set on purpose,
so the full request path was exercised while writing no row and sending no
email. `concierge_bookings` still reads 0 in production.

### Still open

- No CAC number, registered office address or named DPO in the legal pages.
- Team bios are a line short.
- Preview deployments will need `PUBLIC_BOOKING_ENDPOINT` set for the Preview
  environment before a booking can be tested from one, and it should point at
  **staging** so preview bookings never write to production.

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
