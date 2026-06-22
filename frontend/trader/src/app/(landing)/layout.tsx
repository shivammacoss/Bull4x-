'use client'

import { useEffect } from 'react'
import '@/landing-new/landing.css'
import { PopupProvider } from '@/landing/components/PopupContext'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  /* Override trader-app theme for landing pages (light) */
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', 'light')
    html.style.backgroundColor = '#FFFFFF'
    html.style.color = '#0D0F1A'
    return () => {
      html.setAttribute('data-theme', 'light')
      html.style.backgroundColor = '#F2EFE9'
      html.style.color = '#000000'
    }
  }, [])

  return <PopupProvider>{children}</PopupProvider>
}
