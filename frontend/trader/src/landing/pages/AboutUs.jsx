import { Link } from 'react-router-dom'
import { Users, Globe, Award, TrendingUp } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import StatBox from '../components/StatBox'
import ScrollReveal, { ScrollRevealGroup, ScrollRevealItem } from '../components/animations/ScrollReveal'

const AboutUs = () => {
  const team = [
    { name: 'John Mitchell', role: 'Chief Executive Officer', image: '👨‍💼' },
    { name: 'Sarah Chen', role: 'Chief Technology Officer', image: '👩‍💻' },
    { name: 'Michael Roberts', role: 'Chief Financial Officer', image: '👨‍💼' },
    { name: 'Emma Thompson', role: 'Head of Trading', image: '👩‍💼' }
  ]

  return (
    <div className="min-h-screen pt-20">
      <section className="section-padding hero-banner">
        <div className="container-custom text-center">
          <ScrollReveal variant="fadeUp">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Who We Are — Bull4x</h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              A globally regulated forex and CFD broker committed to transparency, innovation, and excellence.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding bg-primary-secondary">
        <div className="container-custom">
          <ScrollReveal variant="fadeUp">
            <div className="max-w-4xl mx-auto mb-16">
              <p className="text-lg text-text-secondary leading-relaxed mb-6">
                Bull4x is a globally regulated forex and CFD brokerage built by traders, for traders.
                Serving clients in 90+ countries with multi-currency wallets, tier-1 liquidity, and same-day
                withdrawals, we've built our reputation on transparency, fast execution, and clean payouts.
              </p>
              <p className="text-lg text-text-secondary leading-relaxed">
                Our mission is to give serious global forex traders the institutional execution and pricing
                they deserve — without the wide spreads, surprise fees, and opaque withdrawal queues that
                plague most retail brokers. Whether you're a beginner taking your first steps in trading or
                an algorithmic professional, Bull4x provides the tools, platforms, and expertise you need.
              </p>
            </div>
          </ScrollReveal>

          <ScrollRevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollRevealItem>
              <StatBox value="60+" label="Tradable Instruments" />
            </ScrollRevealItem>
            <ScrollRevealItem>
              <StatBox value="12,000+" label="Active Traders" />
            </ScrollRevealItem>
            <ScrollRevealItem>
              <StatBox value="90+" label="Countries Served" />
            </ScrollRevealItem>
            <ScrollRevealItem>
              <StatBox value="$5M+" label="Withdrawals Processed" />
            </ScrollRevealItem>
          </ScrollRevealGroup>
        </div>
      </section>

      <section className="section-padding bg-primary-bg">
        <div className="container-custom">
          <ScrollReveal variant="fadeUp">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              Our Mission & Vision
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <ScrollReveal variant="fadeLeft">
              <Card className="p-8">
                <Award className="w-12 h-12 text-primary-accent mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-text-secondary text-lg">
                  To empower traders worldwide with transparent, reliable, and innovative trading solutions that enable them to achieve their financial goals with confidence.
                </p>
              </Card>
            </ScrollReveal>
            <ScrollReveal variant="fadeRight">
              <Card className="p-8">
                <TrendingUp className="w-12 h-12 text-primary-accent mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                <p className="text-text-secondary text-lg">
                  To become the world's most trusted and technologically advanced trading platform, setting new standards for excellence in the financial services industry.
                </p>
              </Card>
            </ScrollReveal>
          </div>

          <ScrollRevealGroup className="grid md:grid-cols-3 gap-8">
            <ScrollRevealItem>
              <Card className="text-center">
                <Users className="w-16 h-16 text-primary-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Client-Focused</h3>
                <p className="text-text-secondary">
                  Your success is our priority. We're committed to providing exceptional service and support.
                </p>
              </Card>
            </ScrollRevealItem>
            <ScrollRevealItem>
              <Card className="text-center">
                <Globe className="w-16 h-16 text-primary-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Global Reach</h3>
                <p className="text-text-secondary">
                  Serving traders in 90+ countries with localised multilingual support and a multi-currency wallet.
                </p>
              </Card>
            </ScrollRevealItem>
            <ScrollRevealItem>
              <Card className="text-center">
                <Award className="w-16 h-16 text-primary-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Award-Winning</h3>
                <p className="text-text-secondary">
                  Recognized by industry leaders for excellence in trading technology and customer service.
                </p>
              </Card>
            </ScrollRevealItem>
          </ScrollRevealGroup>
        </div>
      </section>

      <section className="section-padding bg-primary-secondary">
        <div className="container-custom">
          <ScrollReveal variant="fadeUp">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              Leadership Team
            </h2>
          </ScrollReveal>
          <ScrollRevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <ScrollRevealItem key={index}>
                <Card className="text-center">
                  <div className="text-6xl mb-4">{member.image}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                  <p className="text-text-secondary">{member.role}</p>
                </Card>
              </ScrollRevealItem>
            ))}
          </ScrollRevealGroup>
        </div>
      </section>

      <section className="section-padding bg-gradient-hero">
        <div className="container-custom text-center">
          <ScrollReveal variant="fadeUp">
            <h2 className="text-4xl font-bold text-white mb-6">Join the Bull4x Family</h2>
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
              Experience the difference of trading with a broker that puts your success first.
            </p>
            <Link to="/accounts/demo">
              <Button variant="primary">Open Account Now</Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
