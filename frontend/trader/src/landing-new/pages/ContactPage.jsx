'use client'

import { useState } from 'react';
import { Send, Mail, MapPin, Phone, Clock, MessageCircle, Check, UserCog, Wrench, Handshake, LineChart, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email Us',
    value: 'support@bull4x.com',
    sub: 'For account inquiries, technical support, partnership opportunities, and general assistance.',
    href: 'mailto:support@bull4x.com',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+44 20 1234 5678',
    sub: 'Speak directly with our support specialists during business hours.',
    href: 'tel:+442012345678',
  },
  {
    icon: MapPin,
    label: 'Visit Us',
    value: '123 Financial District, London, United Kingdom',
    sub: 'Our global operations team is available to assist clients and business partners.',
    href: 'https://maps.google.com/?q=Financial+District+London',
  },
];

const subjectOptions = [
  'General Inquiry',
  'Account Support',
  'Technical Support',
  'Partnership Request',
  'IB Program',
  'Copy Trading',
  'Deposits & Withdrawals',
  'Compliance',
  'Other',
];

const supportServices = [
  { icon: UserCog,   title: 'Account Assistance',  desc: 'Get help with account registration, verification, funding, withdrawals, and account management.' },
  { icon: Wrench,    title: 'Technical Support',   desc: 'Receive assistance with platform access, trading tools, login issues, and technical troubleshooting.' },
  { icon: Handshake, title: 'Partnership Support', desc: 'Speak with our team regarding Introducing Broker (IB) partnerships, affiliate opportunities, and business development.' },
  { icon: LineChart, title: 'Trading Support',     desc: 'Get guidance on platform functionality, trading tools, and market access.' },
];

const whyContact = [
  'Dedicated multilingual support team',
  'Fast response times',
  '24/5 client assistance',
  'Technical & account support',
  'Partnership & business inquiries',
  'Secure communication channels',
  'Professional customer service',
  'Global client support network',
];

const faqs = [
  { q: 'How long does it take to receive a response?', a: 'Most email inquiries receive a response within 24 business hours.' },
  { q: 'Is live chat available?',                       a: 'Yes, live chat support is available 24/5 during active trading hours.' },
  { q: 'Can I contact Bull4x regarding partnerships?', a: 'Absolutely. Partnership, affiliate, and Introducing Broker inquiries are welcomed through our contact form or dedicated support channels.' },
  { q: 'Where is Bull4x located?',                   a: 'Our primary operations office is based in London, United Kingdom.' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-44 md:pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Contact</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            Get in <span className="text-[#0158c6]">Touch</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] leading-relaxed">
            Have a question? Need assistance with your account or trading platform? The Bull4x support team is
            here to help. Reach out to us anytime through your preferred communication channel.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-14 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all block"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0158c6]/10 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-[#0158c6]" />
                  </div>
                  <p className="text-xs font-bold text-[#0158c6] uppercase tracking-widest mb-2">{c.label}</p>
                  <p className="text-base sm:text-lg font-semibold text-[#0D0F1A] mb-3 break-words">{c.value}</p>
                  <p className="text-sm text-[#6B7080] leading-relaxed">{c.sub}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Send Us a Message + Office Info */}
      <section className="py-14 md:py-20 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-3">Message</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-8">
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#0D0F1A] mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] bg-white text-[#0D0F1A] placeholder:text-[#9AA0B4] focus:outline-none focus:ring-2 focus:ring-[#0158c6]/30 focus:border-[#0158c6] transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#0D0F1A] mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] bg-white text-[#0D0F1A] placeholder:text-[#9AA0B4] focus:outline-none focus:ring-2 focus:ring-[#0158c6]/30 focus:border-[#0158c6] transition-all"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-[#0D0F1A] mb-2">Subject</label>
                <div className="relative">
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-[#E8EAF0] bg-white text-[#0D0F1A] focus:outline-none focus:ring-2 focus:ring-[#0158c6]/30 focus:border-[#0158c6] transition-all"
                  >
                    <option value="" disabled>Select a subject</option>
                    {subjectOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7080] pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-[#0D0F1A] mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe how we can help you"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8EAF0] bg-white text-[#0D0F1A] placeholder:text-[#9AA0B4] focus:outline-none focus:ring-2 focus:ring-[#0158c6]/30 focus:border-[#0158c6] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] hover:-translate-y-0.5 transition-all"
                style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
              >
                Send Message <Send size={16} />
              </button>

              {submitted && (
                <p className="text-sm font-medium text-[#4dbe51] mt-2">
                  Thanks — your message has been received. We&apos;ll reply within 24 business hours.
                </p>
              )}
            </form>
          </div>

          {/* Office Info */}
          <div className="lg:col-span-2 bg-[#0C0C1D] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 sm:p-10">
            <p className="text-xs font-bold text-[#0199c6] uppercase tracking-widest mb-3">Our Office</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-8">Bull4x Ltd</h3>

            <div className="space-y-6 text-sm">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0158c6]/20 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-[#0199c6]" />
                </div>
                <div>
                  <p className="text-[#9AA0B4] mb-1 font-semibold">Address</p>
                  <p className="text-white leading-relaxed">
                    123 Financial District<br />
                    London, EC2N 2DL<br />
                    United Kingdom
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0158c6]/20 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-[#0199c6]" />
                </div>
                <div>
                  <p className="text-[#9AA0B4] mb-1 font-semibold">Phone</p>
                  <a href="tel:+442012345678" className="text-white hover:text-[#0199c6] transition-colors">+44 20 1234 5678</a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0158c6]/20 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-[#0199c6]" />
                </div>
                <div>
                  <p className="text-[#9AA0B4] mb-1 font-semibold">Email</p>
                  <a href="mailto:support@bull4x.com" className="text-white hover:text-[#0199c6] transition-colors break-words">support@bull4x.com</a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#0158c6]/20 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-[#0199c6]" />
                </div>
                <div>
                  <p className="text-[#9AA0B4] mb-1 font-semibold">Business Hours</p>
                  <p className="text-white leading-relaxed">
                    Monday – Friday<br />
                    9:00 AM – 6:00 PM GMT
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Support Services */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">How We Help</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Customer Support Services
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportServices.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#0158c6]/10 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-[#0158c6]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0D0F1A] mb-3">{s.title}</h3>
                  <p className="text-sm text-[#6B7080] leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Need Immediate Assistance */}
      <section className="py-14 md:py-20 px-6 bg-[#0C0C1D]">
        <div className="max-w-4xl mx-auto bg-[#141428] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0158c6]/20 flex items-center justify-center mx-auto mb-6">
            <MessageCircle size={26} className="text-[#0199c6]" />
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-white mb-4">
            Need Immediate Assistance?
          </h2>
          <p className="text-base sm:text-lg text-[#9AA0B4] max-w-2xl mx-auto mb-2 leading-relaxed">
            Our live support team is available to help with urgent questions and account-related issues.
          </p>
          <p className="text-sm font-semibold text-[#0199c6] uppercase tracking-widest mb-8">
            Live Chat Support · Available 24/5 during market hours
          </p>
          <a
            href="#chat"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] hover:-translate-y-0.5 transition-all"
            style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
          >
            Start Live Chat <MessageCircle size={16} />
          </a>
        </div>
      </section>

      {/* Why Contact Bull4x */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Support Promise</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Why Contact <span className="text-[#0158c6]">Bull4x</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {whyContact.map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white border border-[#E8EAF0] rounded-xl px-5 py-4">
                <div className="w-6 h-6 rounded-full bg-[#0158c6]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-[#0158c6]" strokeWidth={3} />
                </div>
                <p className="text-sm sm:text-base text-[#0D0F1A] font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">FAQ</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A]">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-7">
                <h3 className="text-base sm:text-lg font-bold text-[#0D0F1A] mb-3">{f.q}</h3>
                <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
