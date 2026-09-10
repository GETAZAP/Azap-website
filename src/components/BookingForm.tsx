import React, { useEffect, useRef, useState } from 'react';
import { phoneLooksValid, PHONE_ERROR } from '../lib/phone';

/**
 * Booking intake for the manually dispatched channel.
 *
 * Posts to the `web-booking` Supabase edge function, which is the only path
 * from the public internet into the concierge tables. No key is sent: the
 * function is deliberately unauthenticated (a customer booking a plumber has no
 * account) and does its own origin, validation and rate-limit checks.
 *
 * The customer pays nothing here and is told so explicitly. Money is never
 * mentioned except to say there is none. See BRIDGE_MODEL.md.
 *
 * Deliberately plain: no icons, no side panels, no cards within cards. The
 * validation behaviour underneath (blur validation, per-field errors, autofill,
 * focus management) is the part worth having, and none of it shows until it is
 * needed.
 */

const ENDPOINT = import.meta.env.PUBLIC_BOOKING_ENDPOINT as string | undefined;

// Must stay in step with the SERVICES set in the edge function; anything else is
// refused server-side rather than stored.
const GROUPS: { label: string; items: { key: string; name: string; hint: string }[] }[] = [
  {
    label: 'Repairs',
    items: [
      { key: 'plumbing', name: 'Plumbing', hint: 'Leaks, taps, pipes' },
      { key: 'electrical', name: 'Electrical', hint: 'Sockets, wiring, lighting' },
      { key: 'ac_repair', name: 'Air conditioning', hint: 'Servicing and repair' },
      { key: 'generator', name: 'Generator', hint: 'Servicing and repair' },
      { key: 'appliance_repair', name: 'Appliances', hint: 'Fridge, washer, cooker' },
      { key: 'carpentry', name: 'Carpentry', hint: 'Doors, furniture, fittings' },
      { key: 'painting', name: 'Painting', hint: 'Interior and exterior' },
    ],
  },
  {
    label: 'Household',
    items: [
      { key: 'cleaning', name: 'Cleaning', hint: 'One-off or regular' },
      { key: 'cooking', name: 'Cooking', hint: 'Meal prep in your kitchen' },
      { key: 'laundry', name: 'Laundry', hint: 'Wash, fold, iron' },
      { key: 'errands', name: 'Errands', hint: 'Shopping and logistics' },
    ],
  },
];

const WHEN = ['As soon as possible', 'Later today', 'Tomorrow', 'This week'];

const ERRORS: Record<string, string> = {
  invalid_phone: "That phone number doesn't look right. Use the number you answer calls on.",
  invalid_service: 'Please choose a service.',
  name_required: 'Please tell us your name.',
  phone_required: 'We need a phone number to call you back.',
  address_required: 'Please tell us where the job is.',
  invalid_email: "That email address doesn't look right.",
  too_many_requests: "You've sent a few requests already. Give us a moment to call you back.",
  forbidden_origin: 'Something went wrong on our side. Please call us instead.',
  server_misconfigured: 'Something went wrong on our side. Please call us instead.',
};

const LABEL = 'text-xs font-bold uppercase tracking-widest text-zinc-600';

const inputClass = (invalid: boolean) =>
  [
    'w-full rounded-xl border bg-white px-5 py-4 font-medium text-ink transition-all',
    'focus:outline-none focus:ring-2 disabled:opacity-50',
    invalid
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-zinc-200 focus:border-accent focus:ring-accent/20',
  ].join(' ');

type FieldName = 'name' | 'phone' | 'address';

export default function BookingForm() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [service, setService] = useState<string | null>(null);
  const [values, setValues] = useState({ name: '', phone: '', address: '', notes: '' });
  const [when, setWhen] = useState(WHEN[0]);

  const [touched, setTouched] = useState<Record<FieldName, boolean>>({ name: false, phone: false, address: false });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [trap, setTrap] = useState('');

  const refs = {
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    address: useRef<HTMLInputElement>(null),
  };

  const chosen = GROUPS.flatMap((g) => g.items).find((s) => s.key === service);

  // Each step is a different height, and the confirmation is much shorter than
  // the form. Without this the page keeps its old offset and the reference
  // renders off-screen, which is the one thing we just told them to keep. Runs
  // after commit, and instantly rather than smoothly, because
  // `html.scroll-smooth` animates window.scrollTo and that animation is
  // cancelled by the layout shift.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [step]);

  const fieldError = (f: FieldName): string | null => {
    const v = values[f].trim();
    if (f === 'name') return v ? null : 'Please tell us your name.';
    if (f === 'address') return v ? null : 'Please tell us where the job is.';
    if (!v) return 'We need a number to call you back on.';
    return phoneLooksValid(v) ? null : PHONE_ERROR;
  };

  // Shown only once a field has been left, never while typing. Validating on
  // every keystroke tells people they are wrong before they have finished being
  // right.
  const shownError = (f: FieldName) => (touched[f] ? fieldError(f) : null);

  const set = (f: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((p) => ({ ...p, [f]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const order: FieldName[] = ['name', 'phone', 'address'];
    const firstBad = order.find((f) => fieldError(f));
    if (firstBad) {
      setTouched({ name: true, phone: true, address: true });
      refs[firstBad].current?.focus();
      return;
    }

    setStatus('loading');
    setError(null);

    if (!ENDPOINT) {
      // Fail loudly rather than pretending it worked. A form that silently
      // discards a booking is worse than one that is visibly broken.
      setStatus('error');
      setError('Booking is not configured on this site yet. Please call us instead.');
      return;
    }

    // A fetch with no timeout can hang for a long time on a bad mobile
    // connection, leaving the button spinning forever with no way back.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          // Honeypot; the edge function drops anything with this set. See the
          // hidden input on the form below.
          company: trap,
          service_key: service,
          customer_name: values.name,
          customer_phone: values.phone,
          address: values.address,
          preferred_time: when,
          notes: values.notes || null,
        }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.ok) {
        setStatus('error');
        setError(ERRORS[result?.error] ?? 'We could not send that. Please try again.');
        return;
      }

      setReference(result.reference ?? null);
      setStatus('done');
      setStep(2);
    } catch (err) {
      setStatus('error');
      setError(
        (err as Error)?.name === 'AbortError'
          ? 'That took too long. Check your connection and try again.'
          : 'We could not send that. Please try again.',
      );
    } finally {
      clearTimeout(timeout);
    }
  };

  /* ---------------------------------------------------------------- done */
  if (step === 2) {
    return (
      /* The form is gone and a reference has appeared in its place. Without a
         live region a screen reader user hears nothing at all after pressing
         submit — on the one screen where the outcome is the whole point. */
      <div role="status" className="rise card-enterprise mx-auto max-w-xl p-10 text-center md:p-14">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h2 className="mb-3 text-3xl md:text-4xl">Booking received.</h2>
        <p className="mx-auto mb-8 max-w-md font-medium leading-relaxed text-zinc-500">
          We're finding you a vetted pro now. Someone will call you on{' '}
          <strong className="text-ink">{values.phone}</strong> to confirm before anyone is sent out.
        </p>

        {reference && (
          <div className="mb-8 inline-flex flex-col items-center gap-1 rounded-2xl bg-ink px-8 py-5 text-white">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Your reference</span>
            {/* Tabular figures: this gets read aloud down a phone line and
                should not wobble between characters. */}
            <span className="text-2xl font-extrabold tracking-tight tabular-nums">{reference}</span>
          </div>
        )}

        <p className="text-sm font-medium text-zinc-500">
          Keep that reference handy, and quote it if you call us.
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------- service */
  if (step === 0) {
    return (
      <div className="rise">
        <div className="mb-10">
          <span className={LABEL}>Step 1 of 2</span>
          <h2 className="mt-2 text-3xl md:text-4xl">What do you need?</h2>
        </div>

        {GROUPS.map((group) => (
          <div key={group.label} className="mb-10 last:mb-0">
            <div className={`${LABEL} mb-4`}>{group.label}</div>
            {/* Three across on desktop so eleven services read as a short grid
                rather than a long list. Two on tablet, one on phone. */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setService(s.key);
                    setStep(1);
                  }}
                  className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-left transition-all hover:border-accent hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                >
                  <div className="font-bold tracking-tight text-ink">{s.name}</div>
                  <div className="mt-0.5 text-sm font-medium text-zinc-500">{s.hint}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ------------------------------------------------------------- details */
  return (
    <form onSubmit={submit} noValidate className="rise relative mx-auto max-w-xl">
      <div className="mb-10">
        <button
          type="button"
          onClick={() => setStep(0)}
          className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-zinc-500 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          <span aria-hidden="true">&larr;</span> Change service
        </button>
        <span className={LABEL}>Step 2 of 2</span>
        <h2 className="mt-2 text-3xl md:text-4xl">{chosen?.name}. Where and when?</h2>
      </div>

      <div className="space-y-6">
        <TextField
          id="bk-name" label="Your name" required
          inputRef={refs.name} value={values.name} onChange={set('name')}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={shownError('name')} disabled={status === 'loading'}
          autoComplete="name"
        />

        <TextField
          id="bk-phone" label="Phone number" required type="tel" inputMode="tel"
          placeholder="0803 000 0000"
          inputRef={refs.phone} value={values.phone} onChange={set('phone')}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          error={shownError('phone')} disabled={status === 'loading'}
          autoComplete="tel"
          hint="We call this number to confirm before sending anyone."
        />

        <TextField
          id="bk-address" label="Address" required
          placeholder="Street, area, landmark"
          inputRef={refs.address} value={values.address} onChange={set('address')}
          onBlur={() => setTouched((t) => ({ ...t, address: true }))}
          error={shownError('address')} disabled={status === 'loading'}
          autoComplete="street-address"
        />

        <fieldset className="space-y-1.5">
          <legend className={LABEL}>When</legend>
          <div className="flex flex-wrap gap-2 pt-1">
            {WHEN.map((w) => (
              <button
                key={w} type="button" onClick={() => setWhen(w)} disabled={status === 'loading'}
                aria-pressed={when === w}
                className={`btn-capsule !px-5 !py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${
                  when === w ? 'border-transparent bg-ink text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="space-y-1.5">
          <label htmlFor="bk-notes" className={LABEL}>
            What's the problem? <span className="font-medium normal-case tracking-normal text-zinc-500">(optional)</span>
          </label>
          <textarea
            id="bk-notes" rows={3} value={values.notes} onChange={set('notes')}
            disabled={status === 'loading'} placeholder="A few words helps us send the right person."
            className={`${inputClass(false)} resize-none`}
          />
        </div>
      </div>

      {/* Honeypot. Invisible and unreachable by keyboard; the edge function
          discards any booking that arrives with it filled. Named `company`
          rather than something obviously fake, because that is the sort of
          field a form-filling bot is most confident about. */}
      <input
        type="text"
        name="company"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {status === 'error' && error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button type="submit" className="mt-2 text-sm font-bold text-red-900 underline underline-offset-4">
            Try again
          </button>
        </div>
      )}

      <button
        type="submit" disabled={status === 'loading'}
        className="btn-capsule mt-8 w-full !py-4 border-transparent bg-ink text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending…' : 'Request a pro'}
      </button>

      <p className="mt-5 text-center text-sm font-medium leading-relaxed text-zinc-600">
        <strong className="text-ink">Free to book.</strong> You pay nothing to AZAP. You settle
        the job price directly with your pro.
      </p>

      {/* A booking hands over a name, a phone number and a home address, and
          the address is the sensitive one. Say who sees it and for how long,
          next to the button that sends it. */}
      <p className="mx-auto mt-4 max-w-md text-center text-xs font-medium leading-relaxed text-zinc-600">
        We use these details to call you back and to send a pro to the address.
        Your address is shared only with the pro assigned to your job.{' '}
        <a href="/privacy" className="font-bold text-ink underline underline-offset-2 hover:text-accent-ink">
          Privacy policy
        </a>
        .
      </p>
    </form>
  );
}

/* One field, one place. Keeping label, input, hint and error together is what
   guarantees the error renders beside the thing that caused it rather than
   collected at the top of the form. */
function TextField({
  id, label, required, type = 'text', inputMode, placeholder, value, onChange, onBlur,
  error, disabled, hint, autoComplete, inputRef,
}: {
  id: string; label: string; required?: boolean; type?: string;
  inputMode?: 'tel' | 'text' | 'email'; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur: () => void;
  error: string | null; disabled: boolean; hint?: string; autoComplete?: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={LABEL}>
        {label}
        {required && <span className="ml-1 text-accent-ink" aria-hidden="true">*</span>}
      </label>
      <input
        id={id} ref={inputRef} type={type} inputMode={inputMode} placeholder={placeholder}
        value={value} onChange={onChange} onBlur={onBlur} disabled={disabled}
        autoComplete={autoComplete} required={required}
        aria-invalid={!!error} aria-describedby={describedBy}
        className={inputClass(!!error)}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="pt-0.5 text-sm font-semibold text-red-700">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="pt-0.5 text-xs font-medium text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
