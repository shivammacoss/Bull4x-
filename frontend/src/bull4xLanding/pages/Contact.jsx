// ============================================
// BULL4X - Contact Page
// ============================================

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail, MessageCircle, Phone, Globe,
  ArrowRight, Check, Send, User,
  MapPin, Clock, Loader2,
  Landmark, Building2, Building,
  ShieldCheck, MessageSquare, FileText,
  TrendingUp, GraduationCap, Rocket
} from 'lucide-react'
import AnimatedSection, { StaggerContainer, StaggerItem, PageTransition } from '../components/AnimatedSection'
import SectionHeader from '../components/SectionHeader'
import MarketTicker from '../components/MarketTicker'

const contactMethods = [
  {
    icon: <Mail size={22} />,
    title: 'Email Support',
    value: 'support@bull4x.com',
    desc: 'We respond within 2 business hours',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    action: 'mailto:support@bull4x.com',
    actionLabel: 'Send Email',
  },
  {
    icon: <MessageCircle size={22} />,
    title: 'Live Chat',
    value: 'Available 24/5',
    desc: 'Instant support from our team',
    color: 'text-green-accent',
    bg: 'bg-green-accent/10',
    border: 'border-green-accent/20',
    action: '#',
    actionLabel: 'Start Chat',
  },
  {
    icon: <Phone size={22} />,
    title: 'Phone Support',
    value: '+1 (800) Bull4X-1',
    desc: 'Mon�Fri, 8:00 AM � 8:00 PM GMT',
    color: 'text-gold-500',
    bg: 'bg-gold-500/10',
    border: 'border-gold-500/20',
    action: 'tel:+18004655241',
    actionLabel: 'Call Now',
  },
]

const offices = [
  {
    city: 'Tokyo',
    country: 'Japan',
    address: '1-1 Marunouchi, Chiyoda-ku, Tokyo',
    icon: Landmark,
    accent: 'text-gold-400',
    bg: 'bg-gold-500/10',
    ring: 'ring-gold-500/30',
    type: 'Headquarters',
  },
  {
    city: 'London',
    country: 'United Kingdom',
    address: '30 St Mary Axe, London, EC3A 8BF',
    icon: Building2,
    accent: 'text-blue-400',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/30',
    type: 'European Office',
  },
  {
    city: 'Dubai',
    country: 'UAE',
    address: 'DIFC, Gate District, Dubai',
    icon: Building,
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/30',
    type: 'MENA Office',
  },
]

const faqItems = [
  { q: 'How long does account verification take?', a: 'Account verification typically takes 1-2 business hours during working hours. You will receive an email confirmation once your account is verified.' },
  { q: 'What documents are required for verification?', a: 'You will need a government-issued photo ID (passport or national ID) and a proof of address document (utility bill or bank statement) dated within the last 3 months.' },
  { q: 'How can I deposit funds?', a: 'We accept bank transfers, credit/debit cards (Visa/Mastercard), and major e-wallets. All deposits are processed instantly or within 1 business day.' },
  { q: 'How long do withdrawals take?', a: 'Withdrawals are processed within 24 hours on business days. The time to receive funds depends on your payment method (1-5 business days for bank transfers).' },
]

function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setFormData({ fullName: '', email: '', country: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    }, 900)
  }

  return (
    <PageTransition>
      <div className="pt-16 md:pt-18">
        <MarketTicker />
      </div>

      {/* Hero */}
      <section className="relative py-20 hero-bg grid-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="section-container relative z-10">
          <AnimatedSection animation="slideUp" className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6">
              <Mail size={14} className="text-gold-400" />
              <span className="text-gold-400 text-xs font-semibold uppercase tracking-wider">Contact Us</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              We're Here to <span className="text-gold-gradient">Help You</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Our dedicated support team is available 24/5 to assist you with any questions about trading, accounts, or our platform.
            </p>
            {/* Support hours badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-accent/10 border border-green-accent/20">
              <div className="w-2 h-2 rounded-full bg-green-accent animate-pulse"></div>
              <span className="text-green-accent text-sm font-medium">Support Online � Average response: under 2 hours</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="section-padding bg-bull-900">
        <div className="section-container">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <StaggerItem key={method.title}>
                <div className={`card group h-full border ${method.border} hover:shadow-lg transition-all duration-300`}>
                  <div className={`feature-icon ${method.bg} ${method.color} mb-4`}>
                    {method.icon}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-gold-400 transition-colors">
                    {method.title}
                  </h3>
                  <p className={`font-semibold mb-1 ${method.color}`}>{method.value}</p>
                  <p className="text-gray-500 text-sm mb-5">{method.desc}</p>
                  <a
                    href={method.action}
                    className={`inline-flex items-center gap-2 text-sm font-semibold ${method.color} hover:opacity-80 transition-opacity`}
                  >
                    {method.actionLabel} <ArrowRight size={14} />
                  </a>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="section-padding bg-bull-800">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <AnimatedSection animation="slideLeft">
              <div className="relative">
                {/* Ambient glow behind form */}
                <div className="absolute -inset-4 bg-gradient-to-br from-gold-500/5 via-transparent to-blue-500/5 rounded-3xl blur-2xl pointer-events-none"></div>

                <div className="relative p-6 md:p-8 rounded-2xl bg-bull-700/40 backdrop-blur-sm border border-white/10">
                  <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 mb-4">
                      <MessageSquare size={12} className="text-gold-400" />
                      <span className="text-gold-400 text-[10px] font-semibold uppercase tracking-wider">Get in Touch</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Send Us a Message</h2>
                    <div className="w-12 h-1 bg-gold-gradient rounded-full mb-4"></div>
                    <p className="text-gray-400 text-sm">Fill in the form below and our team will get back to you within 2 business hours.</p>
                  </div>

                  {submitted ? (
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-green-accent/15 to-green-accent/5 border border-green-accent/30 text-center animate-in fade-in zoom-in duration-500">
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full bg-green-accent/20 animate-ping"></div>
                        <div className="relative w-16 h-16 rounded-full bg-green-accent/20 flex items-center justify-center">
                          <Check size={28} className="text-green-accent" strokeWidth={3} />
                        </div>
                      </div>
                      <h3 className="text-white font-semibold text-xl mb-2">Message Sent!</h3>
                      <p className="text-gray-400 text-sm">Thank you for contacting us. We'll get back to you within 2 business hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Row 1: Name + Email */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Full Name <span className="text-gold-400">*</span>
                          </label>
                          <div className="relative group">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold-400 transition-colors pointer-events-none" />
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              required
                              placeholder="John Smith"
                              className="input-field pl-11"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Email Address <span className="text-gold-400">*</span>
                          </label>
                          <div className="relative group">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold-400 transition-colors pointer-events-none" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              placeholder="john@example.com"
                              className="input-field pl-11"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Country + Subject */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Country <span className="text-gold-400">*</span>
                          </label>
                          <div className="relative group">
                            <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold-400 transition-colors pointer-events-none z-10" />
                            <select
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                              required
                              className="input-field pl-11 pr-10 appearance-none cursor-pointer"
                            >
                              <option value="">Select your country</option>
                              <option value="US">United States</option>
                              <option value="GB">United Kingdom</option>
                              <option value="JP">Japan</option>
                              <option value="AU">Australia</option>
                              <option value="CA">Canada</option>
                              <option value="DE">Germany</option>
                              <option value="FR">France</option>
                              <option value="SG">Singapore</option>
                              <option value="AE">United Arab Emirates</option>
                              <option value="OTHER">Other</option>
                            </select>
                            <ArrowRight size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 rotate-90 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Subject
                          </label>
                          <div className="relative group">
                            <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold-400 transition-colors pointer-events-none z-10" />
                            <select
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              className="input-field pl-11 pr-10 appearance-none cursor-pointer"
                            >
                              <option value="">Select a subject</option>
                              <option value="account">Account Opening</option>
                              <option value="deposit">Deposit & Withdrawal</option>
                              <option value="platform">Platform Support</option>
                              <option value="trading">Trading Conditions</option>
                              <option value="verification">Account Verification</option>
                              <option value="other">Other</option>
                            </select>
                            <ArrowRight size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 rotate-90 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Message <span className="text-gold-400">*</span>
                          </label>
                          <span className="text-[10px] text-gray-500">{formData.message.length}/1000</span>
                        </div>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          maxLength={1000}
                          placeholder="How can we help you today?"
                          className="input-field resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="b4x-btn-primary w-full gap-2 py-4 text-base font-semibold relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                            Send Message
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-2 pt-2">
                        <ShieldCheck size={12} className="text-green-accent flex-shrink-0" />
                        <p className="text-[11px] text-gray-500 text-center">
                          By submitting, you agree to our Privacy Policy and Terms of Service.
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </AnimatedSection>

            {/* Right: Info */}
            <AnimatedSection animation="slideRight" delay={0.2}>
              {/* Support Hours */}
              <div className="mb-8">
                <h3 className="text-white font-semibold text-xl mb-4">Support Hours</h3>
                <div className="space-y-3">
                  {[
                    { day: 'Monday � Friday', hours: '24 hours', status: 'Full Support' },
                    { day: 'Saturday', hours: '8:00 AM � 6:00 PM GMT', status: 'Limited' },
                    { day: 'Sunday', hours: 'Closed', status: 'Emergency Only' },
                  ].map((item) => (
                    <div key={item.day} className="flex items-center justify-between p-3 rounded-lg bg-bull-600 border border-white/5">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-gold-400" />
                        <span className="text-gray-300 text-sm">{item.day}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-xs font-semibold">{item.hours}</div>
                        <div className="text-gray-500 text-xs">{item.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Global Offices */}
              <div className="mb-8">
                <h3 className="text-white font-semibold text-xl mb-4">Global Offices</h3>
                <div className="space-y-3">
                  {offices.map((office) => {
                    const Icon = office.icon
                    return (
                      <div key={office.city} className="group flex gap-4 p-4 rounded-xl bg-bull-600 border border-white/5 hover:border-gold-500/20 hover:bg-bull-600/80 transition-all duration-300">
                        <div className={`w-12 h-12 rounded-xl ${office.bg} ring-1 ${office.ring} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                          <Icon size={20} className={office.accent} strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-white font-semibold text-sm">{office.city}, {office.country}</span>
                            <span className="badge bg-gold-500/10 text-gold-400 text-[10px] uppercase tracking-wider">{office.type}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <MapPin size={11} className="text-gold-500 flex-shrink-0" />
                            <span className="truncate">{office.address}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold text-xl mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Open Live Account', path: '/accounts', Icon: Rocket, color: 'text-red-accent', bg: 'bg-red-accent/10' },
                    { label: 'Open Demo Account', path: '/accounts', Icon: TrendingUp, color: 'text-green-accent', bg: 'bg-green-accent/10' },
                    { label: 'View Pricing', path: '/pricing', Icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Education Center', path: '/education', Icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                  ].map((item) => {
                    const Icon = item.Icon
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        className="flex items-center gap-3 p-3 rounded-xl bg-bull-600 border border-white/5 hover:border-gold-500/20 hover:bg-gold-500/5 transition-all duration-300 group"
                      >
                        <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon size={16} className={item.color} strokeWidth={2} />
                        </div>
                        <span className="text-gray-300 text-xs font-medium group-hover:text-gold-400 transition-colors">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-bull-900">
        <div className="section-container">
          <SectionHeader
            badge="FAQ"
            title="Common Questions"
            highlight="Common Questions"
            subtitle="Quick answers to the most frequently asked questions."
          />

          <div className="max-w-3xl mx-auto mt-12 space-y-3">
            {faqItems.map((item, i) => (
              <AnimatedSection key={i} animation="slideUp" delay={i * 0.08}>
                <div
                  className={`border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    openFaq === i ? 'border-gold-500/30 bg-gold-500/5' : 'border-white/5 bg-bull-600 hover:border-white/10'
                  }`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="flex items-center justify-between p-5">
                    <h4 className="text-white font-medium text-sm pr-4">{item.q}</h4>
                    <span className={`flex-shrink-0 text-lg transition-transform duration-300 ${openFaq === i ? 'rotate-45 text-gold-400' : 'text-gray-400'}`}>
                      +
                    </span>
                  </div>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}

export default Contact
