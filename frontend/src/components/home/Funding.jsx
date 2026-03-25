import { useNavigate } from 'react-router-dom'
import { ArrowRight, DollarSign, TrendingUp, Shield } from 'lucide-react'

const fundingPlans = [
  { name: 'Starter', amount: '$5K', profit: '80%', href: '/funding/starter' },
  { name: 'Growth', amount: '$10K', profit: '80%', href: '/funding/growth' },
  { name: 'Pro', amount: '$25K', profit: '85%', href: '/funding/pro' },
  { name: 'Elite', amount: '$50K', profit: '85%', href: '/funding/elite' },
  { name: 'Prime', amount: '$100K', profit: '90%', href: '/funding/prime' },
]

export default function Funding() {
  const navigate = useNavigate()

  return (
    <section id="funding" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Get <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Funded</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Prove your trading skills and get funded with up to $100,000. Keep up to 90% of your profits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {fundingPlans.map((plan, index) => (
            <div
              key={index}
              onClick={() => navigate(plan.href)}
              className="p-6 bg-gray-800/50 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group text-center"
            >
              <div className="text-2xl font-bold text-white mb-1">{plan.amount}</div>
              <div className="text-sm text-white/60 mb-3">{plan.name} Fund</div>
              <div className="text-sm text-green-400">{plan.profit} Profit Split</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl">
            <DollarSign className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-white font-semibold">No Risk Capital</div>
              <div className="text-white/60 text-sm">Trade with our money</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-white font-semibold">Scale Up to $1M</div>
              <div className="text-white/60 text-sm">Grow your account</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl">
            <Shield className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-white font-semibold">Instant Payouts</div>
              <div className="text-white/60 text-sm">Get paid weekly</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/buy-challenge')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 inline-flex items-center gap-2 group"
          >
            Start Your Challenge
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  )
}
