import React from 'react';

export default function Footer() {
  return (
    <footer className="py-24 bg-zinc-50 border-t border-zinc-200/70 px-6 font-sans">
      <div className="container-tight !px-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/images/logo.png" alt="AZAP" className="h-8 w-auto" />
              <span className="font-extrabold text-xl tracking-tighter text-ink">AZAP</span>
            </div>
            <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-xs mb-6">
              Managed household operations delivered in 15 minutes for high-performance lifestyles.
            </p>
            <a href="mailto:admin@getazap.com" className="text-zinc-800 font-bold text-sm hover:underline">admin@getazap.com</a>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-ink mb-6">Company</h4>
            <ul className="space-y-3 text-sm font-bold text-zinc-500">
              <li><a href="/about" className="hover:text-ink transition-colors">About</a></li>
              <li><a href="/provider" className="hover:text-ink transition-colors">Partners</a></li>
              <li><a href="/careers" className="hover:text-ink transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-ink mb-6">Product</h4>
            <ul className="space-y-3 text-sm font-bold text-zinc-500">
              <li><a href="/services" className="hover:text-ink transition-colors">Services</a></li>
              <li><a href="/cities" className="hover:text-ink transition-colors">Locations</a></li>
              <li><a href="/faq" className="hover:text-ink transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-ink mb-6">Legal</h4>
            <ul className="space-y-3 text-sm font-bold text-zinc-500">
              <li><a href="/terms" className="hover:text-ink transition-colors">Terms</a></li>
              <li><a href="/privacy" className="hover:text-ink transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs font-bold text-zinc-400 tracking-wide">
            © {new Date().getFullYear()} AZAP Technologies Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-xs font-bold text-zinc-400">
            <a href="#" className="hover:text-ink">Twitter</a>
            <a href="#" className="hover:text-ink">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
