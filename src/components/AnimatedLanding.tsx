import React, { useEffect, useState } from 'react';

/* Drop a file at either of these paths and the hero starts using it. Until then
   the still below carries the section on its own, so there is never a broken
   state. WebM first because it is roughly half the weight of the MP4 at the same
   quality; the MP4 is the Safari fallback.

   Spec for whoever shoots it: 6-12 seconds, silent, seamless loop, 1920x1080,
   and compressed hard. Keep the MP4 under about 2MB. It is decorative, so
   nothing important should happen in it. */
const HERO_VIDEO_WEBM = '/video/hero.webm';
const HERO_VIDEO_MP4 = '/video/hero.mp4';



export default function AnimatedLanding() {
  /* The background video is an enhancement, never a requirement.
     It is withheld from anyone this site cannot afford to spend data on:
     small screens (mobile data in Nigeria is expensive and this file is pure
     decoration), Save-Data, 2G/3G, and anyone who asked for reduced motion.
     The still image is what everybody else sees, and it is not a downgrade.

     The HEAD request means a missing file simply never turns the video on,
     rather than leaving a broken <video> over the hero. */
  const [videoOn, setVideoOn] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const wideEnough = window.matchMedia('(min-width: 768px)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = (navigator as any).connection;
    const cheapData = conn?.saveData === true;
    // Only genuinely slow links are excluded. '3g' was in this list and is not:
    // effectiveType is a latency-and-throughput estimate rather than a radio
    // technology, and plenty of perfectly good fixed connections report 3g.
    // Combined with the 768px floor above, anyone reaching this line is on a
    // larger screen, and 1.4MB fetched lazily behind a poster is affordable.
    const slowLink = conn && ['slow-2g', '2g'].includes(conn.effectiveType);

    if (!wideEnough || reducedMotion || cheapData || slowLink) return;

    let cancelled = false;
    fetch(HERO_VIDEO_MP4, { method: 'HEAD' })
      .then((r) => { if (r.ok && !cancelled) setVideoOn(true); })
      .catch(() => { /* no video published yet: the still is the design */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-background relative w-full overflow-x-hidden text-ink">

      {/* 1. HERO */}
      <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden">

        {/* One still, and it is the video's own first frame.

            This used to stack three layers: a blurred data-URI placeholder, then
            hero.jpg — a standing portrait of a different scene — and then the
            video on top. Because hero.jpg and the video's first frame were two
            different photographs, you watched the portrait for a beat and then
            saw it replaced. That was the flash.

            hero-poster.jpg is frame zero of hero.mp4 (verified: 0.54/255 mean
            difference, which is JPEG noise). So the still and the first frame of
            playback are the same picture and nothing visibly changes when the
            video starts.

            The still stays rather than going entirely, because mobile, Save-Data,
            2G and reduced-motion visitors never load the video at all — see the
            gate above — and would otherwise get a flat dark box. */}
        <div className="absolute inset-0 -z-10 bg-ink">
          <img
            src="/images/hero-poster.jpg"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
          />
          {videoOn && (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              poster="/images/hero-poster.jpg"
              onError={() => setVideoOn(false)}
              className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
            >
              <source src={HERO_VIDEO_WEBM} type="video/webm" />
              <source src={HERO_VIDEO_MP4} type="video/mp4" />
            </video>
          )}

          {/* Two layers, not one: a flat wash to guarantee contrast on the
              headline wherever the image happens to be bright, and a gradient
              that lands the section into the white strip below it. */}
          <div className="absolute inset-0 bg-ink/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/25 to-ink/85" />
        </div>

        <div className="container-tight w-full pt-28 pb-24 text-center">
          <div className="mx-auto max-w-4xl">

            {/* "Your Space, Managed." said nothing a person could act on, and
                the paragraph under it named four trades out of eleven, which
                reads as a limit rather than an example — the same narrowing the
                page title was changed for.

                What replaces it leads with the thing customers are actually
                deciding: whether to let a stranger into the house. That is the
                one claim AZAP can make and a man with a saved phone number
                cannot. The trades are not listed at all; /services does that.

                The paragraph names the three checks rather than saying
                "vetted", which is the word directly above it in the headline and
                the word every competitor also uses. Naming what is actually
                checked is the whole reason a customer should believe it.

                The paragraph is one sentence because the money facts moved out
                of it. It used to end "Free to book, and you agree the price
                directly with your pro. AZAP takes no cut of it" — which is the
                same thing the strapline forty pixels below already says in six
                words. Saying it twice in one screen did not make it twice as
                true, it just made the hero something to read rather than
                something to glance at. Trust here, money there, price on
                /pricing. */}
            <h1 className="rise mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white md:text-7xl">
              A vetted pro at your door.
            </h1>

            <p className="rise rise-1 mx-auto mb-10 max-w-xl text-lg font-medium leading-relaxed text-zinc-200 md:text-xl">
              Whatever the job, we check their ID, bank and guarantor first.
            </p>

            <div className="rise rise-2 mb-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="/book" className="btn-capsule w-full border-transparent bg-white px-8 py-4 text-base text-ink shadow-lg hover:bg-zinc-100 sm:w-auto">
                Book now
              </a>
              <a href="/how-it-works" className="btn-capsule w-full border-white/25 bg-white/5 px-8 py-4 text-base text-white backdrop-blur-md hover:bg-white/15 sm:w-auto">
                Learn how it works
              </a>
            </div>

            <p className="rise rise-3 text-sm font-semibold text-zinc-300">
              No app to install. No booking fee. No commission.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white">
        <div className="container-tight max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-16 leading-tight">Get verified help in 3 simple steps.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            {/* These three steps describe the manually dispatched flow that
                actually runs today. They previously described the app: an
                in-app catalogue, a 15-minute arrival guarantee, and a PIN
                check-in — none of which a customer on this website experiences,
                because the app is not in the stores yet. */}
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-full bg-ink text-white flex items-center justify-center font-black text-xl shrink-0">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Tell us what you need</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">Pick a service, give us your address and a few words about the job. It takes a minute and costs nothing.</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-full bg-ink text-white flex items-center justify-center font-black text-xl shrink-0">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2">We call you back</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">A real person rings to confirm the details and find you a vetted pro. Nobody is sent to your door until you've spoken to us.</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-full bg-ink text-white flex items-center justify-center font-black text-xl shrink-0">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Agree the price, get it done</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">Your pro quotes you directly and you settle with them. AZAP takes no cut of the job and adds nothing to your bill.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE PROMISE / QUALITY ASSURANCE (Dark Contrast Block) */}
      <section className="py-24 md:py-32 section-dark relative overflow-hidden">
        <div className="container-tight relative z-10">
          <div className="grid grid-cols-1 max-w-4xl mx-auto gap-16 items-center text-center">
            <div>
              <span className="text-accent font-extrabold text-sm uppercase tracking-widest mb-4 block">The AZAP Promise</span>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">We know exactly who we send you.</h2>
              {/* Named, specific and checkable. The previous version claimed
                  "rigorous skill-testing" and "continuous real-world quality
                  assessments", neither of which AZAP performs. Four real checks
                  are a stronger claim than two invented ones. */}
              <p className="text-zinc-400 text-lg mb-10 font-medium leading-relaxed">
                Letting a stranger into your home is the whole problem. So before anyone
                takes a job on AZAP, four things get checked, and we can tell you exactly
                what they are.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-2">Government ID</h3>
                  <p className="text-sm text-zinc-400">Their National Identity Number, with the document, so we know they're a real and identifiable person.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-2">Bank account</h3>
                  <p className="text-sm text-zinc-400">A verified account in their own name, so there is a traceable place their money goes.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-2">A guarantor</h3>
                  <p className="text-sm text-zinc-400">A named, contactable person who vouches for them and stakes their own name on it.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-2">A photograph</h3>
                  <p className="text-sm text-zinc-400">So the person who knocks on your door is the person on the ID.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLOSING CTA. One call to action only — the out-of-area email
          capture that used to sit under it now lives in the site footer,
          where it is on every page and competes with nothing. The
          #waitlist id is kept so older external links still land here. */}
      <section id="waitlist" className="py-32 md:py-48 bg-white">
        <div className="container-tight text-center max-w-3xl">
          {/* The last thing read before the decision, so it answers the last
              question left: what actually happens after the button. The
              callback is the reassurance, not the speed. */}
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-ink">Need someone today?</h2>
          <p className="text-zinc-600 text-lg md:text-xl font-medium mb-10">
            Tell us what needs doing and a real person calls you back to confirm before
            anyone is sent. It takes about a minute and costs nothing.
          </p>

          <a
            href="/book"
            className="btn-capsule bg-ink text-white border-transparent hover:bg-zinc-800 !inline-flex px-10 !py-4 text-base shadow-md mb-16"
          >
            Book a pro
          </a>

        </div>
      </section>

    </div>
  );
}
