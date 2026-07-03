import React, { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY,
          subject: 'New Contact Form Submission',
          name,
          email,
          message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        console.error('Submission failed:', result);
        setStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Name</label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === 'loading' || status === 'success'}
          className="w-full px-5 py-4 rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-medium text-ink disabled:opacity-50"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Email</label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading' || status === 'success'}
          className="w-full px-5 py-4 rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-medium text-ink disabled:opacity-50"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Message</label>
        <textarea
          id="contact-message"
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === 'loading' || status === 'success'}
          className="w-full px-5 py-4 rounded-xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-medium text-ink disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className="btn-capsule bg-ink text-white border-transparent hover:bg-zinc-800 w-full py-4 text-base shadow-md disabled:opacity-80"
      >
        {status === 'loading' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Send Message'}
      </button>
      {status === 'success' && (
        <p className="text-sm font-bold text-center text-accent">Thanks for reaching out! We'll be in touch soon.</p>
      )}
      {status === 'error' && (
        <p className="text-sm font-bold text-center text-red-500">Something went wrong. Please email us directly at admin@getazap.com.</p>
      )}
    </form>
  );
}
