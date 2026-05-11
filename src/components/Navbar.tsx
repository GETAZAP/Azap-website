import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-[100] border-b border-zinc-200/50 bg-white/80 backdrop-blur-md px-6 py-4">
      <div className="container-tight flex items-center justify-between !px-0">
        <a href="/" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="AZAP" className="h-9 w-auto" />
          <span className="font-extrabold text-xl tracking-tighter text-ink">AZAP</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="/services" className="text-sm font-bold text-zinc-600 hover:text-ink transition-colors">Services</a>
          <a href="/how-it-works" className="text-sm font-bold text-zinc-600 hover:text-ink transition-colors">How it works</a>
          <a href="/provider" className="text-sm font-bold text-zinc-600 hover:text-ink transition-colors">Become a Provider</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/#waitlist" className="btn-capsule bg-ink text-white border-transparent hover:bg-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            Get app
          </a>
        </div>
      </div>
    </nav>
  );
}
