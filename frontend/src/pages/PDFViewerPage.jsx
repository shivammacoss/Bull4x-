import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

const pdfConfig = {
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    file: '/pdfs/GeneralTerms.pdf'
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    file: '/pdfs/PrivacyNotice.pdf'
  },
  'risk-disclosure': {
    title: 'Risk Disclosure',
    file: '/pdfs/RiksDisclaimer.pdf'
  },
  'ib-agreement': {
    title: 'IB Agreement',
    file: '/pdfs/IBagreement.pdf'
  },
  'funding-rules': {
    title: 'Funding Rules',
    file: '/pdfs/ChallengeT&C.pdf'
  }
}

export default function PDFViewerPage() {
  const { docType } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const config = pdfConfig[docType]

  useEffect(() => {
    if (!config) {
      setError(true)
      setLoading(false)
    }
  }, [config])

  // Disable right-click context menu on the iframe
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'IFRAME' || e.target.closest('.pdf-container')) {
        e.preventDefault()
      }
    }
    document.addEventListener('contextmenu', handleContextMenu)
    return () => document.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  if (error || !config) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Document Not Found</h1>
          <p className="text-gray-400 mb-6">The requested document could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#c9a227] text-black font-semibold rounded-lg hover:bg-[#b8922a] transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Header */}
      <header className="bg-[#0d1e36] border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Unicap" className="h-8" />
              <span className="text-white/50">|</span>
              <h1 className="text-white font-semibold">{config.title}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 pdf-container relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a1628]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/60">Loading document...</p>
            </div>
          </div>
        )}
        <iframe
          src={`${config.file}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
          className="w-full h-full"
          style={{ 
            minHeight: 'calc(100vh - 73px)',
            border: 'none'
          }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false)
            setError(true)
          }}
          title={config.title}
        />
        {/* Overlay to prevent right-click download on some browsers */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'transparent' }}
        />
      </div>

      {/* Footer Notice */}
      <div className="bg-[#0d1e36] border-t border-white/10 px-4 py-3">
        <p className="text-center text-white/40 text-sm">
          This document is for viewing purposes only. © 2026 BlueStone Exchange
        </p>
      </div>
    </div>
  )
}
