import { useEffect, useState } from 'react'
import { 
  Hero, 
  Navigation, 
  Services, 
  Instruments, 
  FundingPlans, 
  Testimonials, 
  Contact, 
  Footer,
  WaveSeparator
} from '../components/home'

function HomePage() {
  return (
    <>
      <Hero />
      <WaveSeparator variant="trading" color="#0a0f1a" nextColor="#0a0f1a" />
      <Services />
      <WaveSeparator variant="smooth" color="#0a0f1a" nextColor="#080c14" />
      <Instruments />
      <WaveSeparator variant="crypto" color="#080c14" nextColor="#0a0f1a" flip />
      <FundingPlans />
      <WaveSeparator variant="sharp" color="#0a0f1a" nextColor="#080c14" />
      <Testimonials />
      <WaveSeparator variant="trading" color="#080c14" nextColor="#0a0f1a" flip />
      <Contact />
      <WaveSeparator variant="smooth" color="#0a0f1a" nextColor="#060a10" />
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
    <div className="min-h-screen bg-[#0a0f1a] text-white overflow-x-hidden">
      <Navigation scrollY={scrollY} />
      <HomePage />
    </div>
  )
}

export default WebsiteLandingPage
