import { Link } from 'react-router-dom'
import { Target, DollarSign, TrendingUp, Shield, Award, BarChart2, ArrowRight } from 'lucide-react'
import Button from '../components/Button'
import ScrollReveal, { ScrollRevealGroup, ScrollRevealItem } from '../components/animations/ScrollReveal'

const tiers = [
  {
    name: 'Bronze',
    capital: '$1 / Lot',
    target: '0 – 50 lots',
    maxLoss: 'Up to $50',
    dailyLoss: 'Daily',
    duration: '24h Payout',
    fee: 'Free',
    split: 'Standard',
    highlight: false,
  },
  {
    name: 'Silver',
    capital: '$2 / Lot',
    target: '51 – 200 lots',
    maxLoss: 'Up to $400',
    dailyLoss: 'Daily',
    duration: '24h Payout',
    fee: 'Free',
    split: 'Pro',
    highlight: true,
  },
  {
    name: 'Gold',
    capital: '$3 / Lot',
    target: '201 – 500 lots',
    maxLoss: 'Up to $1,500',
    dailyLoss: 'Daily',
    duration: '24h Payout',
    fee: 'Free',
    split: 'ECN',
    highlight: false,
  },
  {
    name: 'Platinum',
    capital: '$5 / Lot',
    target: '500+ lots',
    maxLoss: 'Unlimited',
    dailyLoss: 'Daily',
    duration: '24h Payout',
    fee: 'Free',
    split: 'VIP',
    highlight: false,
  },
]

const rules = [
  { icon: DollarSign, title: 'Cashback per Standard Lot', desc: 'Earn a fixed-rate rebate on every standard lot you close across forex, metals, indices, and crypto CFDs — credited to your live account daily.' },
  { icon: Shield,     title: 'No Strategy Restrictions',  desc: 'EAs, scalping, hedging, news trading, and copy trading are all fully eligible for cashback on every live account tier.' },
  { icon: BarChart2,  title: 'Real-Time Volume Tracking', desc: 'Monitor your monthly traded volume and rebate earnings live from your client portal — full transparency, every closed lot.' },
  { icon: Target,     title: 'Automatic Tier Upgrades',   desc: 'Cross a monthly volume threshold and your rebate tier upgrades automatically. Higher rebates apply from your very next trade.' },
  { icon: Award,      title: 'Loyalty Add-Ons',           desc: 'Active traders unlock seasonal deposit bonuses, swap-free upgrades, reduced spreads, and dedicated account-manager perks.' },
  { icon: TrendingUp, title: 'Withdraw Anytime',          desc: 'Rebates credit to your live wallet daily and can be withdrawn the same way you withdraw any trading profit — USD, EUR, GBP, or USDT.' },
]

const Rewards = () => {
  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding hero-banner">
        <div className="container-custom text-center">
          <ScrollReveal variant="fadeUp">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Volume Cashback Programme
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              Earn automatic cashback on every standard lot you trade at Bull4x. Higher monthly volume unlocks bigger rebates — credited to your live account every 24 hours and withdrawable on demand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/accounts/standard"><Button variant="primary">Open Live Account</Button></Link>
              <Link to="/accounts/demo"><Button variant="ghost">Try Free Demo</Button></Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding bg-primary-secondary">
        <div className="container-custom">
          <ScrollReveal variant="fadeUp">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">Choose Your Cashback Tier</h2>
            <p className="text-text-secondary text-center max-w-2xl mx-auto mb-12">Your rebate rate scales automatically with your monthly traded volume — no opt-in, no claim form, no minimum stay.</p>
          </ScrollReveal>
          <ScrollRevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((c) => (
              <ScrollRevealItem key={c.name}>
                <div className={`rounded-lg p-6 h-full flex flex-col ${c.highlight ? 'bg-primary-accent/[0.06] border border-primary-accent/30' : 'glass-card'}`}>
                  {c.highlight && (
                    <div className="text-center mb-4">
                      <span className="bg-primary-accent text-white text-xs font-bold px-3 py-1 rounded uppercase">Most Popular</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-1">{c.name}</h3>
                  <div className="text-3xl font-bold gradient-text mb-4">{c.capital}</div>

                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Monthly Volume</span><span className="text-white">{c.target}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Estimated Monthly Rebate</span><span className="text-white">{c.maxLoss}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Payout Frequency</span><span className="text-white">{c.dailyLoss}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Crediting Speed</span><span className="text-white">{c.duration}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Best on Account</span><span className="text-white font-semibold">{c.split}</span></div>
                  </div>

                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold text-white">{c.fee}</span>
                    <span className="text-text-secondary text-sm ml-1">to join</span>
                  </div>
                  <Link to="/accounts/standard" className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-all ${c.highlight ? 'bg-white text-primary-accent hover:bg-white/90' : 'border border-primary-accent/30 text-primary-accent hover:bg-primary-accent/10'}`}>
                    Open Account
                  </Link>
                </div>
              </ScrollRevealItem>
            ))}
          </ScrollRevealGroup>
        </div>
      </section>

      <section className="section-padding bg-primary-bg">
        <div className="container-custom">
          <ScrollReveal variant="fadeUp">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Programme Highlights</h2>
          </ScrollReveal>
          <ScrollRevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((r, i) => (
              <ScrollRevealItem key={i}>
                <div className="glass-card p-6 h-full">
                  <div className="feature-icon bg-primary-purple/10 text-primary-purple mb-4">
                    <r.icon size={20} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{r.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{r.desc}</p>
                </div>
              </ScrollRevealItem>
            ))}
          </ScrollRevealGroup>
        </div>
      </section>

      <section className="section-padding bg-primary-secondary">
        <div className="container-custom text-center">
          <ScrollReveal variant="fadeUp">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          </ScrollReveal>
          <ScrollRevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Open & Fund Your Live Account', desc: 'Register a Standard, Pro, or ECN account, complete KYC, and make your first deposit from $100. Cashback enrolment is automatic.' },
              { step: '2', title: 'Trade Any Instrument',         desc: 'Place trades on 60+ instruments — forex, metals, indices, and crypto CFDs. Every closed standard lot is automatically counted toward your monthly tier.' },
              { step: '3', title: 'Receive Daily Cashback',        desc: 'Rebates are credited to your wallet every 24 hours in your account base currency. Withdraw anytime — no lock-up, no minimum balance.' },
            ].map((s) => (
              <ScrollRevealItem key={s.step}>
                <div className="glass-card p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-accent/10 text-primary-accent font-bold text-lg flex items-center justify-center mx-auto mb-4">{s.step}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-text-secondary text-sm">{s.desc}</p>
                </div>
              </ScrollRevealItem>
            ))}
          </ScrollRevealGroup>

          <ScrollReveal variant="fadeUp">
            <div className="mt-12">
              <Link to="/accounts/standard" className="inline-flex items-center gap-2 text-primary-accent font-semibold hover:gap-3 transition-all">
                Open a Live Account <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}

export default Rewards
