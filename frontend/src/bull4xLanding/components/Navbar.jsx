// ============================================
// BULL4X - Navbar — Cyber-Samurai
// ============================================

import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMenu, FiX, FiTrendingUp, FiBarChart2, FiMonitor,
  FiUser, FiDollarSign, FiTool, FiBook, FiInfo, FiMail
} from 'react-icons/fi'

const navItems = [
  { label: 'Home',           path: '/',               icon: <FiTrendingUp /> },
  { label: 'Trading',        path: '/trading',         icon: <FiBarChart2 /> },
  { label: 'Platforms',      path: '/platforms',       icon: <FiMonitor /> },
  { label: 'Accounts',       path: '/accounts',        icon: <FiUser /> },
  { label: 'Education',      path: '/education',       icon: <FiBook /> },
  { label: 'About',          path: '/about',           icon: <FiInfo /> },
  { label: 'Contact',        path: '/contact',         icon: <FiMail /> },
]

function Navbar() {
  const [isOpen, setIsOpen]   = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const menuRef  = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setIsOpen(false) }, [location])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      ref={menuRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0d1117]/85 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-18">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center flex-shrink-0 group">
            <img
              src="/bull4x-logo.png"
              alt="BULL4X"
              className="h-12 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(217,161,54,0.6)]"
            />
          </Link>

          {/* ── Desktop Navigation ── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `animated-underline px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#D9A136] bg-[#D9A136]/5'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* ── CTA + Mobile Toggle ── */}
          <div className="flex items-center gap-3">
            <Link
              to="/user/login"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-slate-300 font-medium text-sm rounded-lg border border-white/15 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200"
            >
              Client Login
            </Link>
            <Link
              to="/accounts"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-white font-semibold text-sm rounded-lg transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: '#D9A136',
                boxShadow: '0 0 16px rgba(217,161,54,0.35)',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(217,161,54,0.6), 0 0 50px rgba(217,161,54,0.2)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(217,161,54,0.35)'}
            >
              <FiUser size={13} />
              Open Account
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <FiX size={18} />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <FiMenu size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden border-t border-white/5"
            style={{ background: 'rgba(13,17,23,0.97)', backdropFilter: 'blur(20px)' }}
          >
            <div className="section-container py-4 space-y-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                >
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-[#D9A136] bg-[#D9A136]/10 border border-[#D9A136]/20'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <span className="text-[#D9A136]">{item.icon}</span>
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}

              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="pt-3 border-t border-white/5 space-y-2"
              >
                <Link
                  to="/user/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-slate-200 font-medium text-sm rounded-lg border border-white/15 hover:bg-white/5 transition-all duration-200"
                >
                  Client Login
                </Link>
                <Link
                  to="/accounts"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-white font-semibold text-sm rounded-lg transition-all duration-200"
                  style={{ background: '#D9A136', boxShadow: '0 0 16px rgba(217,161,54,0.3)' }}
                >
                  <FiUser size={14} />
                  Open Live Account
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
