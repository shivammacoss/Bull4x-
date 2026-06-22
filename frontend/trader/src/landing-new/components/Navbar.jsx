'use client'

import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Trading', to: '/our-trading' },
  {
    label: 'Platforms',
    dropdown: [
      { label: 'Web Platform',  to: '/platforms/web' },
      { label: 'Copy Trading',  to: '/platforms/copy-trading' },
      { label: 'IB Management', to: '/platforms/ib-management' },
    ],
  },
  {
    label: 'Accounts',
    dropdown: [
      { label: 'Standard', to: '/accounts/standard' },
      { label: 'Pro',      to: '/accounts/pro' },
      { label: 'Demo',     to: '/accounts/demo' },
    ],
  },
  { label: 'Education', to: '/blog' },
  { label: 'About',     to: '/about' },
  { label: 'Contact',   to: '/contact-us' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileSubOpen, setMobileSubOpen] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 w-full z-50 transition-all duration-300 top-0 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_0_#E8EAF0]'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/logo.svg"
            alt="Bull4x"
            className="h-9 w-auto"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-5 xl:gap-7 whitespace-nowrap">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className="flex items-center gap-1 text-[15px] font-medium text-[#0D0F1A] hover:text-[#0158c6] transition-colors"
                >
                  {link.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${openDropdown === link.label ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`absolute top-full left-0 pt-3 w-44 transition-all duration-200 ${
                    openDropdown === link.label
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-1'
                  }`}
                >
                  <div className="bg-white border border-[#E8EAF0] rounded-xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                    {link.dropdown.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.to}
                        className="block px-4 py-2.5 rounded-lg text-[15px] font-medium text-[#0D0F1A] hover:bg-[#F0F2F8] hover:text-[#0158c6] transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.to}
                className="text-[15px] font-medium text-[#0D0F1A] hover:text-[#0158c6] transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            href="/auth/login"
            className="hidden lg:block text-[15px] font-medium text-[#0D0F1A] hover:text-[#0158c6] transition-colors"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(77,190,81,0.4)] shadow-[0_4px_14px_rgba(1,88,198,0.28)] transition-all whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
          >
            Open Account
            <ArrowRight size={14} />
          </Link>

          <button
            className="lg:hidden text-[#0D0F1A] p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#E8EAF0] shadow-lg">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.label} className="border-b border-[#E8EAF0] pb-2">
                  <button
                    onClick={() => setMobileSubOpen(mobileSubOpen === link.label ? null : link.label)}
                    className="w-full flex items-center justify-between text-base font-medium text-[#0D0F1A] hover:text-[#0158c6] transition-colors py-2"
                  >
                    {link.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${mobileSubOpen === link.label ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {mobileSubOpen === link.label && (
                    <div className="flex flex-col pl-3 pb-1">
                      {link.dropdown.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.to}
                          onClick={() => setMobileOpen(false)}
                          className="text-sm font-medium text-[#6B7080] hover:text-[#0158c6] transition-colors py-2"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-[#0D0F1A] hover:text-[#0158c6] transition-colors py-2 border-b border-[#E8EAF0]"
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="flex gap-3 pt-3">
              <Link href="/auth/login" className="flex-1 text-center py-3 rounded-full border border-[#E8EAF0] text-sm font-semibold text-[#0D0F1A]">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="flex-1 text-center py-3 rounded-full text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
              >
                Open Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
