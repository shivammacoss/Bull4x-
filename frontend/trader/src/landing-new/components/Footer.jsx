'use client'

import Link from 'next/link';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import TradingViewLegalNotice from './TradingViewLegalNotice';

const footerLinks = {
  'Platform': [
    { label: 'Trading', href: '/our-trading' },
    { label: 'Promotions', href: '/challenges' },
    { label: 'Accounts', href: '/our-accounts' },
  ],
  'Resources': [
    { label: 'FAQ', href: '/faqs' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact-us' },
  ],
  'Legal': [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Risk Disclaimer', href: '/risk' },
  ],
};

export default function Footer() {
  const { ref: linksRef } = useScrollAnimation(0.05);

  return (
    <footer className="bg-[#0C0C1D] border-t border-[rgba(255,255,255,0.08)] relative overflow-hidden">
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
      />
      <div className="max-w-6xl mx-auto px-6 py-16">

        <div ref={linksRef} className="scroll-reveal grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <a href="#home" className="flex items-center gap-2 mb-4 group">
              <img
                src="/logo.svg"
                alt="Bull4x"
                className="h-9 w-auto"
              />
            </a>
            <p className="text-sm text-[#9AA0B4] leading-relaxed">
              Trade with clarity. Trade with Bull4x — the regulated forex brokerage built for traders who take it seriously.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        href={link.href}
                        className="text-sm text-[#9AA0B4] hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-[#9AA0B4] hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[rgba(255,255,255,0.08)] pt-8 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#9AA0B4]">© 2026 Bull4x. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/terms" className="text-sm text-[#9AA0B4] hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="/privacy" className="text-sm text-[#9AA0B4] hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/refund-policy" className="text-sm text-[#9AA0B4] hover:text-white transition-colors">Refund Policy</Link>
              <Link href="/risk" className="text-sm text-[#9AA0B4] hover:text-white transition-colors">Risk Disclaimer</Link>
            </div>
          </div>
          <p className="text-xs text-[#9AA0B4] mt-4 leading-relaxed text-center md:text-left">
            Bull4x is an authorised and regulated forex and CFD brokerage.
            CFDs are leveraged instruments and carry a high level of risk to your capital. Past performance does not guarantee future results.
            Trading involves substantial risk and is not suitable for every investor.
          </p>
        </div>
      </div>
    </footer>
  );
}
