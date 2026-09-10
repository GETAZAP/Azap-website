import React, { useRef, useState } from 'react';
import { phoneLooksValid, PHONE_ERROR } from '../lib/phone';

/**
 * A way to reach a person. Nothing more.
 *
 * This briefly carried a provider-application mode with a trade selector,
 * because `/provider` pointed here. That was removed deliberately: AZAP recruits
 * artisans in person, and a provider account grants sight of customer addresses,
 * so an open application path is the wrong shape regardless of volume.
 *
 * An artisan who writes in anyway lands in the same inbox. We simply do not
 * advertise it as a pipeline.
 *
 * Phone is required and email optional because AZAP operates by calling people
 * back, and tradespeople and customers alike are reachable on a phone long
 * before they are reachable on email.
 */

const ACCESS_KEY = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY as string | undefined;

const LABEL = 'text-xs font-bold uppercase tracking-widest text-zinc-600';

const inputClass = (invalid: boolean) =>
  [
    'w-full rounded-xl border bg-white px-5 py-4 font-medium text-ink transition-all',
    'focus:outline-none focus:ring-2 disabled:opacity-50',
    invalid
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-zinc-200 focus:border-accent focus:ring-accent/20',
  ].join(' ');

type FieldName = 'name' | 'phone' | 'message';

export default function ContactForm() {
  const [v, setV] = useState({ name: '', phone: '', email: '', message: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [trap, setTrap] = useState(false);

  const refs = {
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  };

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  const errorFor = (k: FieldName): string | null => {
    const val = v[k].trim();
    if (k === 'name') return val ? null : 'Please tell us your name.';
    if (k === 'phone') return !val ? 'We need a number to reach you on.' : phoneLooksValid(val) ? null : PHONE_ERROR;
    return val ? null : 'Tell us how we can help.';
  };
  const shown = (k: FieldName) => (touched[k] ? errorFor(k) : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const order: FieldName[] = ['name', 'phone', 'message'];
    const bad = order.find((k) => errorFor(k));
    if (bad) {
      setTouched({ name: true, phone: true, message: true });
      refs[bad].current?.focus();
      return;
    }

    setStatus('loading');
    setError(null);

    if (!ACCESS_KEY) {
      // Fail loudly. This form used to post an undefined access key when the
      // variable was unset, so every message was rejected and the sender was
      // told "something went wrong" with no route to a human.
      setStatus('error');
      setError('This form is not configured yet. Please email support@getazap.com directly.');
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          botcheck: trap,
          subject: `AZAP enquiry — ${v.name}`,
          name: v.name,
          phone: v.phone,
          email: v.email || '(not given)',
          message: v.message,
        }),
      });
      const result = await res.json().catch(() => null);
      if (!result?.success) {
        setStatus('error');
        setError('We could not send that. Please email support@getazap.com instead.');
        return;
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(
        (err as Error)?.name === 'AbortError'
          ? 'That took too long. Check your connection and try again.'
          : 'We could not send that. Please email support@getazap.com instead.',
      );
    } finally {
      clearTimeout(timeout);
    }
  };

  if (status === 'success') {
    return (
      /* role="status" so the swap is announced. tabIndex/-1 + autofocus is the
         alternative, but stealing focus mid-flow is worse than a polite
         announcement for something this short. */
      <div role="status" className="rise card-enterprise p-10 text-center md:p-12">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mb-3 text-2xl md:text-3xl">Message sent.</h2>
        <p className="mx-auto max-w-sm font-medium leading-relaxed text-zinc-500">
          We'll get back to you on <strong className="text-ink">{v.phone}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative space-y-5">
      {/* Honeypot. A real person never sees this field and never fills it;
          most form bots fill every input they find. Web3Forms treats a
          non-empty `botcheck` as spam server-side, so this is checked where it
          cannot be edited rather than only here.
          Hidden with tabIndex/-1 and aria-hidden rather than display:none, which
          some bots specifically look for. */}
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

      <div className="space-y-1.5">
        <label htmlFor="c-name" className={LABEL}>Your name <span className="text-accent-ink" aria-hidden="true">*</span></label>
        <input id="c-name" ref={refs.name} value={v.name} onChange={set('name')}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          disabled={status === 'loading'} autoComplete="name" required
          aria-invalid={!!shown('name')} aria-describedby={shown('name') ? 'c-name-error' : undefined}
          className={inputClass(!!shown('name'))} />
        {shown('name') && <p id="c-name-error" role="alert" className="pt-0.5 text-sm font-semibold text-red-700">{shown('name')}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="c-phone" className={LABEL}>Phone number <span className="text-accent-ink" aria-hidden="true">*</span></label>
        <input id="c-phone" ref={refs.phone} type="tel" inputMode="tel" placeholder="0803 000 0000"
          value={v.phone} onChange={set('phone')} onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          disabled={status === 'loading'} autoComplete="tel" required
          aria-invalid={!!shown('phone')} aria-describedby={shown('phone') ? 'c-phone-error' : 'c-phone-hint'}
          className={inputClass(!!shown('phone'))} />
        {shown('phone')
          ? <p id="c-phone-error" role="alert" className="pt-0.5 text-sm font-semibold text-red-700">{shown('phone')}</p>
          : <p id="c-phone-hint" className="pt-0.5 text-xs font-medium text-zinc-500">We'll call or message you on WhatsApp.</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="c-email" className={LABEL}>
          Email <span className="font-medium normal-case tracking-normal text-zinc-500">(optional)</span>
        </label>
        <input id="c-email" type="email" inputMode="email" value={v.email} onChange={set('email')}
          disabled={status === 'loading'} autoComplete="email" className={inputClass(false)} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="c-message" className={LABEL}>Message <span className="text-accent-ink" aria-hidden="true">*</span></label>
        <textarea id="c-message" ref={refs.message} rows={5} value={v.message} onChange={set('message')}
          onBlur={() => setTouched((t) => ({ ...t, message: true }))}
          disabled={status === 'loading'} placeholder="How can we help?"
          aria-invalid={!!shown('message')} aria-describedby={shown('message') ? 'c-message-error' : undefined}
          className={`${inputClass(!!shown('message'))} resize-none`} />
        {shown('message') && <p id="c-message-error" role="alert" className="pt-0.5 text-sm font-semibold text-red-700">{shown('message')}</p>}
      </div>

      {status === 'error' && error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-800">{error}</p>
        </div>
      )}

      <button type="submit" disabled={status === 'loading'}
        className="btn-capsule w-full !py-4 border-transparent bg-ink text-white hover:bg-zinc-800 disabled:opacity-60">
        {status === 'loading' ? 'Sending…' : 'Send message'}
      </button>

      {/* Told at the point of entry, not linked from a footer. This form leaves
          AZAP's servers entirely — Web3Forms relays it — and that is a
          disclosure someone is entitled to before they type, not after. */}
      <p className="pt-1 text-xs font-medium leading-relaxed text-zinc-600">
        We use these details to reply to you and nothing else. The message is
        delivered to our inbox by Web3Forms, our form provider.{' '}
        <a href="/privacy" className="font-bold text-ink underline underline-offset-2 hover:text-accent-ink">
          Privacy policy
        </a>
        .
      </p>
    </form>
  );
}
