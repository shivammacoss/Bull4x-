'use client'
// ============================================
// BULL4X - Footer — Cyber-Samurai
// ============================================

import React from 'react'
import { Link } from '../router-shim'
import {
  Mail, MessageCircle,
  Twitter, Facebook, Linkedin, Instagram, Youtube,
  ArrowRight, Shield, AlertTriangle
} from 'lucide-react'

const footerLinks = {
  quickLinks: [
    { label: 'Home',          path: '/' },
    { label: 'About Us',      path: '/company/about' },
    { label: 'Markets',       path: '/our-trading' },
    { label: 'Platforms',     path: '/platforms/web' },
    { label: 'Account Types', path: '/our-accounts' },
    { label: 'Promotions',    path: '/pricing' },
    { label: 'Contact Us',    path: '/contact-us' },
  ],
  tradingProducts: [
    { label: 'Forex Trading',  path: '/trading/forex' },
    { label: 'Indices',        path: '/trading/indices' },
    { label: 'Commodities',    path: '/trading/commodities' },
    { label: 'Stocks',         path: '/our-trading' },
    { label: 'Cryptocurrency', path: '/trading/crypto' },
  ],
  platforms: [
    { label: 'Bull4X WebTrader',  path: '/platforms/web' },
    { label: 'Mobile App',        path: '/platforms/web' },
    { label: 'Desktop Terminal',  path: '/platforms/web' },
    { label: 'Copy Trading',      path: '/platforms/copy-trading' },
    { label: 'VPS Hosting',       path: '/platforms/web' },
  ],
  legal: [
    { label: 'Risk Disclosure',    path: '/terms' },
    { label: 'Privacy Policy',     path: '/privacy' },
    { label: 'Terms & Conditions', path: '/terms' },
    { label: 'AML Policy',         path: '/terms' },
    { label: 'Cookie Policy',      path: '/privacy' },
  ],
}

const socialLinks = [
  { icon: <Twitter />,   label: 'Twitter',   href: '#' },
  { icon: <Facebook />,  label: 'Facebook',  href: '#' },
  { icon: <Linkedin />,  label: 'LinkedIn',  href: '#' },
  { icon: <Instagram />, label: 'Instagram', href: '#' },
  { icon: <Youtube />,   label: 'YouTube',   href: '#' },
]

function Footer() {
  return (
    <footer
      className="border-t border-white/5"
      style={{ background: 'linear-gradient(180deg, #111820 0%, #0d1117 100%)' }}
    >
      {/* Top neon line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(217,161,54,0.4), transparent)' }} />

      {/* Main Footer Content */}
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-5 group w-fit">
              <img
                src="/bull4x-logo.png"
                alt="BULL4X"
                className="h-10 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(217,161,54,0.6)]"
              />
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              BULL4X is a global multi-asset brokerage providing professional trading solutions for traders worldwide. Our platform combines advanced technology, deep liquidity, and transparent pricing to deliver a powerful trading experience.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a
                href="mailto:support@bull4x.com"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#D9A136] transition-colors duration-200"
              >
                <Mail size={13} className="text-[#D9A136] flex-shrink-0" />
                support@bull4x.com
              </a>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MessageCircle size={13} className="text-[#D9A136] flex-shrink-0" />
                Live Chat — 24/5 Support
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#D9A136] hover:border-[#D9A136]/30 hover:bg-[#D9A136]/5 transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#D9A136] transition-colors duration-200 group"
                  >
                    <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#D9A136]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trading Products */}
          <div>
            <h4
              className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Markets
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.tradingProducts.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#D9A136] transition-colors duration-200 group"
                  >
                    <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#D9A136]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h4
              className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Platforms
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.platforms.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#D9A136] transition-colors duration-200 group"
                  >
                    <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#D9A136]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="text-white font-semibold text-xs uppercase tracking-[0.15em] mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Legal
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#D9A136] transition-colors duration-200 group"
                  >
                    <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#D9A136]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Risk Warning */}
      <div className="border-t border-white/5">
        <div className="section-container py-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
            <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={14} />
            <div>
              <p className="text-xs font-semibold text-yellow-500 mb-1 uppercase tracking-wider">Risk Warning</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Trading leveraged products carries a high level of risk and may not be suitable for all investors.
                You may lose more than your initial investment. Please ensure you fully understand the risks involved
                and seek independent advice if necessary. Past performance is not indicative of future results.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="section-container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 font-mono">
              © {new Date().getFullYear()} BULL4X. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Shield size={11} className="text-[#00d4aa]" />
                SSL Secured
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse"
                  style={{ boxShadow: '0 0 5px rgba(0,212,170,0.7)' }}
                />
                All Systems Operational
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
