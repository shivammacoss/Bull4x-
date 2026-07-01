'use client'

// Bull4X "Cyber-Samurai" marketing home — ported from the standalone Vite
// landing (public/landingPage/frontend/src/bull4xLanding) into the Next.js
// trader app. Renders the fixed Navbar, the stacked Home sections, and Footer
// on a dark canvas. CSS is imported here so it only loads on this route.

import './bull4x-landing.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'

export default function Bull4xHome() {
  return (
    <div
      className="b4x-landing font-sans"
      style={{ background: '#05070a', color: '#e2e8f0', minHeight: '100vh', overflowX: 'hidden' }}
    >
      <Navbar />
      <Home />
      <Footer />
    </div>
  )
}
