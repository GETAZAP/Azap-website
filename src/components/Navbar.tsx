import React, { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
          <a href="/business" className="text-sm font-bold text-zinc-600 hover:text-ink transition-colors">Business</a>
          <a href="/provider" className="text-sm font-bold text-zinc-600 hover:text-ink transition-colors">Become a Provider</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/#waitlist" className="hidden md:flex btn-capsule bg-ink text-white border-transparent hover:bg-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
            Get app
          </a>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-zinc-600 focus:outline-none"
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
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-zinc-200/50 shadow-lg py-4 px-6 flex flex-col gap-4">
          <a href="/services" className="text-base font-bold text-zinc-600 hover:text-ink" onClick={() => setIsOpen(false)}>Services</a>
          <a href="/how-it-works" className="text-base font-bold text-zinc-600 hover:text-ink" onClick={() => setIsOpen(false)}>How it works</a>
          <a href="/business" className="text-base font-bold text-zinc-600 hover:text-ink" onClick={() => setIsOpen(false)}>Business</a>
          <a href="/provider" className="text-base font-bold text-zinc-600 hover:text-ink" onClick={() => setIsOpen(false)}>Become a Provider</a>
          <div className="pt-4 mt-2 border-t border-zinc-100 flex justify-center">
            <a href="/#waitlist" className="btn-capsule bg-ink text-white border-transparent hover:bg-zinc-800 w-full text-center" onClick={() => setIsOpen(false)}>
              Get app
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
