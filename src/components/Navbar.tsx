import React, { useEffect, useRef, useState } from 'react';

/**
 * Adaptive glass navbar.
 *
 * `overHero` is passed only by pages whose first section is a dark full-bleed
 * hero (currently just the homepage). On those, the bar starts transparent with
 * white type so the hero reads as one uninterrupted image, then swaps to light
 * glass with dark type once the user scrolls past it.
 *
 * Every other page has a light background, so it stays in the light treatment
 * throughout. This is the whole reason the component takes a prop rather than
 * simply being inverted: a permanently white navbar would be invisible on ten
 * of the fifteen pages.
 */
export default function Navbar({ overHero = false }: { overHero?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  /*
   * The swap point is the bottom of the hero, not a fixed offset.
   *
   * This used to be `window.scrollY > 24`, so on the homepage the bar turned
   * from transparent to light glass after two notches of the wheel — while the
   * hero was still filling the entire screen. You got a white bar sitting on a
   * dark photograph for the length of a whole viewport.
   *
   * The hero is `min-h-[100svh]`, so its real height is not knowable from a
   * constant: it grows when the copy wraps on a narrow phone, and `svh` itself
   * shifts as a mobile URL bar hides. Measuring the element covers all of that.
   * Falling back to innerHeight keeps the old feel if the section ever moves.
   *
   * Pages without `overHero` never render the transparent treatment at all, so
   * for them this only drives the border and shadow, and a small offset is the
   * right trigger.
   */
  useEffect(() => {
    if (!overHero) {
      const onScroll = () => setScrolled(window.scrollY > 24);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    // Swap as the bar's own lower edge clears the hero, so the two never
    // overlap in the wrong treatment for even a frame.
    let threshold = window.innerHeight;
    const measure = () => {
      const hero = document.querySelector('main section');
      const navH = navRef.current?.offsetHeight ?? 0;
      threshold = Math.max(24, (hero?.getBoundingClientRect().height ?? window.innerHeight) - navH);
    };
    const onScroll = () => setScrolled(window.scrollY > threshold);

    measure();
    onScroll(); // a reload partway down the page must not start transparent

    const onResize = () => { measure(); onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [overHero]);

  // The open mobile menu always takes the light treatment: its panel needs a
  // solid background to be readable, and white-on-glass links over a photograph
  // are not.
  const dark = overHero && !scrolled && !isOpen;

  const link = dark
    ? 'text-white/75 hover:text-white'
    : 'text-zinc-600 hover:text-ink';

  return (
    <nav
      ref={navRef}
      className={[
        'fixed top-0 inset-x-0 z-[100] px-6 py-4 transition-all duration-300',
        'backdrop-blur-xl backdrop-saturate-150',
        dark
          ? 'bg-white/[0.06] border-b border-white/10'
          : 'bg-white/70 border-b border-zinc-200/60 shadow-[0_1px_20px_rgba(0,0,0,0.03)]',
      ].join(' ')}
    >
      <div className="container-tight flex items-center justify-between !px-0">
        <a href="/" aria-label="AZAP home" className="flex min-h-11 items-center gap-2.5">
          {/* The mark is a dark glyph, so it disappears against the hero.
              brightness-0 invert repaints it pure white without a second asset. */}
          <img
            src="/images/logo.png"
            /* The link already has aria-label="AZAP home" and the wordmark
               beside it reads AZAP. A third announcement is noise. */
            alt=""
            width="36"
            height="36"
            className={`h-9 w-auto transition-[filter] duration-300 ${dark ? 'brightness-0 invert' : ''}`}
          />
          <span
            className={`font-extrabold text-xl tracking-tighter transition-colors duration-300 ${
              dark ? 'text-white' : 'text-ink'
            }`}
          >
            AZAP
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="/services" className={`text-sm font-bold transition-colors duration-300 ${link}`}>Services</a>
          <a href="/how-it-works" className={`text-sm font-bold transition-colors duration-300 ${link}`}>How it works</a>
          <a href="/about" className={`text-sm font-bold transition-colors duration-300 ${link}`}>About</a>
          <a href="/business" className={`text-sm font-bold transition-colors duration-300 ${link}`}>Business</a>
          <a href="/contact" className={`text-sm font-bold transition-colors duration-300 ${link}`}>Contact us</a>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/book"
            className={[
              'hidden md:flex btn-capsule border-transparent transition-all duration-300',
              dark
                ? 'bg-white text-ink hover:bg-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
                : 'bg-ink text-white hover:bg-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)]',
            ].join(' ')}
          >
            Book now
          </a>

          {/* Mobile Menu Toggle */}
          <button
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            className={`md:hidden grid h-11 w-11 place-items-center focus:outline-none transition-colors duration-300 ${
              dark ? 'text-white' : 'text-zinc-600'
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-zinc-200/60 shadow-lg py-4 px-6 flex flex-col gap-4">
          <a href="/services" className="text-base font-bold text-zinc-600 hover:text-ink" onClick={() => setIsOpen(false)}>Services</a>
          <a href="/how-it-works" className="text-base font-bold text-zinc-600 hover:text-ink" onClick={() => setIsOpen(false)}>How it works</a>
          <a href="/about" className="text-base font-bold text-zinc-600 hover:text-ink" onClick={() => setIsOpen(false)}>About</a>
            <a href="/business" className="text-base font-bold text-zinc-600 hover:text-ink" onClick={() => setIsOpen(false)}>Business</a>
          <a href="/contact" className="text-base font-bold text-zinc-600 hover:text-ink" onClick={() => setIsOpen(false)}>Contact us</a>
          <div className="pt-4 mt-2 border-t border-zinc-100 flex justify-center">
            <a href="/book" className="btn-capsule bg-ink text-white border-transparent hover:bg-zinc-800 w-full text-center" onClick={() => setIsOpen(false)}>
              Book now
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
