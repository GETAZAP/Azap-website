import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Icons = {
  Cooking: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-3.5c0-1.4-1.1-2.5-2.5-2.5h-5c-1.4 0-2.5 1.1-2.5 2.5V21" /><path d="M12 15V8" /><path d="M6 12a4 4 0 0 1-4-4 4 4 0 0 1 4-4 4 4 0 0 1 4 4" /><path d="M18 12a4 4 0 0 0 4-4 4 4 0 0 0-4-4 4 4 0 0 0-4 4" /></svg>,
  Cleaning: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>,
  WhatsApp: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.8.9L21 4.5Z" /></svg>,
  Business: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
};

export default function AnimatedLanding() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: 'cc5def3e-3759-44f9-a161-41ab0db6b3ff',
          subject: 'New Waitlist Submission',
          email: email,
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setEmail('');
      } else {
        console.error('Submission failed:', result);
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('idle');
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as any } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.12 } }
  };

  return (
    <div className="bg-background relative w-full overflow-x-hidden text-ink pt-20">

      {/* 1. CLEAN HERO */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center py-20">
        <div className="container-tight text-center w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto"
          >


            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold text-ink mb-6 leading-[1.1] tracking-tight">
              The smarter way to run <br className="hidden md:block" /> your Nigerian home.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Book trusted house help in 15 minutes. Vetted professionals for gourmet cooking, precise cleaning, and your critical daily logistics.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a href="#waitlist" className="btn-capsule bg-ink text-white border-ink px-8 py-4 text-base hover:bg-zinc-800 w-full sm:w-auto shadow-md">
                Book now
              </a>
              <a href="#" className="btn-capsule bg-white text-ink border-zinc-200 hover:bg-zinc-50 px-8 py-4 text-base w-full sm:w-auto">
                Learn how it works
              </a>
            </motion.div>
          </motion.div>


        </div>
      </section>

      {/* 2. TRUST STRIP (STATS) */}
      <section className="py-16 bg-white border-y border-zinc-200/60">
        <div className="container-tight grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-ink mb-1">15,000+</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Visits Delivered</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-ink mb-1">100%</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Vetted Pros</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-ink mb-1">15 Min</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Average Response</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-ink mb-1">4.9/5</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">User Rating</div>
          </div>
        </div>
      </section>

      {/* 3. SERVICE OFFERINGS */}
      <section className="py-24 md:py-32 bg-zinc-50/50">
        <div className="container-tight">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Book trusted household help.</h2>
            <p className="text-zinc-600 font-medium text-lg">From instant hourly needs to deep upkeep. Flat pricing, transparent billing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { t: 'Express Kitchen Prep', d: 'Vegetable chopping, meal mise-en-place, and daily kitchen organizing.', i: '/images/cooking_hd.png' },
              { t: 'Surface Sanitization', d: 'Sweeping, mopping, and critical high-traffic area sterilization.', i: '/images/cleaning_localized.png' },
              { t: 'Full Cycle Laundry', d: 'Collection, machine load, expert folding, and organized replacement.', i: '/images/provider_hero.png' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="card-enterprise bg-white flex flex-col"
              >
                <div className="h-48 overflow-hidden border-b border-zinc-100 bg-zinc-50">
                  <img src={item.i} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-3 text-ink">{item.t}</h3>
                  <p className="text-zinc-500 font-medium mb-8 text-sm leading-relaxed">{item.d}</p>
                  <div className="mt-auto">
                    <a href="#" className="text-sm font-bold text-accent hover:text-accent-hover flex items-center gap-1">
                      View service details <Icons.ArrowRight />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white">
        <div className="container-tight max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-16 leading-tight">Get verified help in 3 simple steps.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-full bg-ink text-white flex items-center justify-center font-black text-xl shrink-0">1</div>
              <div>
                <h4 className="text-xl font-bold mb-2">Select your chores</h4>
                <p className="text-zinc-500 font-medium leading-relaxed">Choose from our catalogue of 20+ specialized services. Mix and stack multiple tasks into one single booking.</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-full bg-ink text-white flex items-center justify-center font-black text-xl shrink-0">2</div>
              <div>
                <h4 className="text-xl font-bold mb-2">Set the time</h4>
                <p className="text-zinc-500 font-medium leading-relaxed">Choose 'Instant' to get a Pro in 15 minutes, or schedule for a convenient later time that fits your roadmap.</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-full bg-ink text-white flex items-center justify-center font-black text-xl shrink-0">3</div>
              <div>
                <h4 className="text-xl font-bold mb-2">Pay and relax</h4>
                <p className="text-zinc-500 font-medium leading-relaxed">Secure flat pricing transparently calculated upfront. No hidden fees. Your Pro checks in via secure PIN code.</p>
              </div>
            </div>
          </div>
          
          {/* OLD IMAGE CODE:
          <div className="bg-zinc-50 rounded-[3rem] p-8 border border-zinc-200/60 mt-16 hidden">
            <div className="aspect-[4/5] bg-ink rounded-2xl overflow-hidden shadow-2xl relative">
              <img src="/images/nfc_localized.png" className="w-full h-full object-cover opacity-80" alt="Mobile interaction" />
            </div>
          </div>
          */}
        </div>
      </section>

      {/* 5. THE PROMISE / QUALITY ASSURANCE (Dark Contrast Block) */}
      <section className="py-24 md:py-32 section-dark relative overflow-hidden">
        <div className="container-tight relative z-10">
          {/* OLD CODE: <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"> */}
          <div className="grid grid-cols-1 max-w-4xl mx-auto gap-16 items-center text-center">
            <div>
              <span className="text-accent font-extrabold text-sm uppercase tracking-widest mb-4 block">The AZAP Promise</span>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">Standardized excellence. Every single visit.</h2>
              <p className="text-zinc-400 text-lg mb-10 font-medium leading-relaxed">We don't just match you with anyone. We operate a hyper-vetted network of professionals who undergo rigorous skill-testing and comprehensive verification before entering our ecosystem.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-2">Skill Audits</h4>
                  <p className="text-sm text-zinc-400">Continuous real-world quality assessments keep service quality impeccable.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-lg font-bold text-white mb-2">Zero Hassle</h4>
                  <p className="text-sm text-zinc-400">We handle all substitution logic if your primary provider is unavailable.</p>
                </div>
              </div>
            </div>
            {/*
            <div className="w-full aspect-square md:aspect-[4/5] relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
              <img src="/images/provider_hero.png" className="w-full h-full object-cover" alt="Elite Provider" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <div className="text-white font-extrabold text-lg mb-1">Top 2% Selection</div>
                <div className="text-zinc-300 text-sm">Only the most qualified professionals make it onto our platform.</div>
              </div>
            </div>
            */}
          </div>
        </div>
      </section>

      {/* 6. FOOTER CTA */}
      <section id="waitlist" className="py-32 md:py-48 bg-white">
        <div className="container-tight text-center max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-ink">Ready to save time?</h2>
          <p className="text-zinc-600 text-lg md:text-xl font-medium mb-12">Join the platform delivering premium, transparent household operations.</p>

          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 bg-zinc-50 border border-zinc-200 p-2 rounded-full overflow-hidden" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              className="flex-1 px-6 py-3 bg-transparent focus:outline-none text-ink font-medium placeholder:text-zinc-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="btn-capsule bg-accent text-white border-transparent hover:bg-accent-hover px-8 shadow-lg shadow-accent/20 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Sending...' : status === 'success' ? 'Joined!' : 'Submit'}
            </button>
          </form>
          {status === 'success' && (
            <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-accent text-sm mt-6 font-bold">
              Thanks for joining! We'll be in touch soon.
            </motion.p>
          )}
          {status !== 'success' && (
            <p className="text-zinc-400 text-sm mt-6 font-bold uppercase tracking-widest">Request invite code</p>
          )}
        </div>
      </section>

    </div>
  );
}
