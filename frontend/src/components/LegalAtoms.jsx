// Shared atoms for BULL4X legal pages — editorial / premium redesign.
//
// Standalone pages (Privacy, Terms, Cookie): <LegalPageShell standalone>
// Marketing-wrapped pages (Risk, AML):       <LegalPageShell>  (no top bar; Bull4xWebsiteLayout provides nav)

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useSpring, useMotionValueEvent } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, ArrowUp, ChevronRight,
  Clock, Shield, Mail, Link2, Printer,
  FileText, AlertTriangle, Lock, Package,
} from 'lucide-react'

export const GOLD = '#D9A136'
export const GOLD_LIGHT = '#F0C96F'
export const INK = '#0a0d12'      // deeper bg
export const INK_RAISED = '#11161e' // card surface
export const INK_HI = '#161c26'    // hover/raised

// All 5 legal docs — used for the cross-link bar
const ALL_LEGAL_DOCS = [
  { label: 'Privacy Policy',     path: '/privacy-policy',          icon: Lock },
  { label: 'Terms of Service',   path: '/terms-of-service',        icon: FileText },
  { label: 'Cookie Policy',      path: '/cookie-policy',           icon: Package },
  { label: 'Risk Disclosure',    path: '/legal/risk-disclosure',   icon: AlertTriangle },
  { label: 'AML Policy',         path: '/legal/aml-policy',        icon: Shield },
]

// =================================================================
// Reading progress bar (xed top)
// =================================================================
const ReadingProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, mass: 0.4 })
  return (
    <motion.div
      className="xed top-0 left-0 right-0 z-50 h-[3px] origin-left"
      style={{
        scaleX,
        background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT}, ${GOLD})`,
        boxShadow: `0 0 12px ${GOLD}88`,
      }}
    />
  )
}

// =================================================================
// Animated grid background (subtle, xed)
// =================================================================
const GridBackdrop = () => (
  <div className="pointer-events-none xed inset-0 z-0 overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),' +
          'linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
        maskImage: 'radial-gradient(ellipse at top, black, transparent 70%)',
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        background:
          `radial-gradient(900px 600px at 12% -10%, ${GOLD}1a, transparent 60%),` +
          `radial-gradient(700px 500px at 100% 10%, ${GOLD}0e, transparent 55%),` +
          `radial-gradient(600px 500px at 80% 100%, ${GOLD}08, transparent 60%)`,
      }}
    />
  </div>
)

// =================================================================
// Floating side toolbar (right side, desktop)
// =================================================================
const FloatingToolbar = () => {
  const [show, setShow] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setShow(y > 400))

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : 12 }}
      transition={{ duration: 0.25 }}
      className="hidden xl:flex xed right-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-2"
      style={{ pointerEvents: show ? 'auto' : 'none' }}
    >
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top"
        className="group flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md hover:border-[#D9A136]/50 transition-all"
      >
        <ArrowUp size={16} className="text-white/70 group-hover:text-[#D9A136]" />
      </button>
      <button
        onClick={() => window.print()}
        title="Print this document"
        className="group flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md hover:border-[#D9A136]/50 transition-all"
      >
        <Printer size={16} className="text-white/70 group-hover:text-[#D9A136]" />
      </button>
    </motion.div>
  )
}

// =================================================================
// Page Shell
// =================================================================
export const LegalPageShell = ({ standalone = false, children }) => (
  <div
    className="relative min-h-screen text-white"
    style={{
      background: INK,
      fontFamily: "'Inter', sans-serif",
    }}
  >
    <ReadingProgress />
    <GridBackdrop />
    <FloatingToolbar />

    {standalone && (
      <header className="relative z-20 border-b border-white/5 backdrop-blur-xl bg-black/30">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hidden sm:block text-xs text-white/40 hover:text-white/80 transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hidden sm:block text-xs text-white/40 hover:text-white/80 transition-colors">Terms</Link>
            <div
              className="text-sm font-bold tracking-[0.3em]"
              style={{ color: GOLD, fontFamily: "'Michroma', sans-serif" }}
            >
              BULL4X
            </div>
          </div>
        </div>
      </header>
    )}

    <div className="relative z-10">{children}</div>

    {/* Cross-link bar (always shown) */}
    <CrossLinkBar />

    {standalone && (
      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-6 pb-10 mt-2 border-t border-white/5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} BULL4X. All rights reserved.
      </div>
    )}

    {/* Print-only styles */}
    <style>{`
      @media print {
        .no-print { display: none !important; }
        body, html { background: white !important; color: black !important; }
      }
    `}</style>
  </div>
)

// =================================================================
// Editorial Hero
// =================================================================
const READ_TIME_WPM = 220

export const LegalHero = ({
  icon: Icon,
  badge,
  title,
  highlight,
  subtitle,
  updated,
  effective = 'Effective immediately',
  docNumber, // optional "01 / 05"
}) => {
  // Rough read-time estimate from DOM length — not perfect but feels alive
  const [readMin, setReadMin] = useState(null)
  useEffect(() => {
    const t = setTimeout(() => {
      const main = document.querySelector('main[data-legal-body]')
      if (!main) return
      const words = (main.innerText || '').trim().split(/\s+/).length
      setReadMin(Math.max(2, Math.round(words / READ_TIME_WPM)))
    }, 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative z-10 overflow-hidden">
      {/* Decorative side accents */}
      <div className="hidden lg:block absolute top-24 left-8 w-px h-40" style={{ background: `linear-gradient(180deg, transparent, ${GOLD}88, transparent)` }} />
      <div className="hidden lg:block absolute top-40 right-8 w-px h-32" style={{ background: `linear-gradient(180deg, transparent, ${GOLD}55, transparent)` }} />

      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          {/* Eyebrow row */}
          <div className="flex flex-wrap items-center gap-3 mb-7">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
              style={{
                background: `${GOLD}15`,
                border: `1px solid ${GOLD}40`,
                boxShadow: `0 0 24px ${GOLD}1f`,
              }}
            >
              {Icon && <Icon size={12} style={{ color: GOLD }} />}
              <span
                className="text-[10.5px] font-bold tracking-[0.25em] uppercase"
                style={{ color: GOLD }}
              >
                {badge}
              </span>
            </div>
            {docNumber && (
              <>
                <span className="text-white/20 text-sm">·</span>
                <span
                  className="text-[10.5px] font-bold tracking-[0.25em] uppercase text-white/40"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {docNumber}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1
            className="text-[44px] leading-[0.95] sm:text-6xl md:text-[88px] md:leading-[0.92] font-bold text-white tracking-tight mb-6"
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.035em' }}
          >
            {title}
            {highlight && (
              <>
                <br className="hidden md:block" />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 60%, ${GOLD} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {' '}{highlight}
                </span>
              </>
            )}
          </h1>

          {subtitle && (
            <p className="text-white/60 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
              {subtitle}
            </p>
          )}

          {/* Stat strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-10 pt-8 border-t border-white/5">
            {updated && (
              <StatChip icon={Clock} label="LAST UPDATED" value={updated} />
            )}
            {readMin && (
              <StatChip icon={FileText} label="READING TIME" value={`${readMin} min`} />
            )}
            {effective && (
              <StatChip icon={Shield} label="STATUS" value={effective} />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const StatChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div
      className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
      style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}22` }}
    >
      <Icon size={14} style={{ color: GOLD }} />
    </div>
    <div>
      <div className="text-[9.5px] font-bold tracking-[0.2em] text-white/35 mb-0.5">
        {label}
      </div>
      <div className="text-sm font-semibold text-white/90">{value}</div>
    </div>
  </div>
)

// =================================================================
// Sticky TOC with scroll-spy + active ll animation
// =================================================================
export const TocSidebar = ({ sections }) => {
  const [activeId, setActiveId] = useState(sections?.[0]?.id ?? null)

  useEffect(() => {
    if (!sections?.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .lter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top
          )
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [sections])

  if (!sections?.length) return null

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-8">
        <div className="flex items-center gap-2 mb-5 px-1">
          <div className="w-6 h-px" style={{ background: GOLD }} />
          <div
            className="text-[10px] font-bold tracking-[0.25em] uppercase"
            style={{ color: GOLD }}
          >
            Contents
          </div>
        </div>

        <nav className="space-y-0.5">
          {sections.map((s) => {
            const active = activeId === s.id
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all overflow-hidden group"
                style={{
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                  background: active ? `${GOLD}10` : 'transparent',
                }}
              >
                {/* Active indicator bar */}
                {active && (
                  <motion.span
                    layoutId="toc-active"
                    className="absolute left-0 top-0 bottom-0 w-[2px]"
                    style={{ background: GOLD, boxShadow: `0 0 10px ${GOLD}` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span
                  className="text-[10px] font-bold tracking-[0.1em] tabular-nums"
                  style={{
                    color: active ? GOLD : 'rgba(255,255,255,0.25)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {s.no}
                </span>
                <span className="truncate flex-1">{s.title}</span>
                <ChevronRight
                  size={11}
                  className={`flex-shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                  style={{ color: GOLD }}
                />
              </a>
            )
          })}
        </nav>

        {/* Print button under TOC */}
        <button
          onClick={() => window.print()}
          className="mt-6 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border border-white/10 hover:border-[#D9A136]/40 text-white/60 hover:text-white transition-all"
        >
          <Printer size={13} />
          Print Document
        </button>
      </div>
    </aside>
  )
}

// =================================================================
// Section Card — editorial style
// =================================================================
export const SectionCard = ({ id, no, icon: Icon, title, children, delay = 0 }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    className="group relative scroll-mt-24 rounded-2xl overflow-hidden transition-all duration-500"
    style={{
      background:
        `linear-gradient(180deg, ${INK_RAISED} 0%, ${INK} 100%)`,
      border: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    {/* Top accent line */}
    <div
      className="absolute inset-x-0 top-0 h-px opacity-60 group-hover:opacity-100 transition-opacity"
      style={{ background: `linear-gradient(90deg, transparent, ${GOLD}88, transparent)` }}
    />
    {/* Giant background number */}
    {no && (
      <div
        aria-hidden
        className="absolute -right-4 -top-8 text-[180px] md:text-[220px] font-black leading-none select-none pointer-events-none opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: GOLD,
        }}
      >
        {no}
      </div>
    )}
    {/* Hover glow */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{
        background: `radial-gradient(600px 200px at 50% 0%, ${GOLD}14, transparent 70%)`,
      }}
    />

    <div className="relative p-7 md:p-10">
      <div className="flex items-start gap-5 mb-6">
        {Icon && (
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${GOLD}28, ${GOLD}08)`,
              border: `1px solid ${GOLD}40`,
              boxShadow: `0 6px 24px -10px ${GOLD}66`,
            }}
          >
            <Icon size={20} style={{ color: GOLD }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {no && (
            <div
              className="flex items-center gap-2 mb-1.5"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span
                className="text-[10px] font-bold tracking-[0.15em] tabular-nums"
                style={{ color: GOLD }}
              >
                §{no}
              </span>
              <span className="w-8 h-px" style={{ background: `${GOLD}55` }} />
            </div>
          )}
          <h2
            className="text-[22px] md:text-3xl font-bold text-white leading-[1.15]"
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.015em' }}
          >
            {title}
          </h2>
        </div>
      </div>
      <div className="text-white/75 leading-[1.75] text-[15.5px] space-y-5">
        {children}
      </div>
    </div>
  </motion.section>
)

// =================================================================
// Gold bullet
// =================================================================
export const Bullet = ({ children, tone = 'gold' }) => (
  <li className="flex items-start gap-3.5 group/li">
    <span
      className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all group-hover/li:scale-150"
      style={{
        background: tone === 'gold' ? GOLD : '#64748b',
        boxShadow: tone === 'gold' ? `0 0 8px ${GOLD}66` : 'none',
      }}
    />
    <span className="flex-1">{children}</span>
  </li>
)

// =================================================================
// Highlight banner — premium pull-quote look
// =================================================================
export const HighlightBanner = ({ icon: Icon, title, children, tone = 'gold' }) => {
  const accent = tone === 'gold' ? GOLD : '#ef4444'
  const accentLight = tone === 'gold' ? GOLD_LIGHT : '#fca5a5'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl p-7 md:p-8 overflow-hidden"
      style={{
        background:
          `linear-gradient(135deg, ${accent}1c 0%, ${accent}06 40%, transparent 80%), ${INK_RAISED}`,
        border: `1px solid ${accent}44`,
        boxShadow: `0 20px 60px -30px ${accent}55, inset 0 1px 0 ${accent}22`,
      }}
    >
      {/* Decorative quote mark */}
      <div
        aria-hidden
        className="absolute -top-4 -right-2 text-[140px] font-black leading-none select-none pointer-events-none opacity-[0.06]"
        style={{ color: accent, fontFamily: "'Outfit', sans-serif" }}
      >
        "
      </div>
      <div className="relative flex items-start gap-4 md:gap-5">
        {Icon && (
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accentLight})`,
              boxShadow: `0 8px 24px -8px ${accent}88`,
            }}
          >
            <Icon size={22} className="text-[#0a0d12]" />
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h3
              className="text-white font-bold text-lg md:text-xl mb-2.5"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {title}
            </h3>
          )}
          <div className="text-white/80 text-[15.5px] leading-[1.7]">{children}</div>
        </div>
      </div>
    </motion.div>
  )
}

// =================================================================
// Feature grid — premium cards with hover lift
// =================================================================
export const FeatureGrid = ({ items }) => (
  <div className="grid sm:grid-cols-2 gap-3.5">
    {items.map((it, i) => (
      <motion.div
        key={it.title || i}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -3 }}
        className="group/card relative p-5 rounded-xl overflow-hidden cursor-default transition-all"
        style={{
          background: INK,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(400px 150px at 50% 100%, ${GOLD}14, transparent 70%)`,
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
            />
            <h4 className="text-white font-semibold text-[13.5px] tracking-wide">{it.title}</h4>
          </div>
          <p className="text-white/55 text-[13.5px] leading-relaxed">{it.desc}</p>
        </div>
        {/* Border highlight on hover */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none"
          style={{ border: `1px solid ${GOLD}40` }}
        />
      </motion.div>
    ))}
  </div>
)

// =================================================================
// Flag list — for red-flag style indicators
// =================================================================
export const FlagList = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
    {items.map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: i * 0.04 }}
        className="flex items-start gap-3 p-4 rounded-xl transition-all hover:border-[#D9A136]/30"
        style={{
          background: INK,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: `${GOLD}1f`,
            border: `1px solid ${GOLD}55`,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: GOLD, boxShadow: `0 0 6px ${GOLD}` }}
          />
        </div>
        <span className="text-white/75 text-sm leading-relaxed">{item}</span>
      </motion.div>
    ))}
  </div>
)

// =================================================================
// Premium Contact Card
// =================================================================
export const ContactCard = ({
  sectionNo,
  title = 'Get in touch',
  description = 'If you have any questions or concerns, our team is here to help.',
  email = 'support@bull4x.com',
  website = 'bull4x.com',
  primaryLink = '/',
  primaryLabel = 'Return to Home',
  secondaryLink,
  secondaryLabel,
}) => (
  <motion.section
    id="contact"
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.55 }}
    className="relative scroll-mt-24 rounded-3xl overflow-hidden"
    style={{
      background: `linear-gradient(135deg, ${GOLD}20 0%, ${GOLD}06 40%, transparent 70%), ${INK_RAISED}`,
      border: `1px solid ${GOLD}55`,
      boxShadow: `0 40px 80px -40px ${GOLD}66, inset 0 1px 0 ${GOLD}33`,
    }}
  >
    {/* Decorative glow blobs */}
    <div
      aria-hidden
      className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-30 pointer-events-none"
      style={{ background: `radial-gradient(closest-side, ${GOLD}, transparent)` }}
    />
    <div
      aria-hidden
      className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full opacity-20 pointer-events-none"
      style={{ background: `radial-gradient(closest-side, ${GOLD_LIGHT}, transparent)` }}
    />

    <div className="relative p-8 md:p-12">
      <div className="grid md:grid-cols-[1fr_auto] gap-8 items-end">
        <div>
          {sectionNo && (
            <div
              className="inline-flex items-center gap-2 mb-3"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: GOLD }}>
                §{sectionNo}
              </span>
              <span className="w-10 h-px" style={{ background: `${GOLD}66` }} />
            </div>
          )}
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-4 leading-[1.05]"
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}
          >
            {title}
          </h2>
          <p className="text-white/65 max-w-xl text-base md:text-lg leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-9 max-w-2xl">
        <a
          href={`mailto:${email}`}
          className="group/c flex items-center gap-3.5 p-4 rounded-xl transition-all hover:-translate-y-0.5"
          style={{
            background: INK,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0 transition-all group-hover/c:scale-105"
            style={{
              background: `linear-gradient(135deg, ${GOLD}30, ${GOLD}10)`,
              border: `1px solid ${GOLD}55`,
            }}
          >
            <Mail size={18} style={{ color: GOLD }} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-0.5">
              EMAIL
            </div>
            <div className="text-white font-semibold truncate">{email}</div>
          </div>
        </a>
        <a
          href={`https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group/c flex items-center gap-3.5 p-4 rounded-xl transition-all hover:-translate-y-0.5"
          style={{
            background: INK,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="flex items-center justify-center w-11 h-11 rounded-lg flex-shrink-0 transition-all group-hover/c:scale-105"
            style={{
              background: `linear-gradient(135deg, ${GOLD}30, ${GOLD}10)`,
              border: `1px solid ${GOLD}55`,
            }}
          >
            <Link2 size={18} style={{ color: GOLD }} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold mb-0.5">
              WEBSITE
            </div>
            <div className="text-white font-semibold truncate">{website}</div>
          </div>
        </a>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to={primaryLink}
          className="group/btn inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
            color: '#0a0d12',
            boxShadow: `0 12px 32px -10px ${GOLD}99`,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.06em',
          }}
        >
          {primaryLabel}
          <ArrowRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
        {secondaryLink && secondaryLabel && (
          <Link
            to={secondaryLink}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all border border-white/15 hover:border-white/40 text-white hover:bg-white/[0.03]"
            style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  </motion.section>
)

// =================================================================
// Cross-link bar — shows all other legal docs at the bottom
// =================================================================
const CrossLinkBar = () => {
  // Highlight the doc currently being viewed by URL match
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  return (
    <section className="relative z-10 no-print">
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px" style={{ background: GOLD }} />
          <div
            className="text-[10px] font-bold tracking-[0.25em] uppercase"
            style={{ color: GOLD }}
          >
            Other Legal Documents
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {ALL_LEGAL_DOCS.map((doc) => {
            const active = pathname === doc.path
            const Icon = doc.icon
            return (
              <Link
                key={doc.path}
                to={doc.path}
                className="group flex items-center gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
                style={{
                  background: active ? `${GOLD}10` : INK_RAISED,
                  border: `1px solid ${active ? GOLD + '55' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0 transition-all group-hover:scale-105"
                  style={{
                    background: `${GOLD}15`,
                    border: `1px solid ${GOLD}33`,
                  }}
                >
                  <Icon size={14} style={{ color: GOLD }} />
                </div>
                <span className="text-[13px] font-semibold text-white/85 group-hover:text-white truncate">
                  {doc.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// =================================================================
// Body wrapper — keeps TOC + sections layout
// =================================================================
export const LegalBody = ({ sections, children }) => (
  <main
    data-legal-body
    className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pb-10"
  >
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">
      <TocSidebar sections={sections} />
      <div className="space-y-7">{children}</div>
    </div>
  </main>
)
