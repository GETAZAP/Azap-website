// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.getazap.com',

  security: {
    /*
     * Content Security Policy, generated at build time.
     *
     * Astro emits its island bootstrap as *inline* <script> blocks whose
     * contents change per page and per build, so a hand-written
     * `script-src 'self'` in vercel.json silently killed all hydration, and
     * `'unsafe-inline'` would have given up the only directive that matters.
     * With this on, Astro hashes every inline script and style it renders and
     * writes them into a per-page <meta http-equiv="Content-Security-Policy">.
     * No 'unsafe-inline' for scripts, and nothing to keep in step by hand.
     *
     * `frame-ancestors` cannot be set from a <meta> tag — browsers ignore it
     * there — so clickjacking is covered by the header in vercel.json instead.
     * Keep the two in step: connect-src here must list every host the browser
     * posts to, which today is the booking function and the contact-form relay.
     */
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        // The Supabase edge function that receives bookings, and Web3Forms,
        // which relays the contact form and the out-of-area capture.
        "connect-src 'self' https://qdeypepzfvuyouqopikj.supabase.co https://api.web3forms.com",
      ],
      styleDirective: {
        // Tailwind ships as a linked stylesheet, but Astro and React both set
        // inline style attributes, which the style-src hashes do not cover.
        resources: ["'self'", "'unsafe-inline'"],
      },
    },
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      /*
       * Vite inlines any asset under 4kB as a data: URI. One of the four font
       * subsets (cyrillic-ext, 1.7kB) fell under that line and was emitted as
       * `src: url(data:font/woff2;base64,...)`, which the font-src 'self'
       * policy above then blocked — a console error on every page load for a
       * subset this site never renders.
       *
       * Keeping fonts as files rather than widening the policy to `data:`:
       * they are cached separately, and a subset nobody needs is then never
       * downloaded at all instead of riding along inside the stylesheet.
       */
      assetsInlineLimit: (filePath) => (/\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined),
    },
  },

  integrations: [react()]
});
