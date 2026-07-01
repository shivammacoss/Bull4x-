'use client'

// BULL4X - Contact page (Bull4X landing design)
import React, { useState } from 'react'
import { Mail, MessageCircle, Clock, MapPin, Send, CheckCircle2 } from 'lucide-react'
import AnimatedSection from '../components/AnimatedSection'
import SectionHeader from '../components/SectionHeader'

const channels = [
  { icon: <Mail size={22} className="text-red-accent" />, title: 'Email Us', value: 'support@bull4x.com', href: 'mailto:support@bull4x.com' },
  { icon: <MessageCircle size={22} className="text-red-accent" />, title: 'Live Chat', value: '24/5 instant support', href: null },
  { icon: <Clock size={22} className="text-red-accent" />, title: 'Support Hours', value: 'Mon–Fri, 24 hours', href: null },
]

const offices = [
  { city: 'London', region: 'United Kingdom' },
  { city: 'Dubai', region: 'United Arab Emirates' },
  { city: 'Tokyo', region: 'Japan' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return
    // Marketing form — no backend wired; acknowledge locally.
    setSent(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-40 pointer-events-none" aria-hidden />
        <div className="section-container relative z-10 text-center">
          <SectionHeader
            badge="Get in Touch"
            title="We're Here to Help"
            highlight="Help"
            subtitle="Have a question about accounts, platforms or funding? Our support team is available 24/5 to assist you."
          />
        </div>
      </section>

      {/* Channels */}
      <section className="pb-4">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {channels.map((c, i) => (
              <AnimatedSection key={c.title} animation="slideUp" delay={i * 0.08}>
                <div className="card h-full text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-red-accent/10 border border-red-accent/20">{c.icon}</div>
                  <h3 className="text-base font-bold text-white mb-1.5">{c.title}</h3>
                  {c.href ? (
                    <a href={c.href} className="text-slate-400 text-sm hover:text-[#D9A136] transition-colors">{c.value}</a>
                  ) : (
                    <p className="text-slate-400 text-sm">{c.value}</p>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Form + offices */}
      <section className="section-padding">
        <div className="section-container grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <AnimatedSection animation="slideUp" className="lg:col-span-2">
            <div className="card">
              <h3 className="text-xl font-bold text-white mb-6">Send Us a Message</h3>
              {sent ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <CheckCircle2 size={48} className="text-green-accent mb-4" />
                  <h4 className="text-lg font-bold text-white mb-1">Message Sent</h4>
                  <p className="text-slate-400 text-sm">Thanks for reaching out — our team will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input className="input-field" placeholder="Full name" value={form.name} onChange={update('name')} required />
                    <input className="input-field" type="email" placeholder="Email address" value={form.email} onChange={update('email')} required />
                  </div>
                  <input className="input-field" placeholder="Subject" value={form.subject} onChange={update('subject')} />
                  <textarea className="input-field min-h-[140px] resize-y" placeholder="How can we help?" value={form.message} onChange={update('message')} required />
                  <button type="submit" className="b4x-btn-primary gap-2"><Send size={15} /> Send Message</button>
                </form>
              )}
            </div>
          </AnimatedSection>

          {/* Offices */}
          <AnimatedSection animation="slideUp" delay={0.1}>
            <div className="card h-full">
              <h3 className="text-xl font-bold text-white mb-6">Our Offices</h3>
              <ul className="space-y-5">
                {offices.map((o) => (
                  <li key={o.city} className="flex items-start gap-3">
                    <MapPin size={18} className="text-red-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold text-sm">{o.city}</div>
                      <div className="text-slate-400 text-xs">{o.region}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Trading leveraged products carries a high level of risk. Please ensure you fully understand the risks involved.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
