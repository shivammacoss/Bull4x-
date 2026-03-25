import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Hero, Navigation, About, Funding, Contact, Footer } from '../components/home'

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Funding />
      <Contact />
      <Footer />
    </>
  )
}

function WebsiteLandingPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <Navigation scrollY={scrollY} />
      <HomePage />
    </div>
  )
}

export default WebsiteLandingPage
