import React, { useEffect, useState } from 'react';

/**
 * The out-of-area email capture lives here rather than on the homepage.
 *
 * It used to sit directly beneath the booking CTA at the bottom of the landing
 * page, which put two competing calls to action side by side — the one that
 * earns money and the one that collects an address. In the footer it is
 * reachable from every page and never competes with "Book a pro".
 *
 * Its job is expansion research: a ranked list of where demand already exists,
 * built for free. Hydrated with client:visible in Layout.astro.
 */
/* Footer links were 18px tall with 12px gaps, well under the 44px touch
   minimum. min-h-11 (44px) with the text vertically centred fixes that on
   touch devices; md:min-h-0 returns the compact rhythm on desktop, where a
   cursor does not need the same margin for error. */
const FOOTER_LINK =
  'flex min-h-11 items-center transition-colors hover:text-ink md:min-h-0 md:py-0.5';

/* The number people actually reach us on. Kept in E.164 for the href so it
   dials correctly from abroad and from a saved contact, and spaced for reading
   in the label. AZAP runs on phone calls, so a number that cannot be tapped on
   a phone is the wrong kind of contact detail. */
const PHONE_E164 = '+2347047231349';
const PHONE_DISPLAY = '+234 704 723 1349';
const EMAIL = 'support@getazap.com';

/* Instagram is the only account AZAP has. It sits in the bottom bar with a
   visible label rather than in a row of social icons, because a row built for
   one icon looks like the other four failed to load, and a bare glyph makes a
   reader guess. When a second account exists this becomes a list and the label
   can go. */
const SOCIALS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/getazap',
    // Simple Icons path, inlined. Loading a glyph from a CDN would put a third
    // party back on every page of a site that currently contacts none.
    path: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13.67.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.13-1.38.66-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.38-2.13C21.32 1.35 20.65.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z',
  },
];


/* The three link lists, so one block of markup renders them and mobile can
   collapse them without triplicating the accordion. */
const LINK_GROUPS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/provider', label: 'For professionals' },
      { href: '/business', label: 'Business' },
      { href: '/careers', label: 'Careers' },
    ],
  },
  {
    heading: 'Product',
    links: [
      { href: '/book', label: 'Book a pro' },
      { href: '/services', label: 'Services' },
      { href: '/verification', label: 'How we vet pros' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/cities', label: 'Locations' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/terms', label: 'Terms' },
      { href: '/privacy', label: 'Privacy' },
    ],
  },
];

const ACCESS_KEY = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY as string | undefined;

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [trap, setTrap] = useState(false);

  /*
   * Collapse the link groups on phones, after render rather than instead of it.
   *
   * The markup ships <details open>, so every link is in the HTML and visible
   * to a search engine, to a reader with no JavaScript, and on desktop. This
   * only closes them below 768px, where the footer was otherwise 1.7 screens
   * tall on every page.
   *
   * Deliberately not done in CSS: Chrome's UA stylesheet hides a closed
   * <details>'s content with !important, so an author rule cannot force one
   * open. Trying produced a desktop footer of three headings and no links.
   */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => {
      document.querySelectorAll<HTMLDetailsElement>('footer .footer-group').forEach((d) => {
        if (mq.matches) d.removeAttribute('open');
        else d.setAttribute('open', '');
      });
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Without this the form posts `access_key: undefined` when the variable is
    // unset, Web3Forms rejects it, and the visitor is told "that didn't send"
    // with no idea why. ContactForm already guarded this; this one did not.
    if (!ACCESS_KEY) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    // A hanging request on a bad mobile connection otherwise leaves the button
    // reading "Sending…" indefinitely with no way back.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          botcheck: trap,
          subject: 'AZAP out-of-area interest',
          email,
        }),
      });
      const result = await response.json().catch(() => null);
      if (result?.success) {
        setStatus('success');
        setEmail('');
      } else {
        // Deliberately not logging `result` or the address: this runs in the
        // visitor's browser and their email does not belong in a console any
        // bystander or extension can read.
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      clearTimeout(timer);
    }
  };

  /*
   * The footer has to read as a different surface from the page above it, and
   * it did not. zinc-50 is #FAFAFA and so is --color-background, so on every
   * page except the homepage the join was #FAFAFA meeting #FAFAFA: an identical
   * colour with a 70%-opacity hairline over it, which is no edge at all. On the
   * homepage it was #FFFFFF meeting #FAFAFA, 1.04:1.
   *
   * zinc-100 is a step darker than both the page ground and the homepage's
   * white CTA, and the rule above it is now solid rather than 70%. Text still
   * clears AA on it — zinc-600 at 7.03:1 — and the inner rules moved to
   * zinc-300 so they stay visible against the darker ground.
   */
  return (
    <footer className="py-16 md:py-24 bg-zinc-100 border-t border-zinc-200 px-6 font-sans">
      <div className="container-tight !px-0">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-12 mb-10 md:mb-16">
          <div className="md:col-span-2 mb-2 md:mb-0">
            <div className="flex items-center gap-2 mb-6">
              {/* alt="" — the wordmark beside it already says AZAP, and a
                  screen reader announcing "AZAP AZAP" is noise, not information. */}
              <img src="/images/logo.png" alt="" width="32" height="32" className="h-8 w-auto" />
              <span className="font-extrabold text-xl tracking-tighter text-ink">AZAP</span>
            </div>
            <p className="text-zinc-600 font-medium text-sm leading-relaxed max-w-xs mb-6">
              Vetted pros in Enugu, whatever the job. Free to book, and we take no commission on your job.
            </p>
            <div className="flex flex-col gap-1">
              <a
                href={`tel:${PHONE_E164}`}
                className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-bold text-zinc-800 hover:underline md:min-h-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                </svg>
                {PHONE_DISPLAY}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-bold text-zinc-800 hover:underline md:min-h-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
                </svg>
                {EMAIL}
              </a>
            </div>
          </div>

          {/* Collapsed on phones, open on desktop.

              Measured cause: the footer was 1400px tall at 375px, 1.7 full
              screens, on every page of the site — and on /contact it was taller
              than the page's own content. Twelve links at the 44px touch
              minimum is 528px before headings, gaps or padding, so the height
              was not decoration that could be trimmed.

              <details> rather than a JS accordion: it collapses with no
              JavaScript at all, is keyboard operable and announces its state to
              a screen reader for free. `open` is forced from md: upwards in
              global.css, so desktop never sees a disclosure at all and nothing
              is hidden from anyone on a large screen. */}
          {LINK_GROUPS.map((g) => (
            <details key={g.heading} open className="footer-group border-b border-zinc-300/70 md:border-0">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-xs font-extrabold uppercase tracking-widest text-ink md:mb-6 md:min-h-0 md:cursor-default">
                {g.heading}
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="footer-chevron h-4 w-4 text-zinc-400 transition-transform md:hidden"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <ul className="pb-2 text-sm font-bold text-zinc-500 md:pb-0 md:space-y-3">
                {g.links.map((l) => (
                  <li key={l.href}><a href={l.href} className={FOOTER_LINK}>{l.label}</a></li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        {/* Out-of-area capture */}
        <div className="py-10 border-t border-zinc-300/70">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="md:flex-1">
              <h2 className="font-extrabold text-ink tracking-tight mb-1">Not in Enugu yet?</h2>
              <p className="text-sm text-zinc-600 font-medium">
                Tell us where you are and we'll let you know when we reach you.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative w-full md:w-auto md:min-w-[380px] flex gap-2 bg-white border border-zinc-300 p-1.5 rounded-full"
            >
              {/* Honeypot — see ContactForm. This one sits on the footer of
                  every page, which makes it the most-crawled form on the site. */}
              <input
                type="checkbox"
                name="botcheck"
                checked={trap}
                onChange={(e) => setTrap(e.target.checked)}
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading' || status === 'success'}
                aria-label="Your email address"
                className="flex-1 min-w-0 px-4 py-2.5 bg-transparent focus:outline-none text-ink font-medium text-sm placeholder:text-zinc-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="btn-capsule bg-ink text-white border-transparent hover:bg-zinc-800 !px-6 !py-3 shrink-0 disabled:opacity-70"
              >
                {status === 'loading' ? 'Sending…' : status === 'success' ? 'Done' : 'Notify me'}
              </button>
            </form>
          </div>

          {/* Consent, in the place the address is actually typed rather than
              buried in a policy nobody opened. One purpose, one retention rule,
              one way out. */}
          <p className="mt-4 text-xs font-medium leading-relaxed text-zinc-600 md:text-right">
            We'll only use this to tell you when AZAP reaches your area. No
            marketing, and we don't pass it on.{' '}
            <a href="/privacy" className="font-bold text-ink underline underline-offset-2 hover:text-accent-ink">
              Privacy policy
            </a>
            .
          </p>

          {/* role="status" rather than a bare paragraph: this replaces nothing
              visible and would otherwise pass a screen reader user in silence. */}
          {status === 'success' && (
            <p role="status" className="text-accent-ink text-sm mt-4 font-bold md:text-right">
              Thanks. We'll be in touch when we reach you.
            </p>
          )}
          {status === 'error' && (
            <p role="alert" className="text-red-700 text-sm mt-4 font-bold md:text-right">
              That didn't send.{' '}
              <button type="button" onClick={handleSubmit} className="underline underline-offset-4">
                Try again
              </button>{' '}
              or email <a href={`mailto:${EMAIL}`} className="underline underline-offset-4">{EMAIL}</a>.
            </p>
          )}
        </div>

        <div className="pt-8 border-t border-zinc-300/70 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          {/* getFullYear() rather than a literal: this renders at build time
              into the static HTML and again on hydration, so it is right on
              1 January without anyone editing a file. */}
          <div className="text-xs font-bold text-zinc-600 tracking-wide">
            © {new Date().getFullYear()} AZAP Operations Limited. All rights reserved.
          </div>

          <div className="flex items-center gap-1">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                /* noopener because the opened tab can otherwise reach back
                   through window.opener; noreferrer keeps our URLs out of their
                   analytics. */
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-bold tracking-wide text-zinc-600 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path d={s.path} />
                </svg>
                {s.name}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
