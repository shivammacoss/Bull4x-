'use client'

// Shared chrome for Bull4X landing sub-pages (Navbar + Footer + theme + CSS).
// Mirrors Bull4xHome so every marketing page shares one look & feel.

import './bull4x-landing.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function Bull4xShell({ children }) {
  return (
    <div
      className="b4x-landing font-sans"
      style={{ background: '#05070a', color: '#e2e8f0', minHeight: '100vh', overflowX: 'hidden' }}
    >
      <Navbar />
      <main className="pt-16 md:pt-18">{children}</main>
      <Footer />
    </div>
  )
}
