import { useNavigate } from 'react-router-dom'
import { X, ShieldAlert, ArrowRight, FileCheck } from 'lucide-react'

const ACTION_COPY = {
  deposit:        { verb: 'deposit funds', emphasis: 'Deposit Funds' },
  withdraw:       { verb: 'withdraw funds', emphasis: 'Withdraw Funds' },
  becomeMaster:   { verb: 'become a copy-trade master', emphasis: 'Become a Master' },
  followMaster:   { verb: 'follow a master trader', emphasis: 'Follow a Master' },
  accessApp:      { verb: 'access the trading dashboard', emphasis: 'Access the Platform' },
}

const KycGateModal = ({ open, onClose, action = 'deposit', kycStatus, forced = false }) => {
  const navigate = useNavigate()
  if (!open) return null

  const { verb, emphasis } = ACTION_COPY[action] || ACTION_COPY.deposit

  const isPending  = kycStatus === 'pending'
  const isRejected = kycStatus === 'rejected'

  const title = isPending
    ? 'KYC Under Review'
    : isRejected
      ? 'KYC Was Rejected'
      : 'Complete Your KYC First'

  const message = isPending
    ? `Your KYC is currently under review. You won't be able to ${verb} until it's approved.`
    : isRejected
      ? `Your previous KYC submission was rejected. Please resubmit to ${verb}.`
      : `To ${emphasis.toLowerCase()}, you need to verify your identity first. This is a one-time process to keep your funds safe and comply with regulations.`

  const ctaLabel = isPending
    ? 'View KYC Status'
    : isRejected
      ? 'Resubmit KYC'
      : 'Complete KYC Now'

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={forced ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-[#0d1117] to-black border border-[#D9A136]/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold glow accent */}
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[#D9A136]/15 blur-3xl pointer-events-none" />

        {/* Close — hidden in forced mode */}
        {!forced && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={16} className="text-gray-300" />
          </button>
        )}

        <div className="relative px-6 pt-8 pb-6 text-center">
          {/* Icon */}
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full bg-[#D9A136]/15 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#D9A136]/30 to-[#F0C96F]/10 border border-[#D9A136]/40 flex items-center justify-center">
              <ShieldAlert size={28} className="text-[#F0C96F]" strokeWidth={2} />
            </div>
          </div>

          {/* Title + message */}
          <h2 className="text-white text-xl font-bold tracking-tight mb-2">{title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">{message}</p>

          {/* What you get */}
          {!isPending && (
            <div className="text-left bg-white/[0.03] border border-[#D9A136]/15 rounded-xl p-4 mb-6 space-y-2">
              {[
                'Deposit & withdraw funds securely',
                'Become a copy-trade master & earn commissions',
                'Follow professional traders',
                'Higher account limits',
              ].map((perk) => (
                <div key={perk} className="flex items-start gap-2.5">
                  <FileCheck size={14} className="text-[#D9A136] mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-xs">{perk}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { onClose(); navigate('/profile') }}
              className="group w-full bg-gradient-to-r from-[#D9A136] to-[#F0C96F] hover:from-[#F0C96F] hover:to-[#D9A136] text-black font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-[#D9A136]/25 hover:shadow-[#D9A136]/40 flex items-center justify-center gap-2"
            >
              {forced ? 'OK, Take Me to KYC' : ctaLabel}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            {!forced && (
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                Maybe later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default KycGateModal
