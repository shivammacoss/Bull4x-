import { Shield, TrendingUp, Users, Globe } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Secure Trading',
    description: 'Bank-grade security with advanced encryption to protect your funds and data.'
  },
  {
    icon: TrendingUp,
    title: 'Advanced Tools',
    description: 'Professional trading tools and real-time analytics for informed decisions.'
  },
  {
    icon: Users,
    title: 'Expert Support',
    description: '24/7 dedicated support team to assist you at every step of your journey.'
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Trade from anywhere with our mobile-friendly platform and global reach.'
  }
]

export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why Choose <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Unicap</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Experience the next generation of trading with our comprehensive platform designed for traders of all levels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-gray-800/50 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
