# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Hero background video

The homepage hero is built to take a background video. Nothing is published yet,
so it currently renders the still at `public/images/hero.jpg`, which is a
finished state rather than a placeholder.

To turn the video on, add either or both of:

```
public/video/hero.webm    (preferred, roughly half the weight)
public/video/hero.mp4     (Safari fallback)
```

`AnimatedLanding.tsx` does a `HEAD` request for the MP4 on load and only mounts
the `<video>` if it returns 200, so a missing file can never leave a broken
element over the hero.

**Spec for whoever shoots it**

| | |
|---|---|
| Length | 6 to 12 seconds, seamless loop |
| Resolution | 1920x1080 |
| Audio | None. It is muted and autoplaying, so audio is dead weight |
| Size | **Keep the MP4 under ~2MB.** This is decoration on a page people load on mobile data |
| Content | Nothing important, and nothing with text. A dark overlay sits on top and the middle is covered by the headline |

**It is deliberately not shown to everyone.** The video is withheld on screens
under 768px, on Save-Data, on 2G/3G, and for `prefers-reduced-motion`. Those
visitors get the still. This is intentional: mobile data in Nigeria is expensive
and the video is decorative, so it is only spent where it is cheap.

## Images

Source images are JPEG, quality 82, progressive. They were 700KB to 1.5MB PNGs,
which put 3.85MB on the homepage alone. Keep new images as optimised JPEG, and
keep PNG only where transparency is genuinely needed (currently just the logo).
