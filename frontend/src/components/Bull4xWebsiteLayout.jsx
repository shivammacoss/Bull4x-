import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../bull4xLanding/components/Navbar'
import Footer from '../bull4xLanding/components/Footer'

export default function Bull4xWebsiteLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return (
    <div className="bull4x-landing min-h-screen bg-bull-900 text-white flex flex-col overflow-x-hidden antialiased">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
