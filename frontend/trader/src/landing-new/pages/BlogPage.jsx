'use client'

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
const posts = [
  {
    slug: 'how-forex-brokers-work',
    category: 'Forex Basics',
    title: 'How Forex Brokers Work — A Complete Guide',
    excerpt: 'A forex broker gives you access to the interbank market through a regulated platform. They quote prices, route your orders, and earn revenue from the spread or commission. Understanding the model is the first step to choosing the right broker.',
    body: [
      'A forex broker is the bridge between a retail trader and the global currency market. They aggregate prices from tier-1 banks and liquidity providers, present those prices on a trading platform, and execute your orders when you click buy or sell. In return, the broker earns either from the spread (the difference between bid and ask) or from a commission charged per lot traded.',
      'There are two broad models. The market-maker model means the broker takes the other side of your trade and manages risk internally. The STP/ECN model means the broker passes your order directly to liquidity providers and never takes the opposing side. Most serious brokers today, including Bull4x, operate an STP or ECN model because it avoids conflict of interest and produces tighter pricing.',
      'For retail forex traders, the broker choice determines how much of your edge survives transaction costs. A trader making 30 pips per week loses most of that to a broker with 3-pip spreads. The same trader on an ECN account paying 0.0-pip spreads plus $3.5 per lot per side keeps far more of every move. Over a year, the difference is enormous.',
      'At Bull4x we run an STP/ECN execution model with tier-1 liquidity, sub-30ms order routing, and three account types — Standard, Pro, and ECN — so traders can pick the cost structure that fits their style. The same account opens access to 60+ instruments across forex, metals, indices, commodities, and crypto CFDs.',
    ],
    readTime: '8 min read',
    date: 'April 22, 2026',
  },
  {
    slug: 'risk-management-forex-traders',
    category: 'Risk Management',
    title: 'Best Risk Management Practices for Forex Traders',
    excerpt: 'The traders who survive and compound over years are not the ones with the best entries. They are the ones who never let a single trade ruin their account. Risk management is the only edge that compounds.',
    body: [
      'Every long-term trader will tell you the same thing: the goal is not to make the most money on a winning day. The goal is to lose the least on a losing day. Account survival is the prerequisite to everything else, and the traders who respect that survive long enough to compound.',
      'The first rule we recommend is the 1% rule. Never risk more than 1% of your account on a single trade. On a $10,000 live account, that is $100 of risk. If your stop-loss is 20 pips away on EUR/USD, that math forces a sensible position size — which is exactly the point.',
      'The second rule is the daily loss cap. Set a personal daily stop at 2-3% of equity. Hit it and the trading day ends. No exceptions. This margin of safety is what protects you from one bad day turning into a blown account, especially during high-volatility news events.',
      'The third — and least talked about — rule is correlation exposure. Never load up on positions that move together. Going long EUR/USD, GBP/USD, and AUD/USD at the same time is one big bet on USD weakness, not three diversified trades. One bad CPI print and all three move against you. Trade one clean idea well.',
      'Risk management is boring. That is the entire point. Boring traders compound. Exciting traders blow up.',
    ],
    readTime: '10 min read',
    date: 'April 18, 2026',
  },
  {
    slug: 'why-retail-traders-lose',
    category: 'Trader Psychology',
    title: 'Common Reasons Retail Forex Traders Lose Money',
    excerpt: 'After watching thousands of accounts, the same patterns keep showing up. Most losing traders do not lose because of bad strategy. They lose to impatience, oversizing, and ignoring the basics they already know.',
    body: [
      'We track aggregate client behaviour on the platform. After thousands of accounts the patterns are remarkably consistent. The vast majority of losing traders fail for one of five reasons — and almost none of them involve a bad strategy.',
      'Reason one: oversizing. A trader gets two losses in a row, doubles their position size to "make it back," and blows half their account on the third trade. This is the single most common failure mode. The fix is mechanical — your position size is locked at the start of the day, and you do not change it until the next session.',
      'Reason two: revenge trading. After a losing trade, the trader immediately enters another trade without setup confirmation. Their next move is emotional, not technical. The fix is to walk away from the screen for 30 minutes after any loss bigger than 1%.',
      'Reason three: ignoring session rhythms. The forex market has distinct character across the Sydney, Tokyo, London, and New York windows. Asia is range-bound, London opens with momentum, the London/NY overlap is the liquidity peak, and late NY drifts. Traders who try to scalp during the Asia lunch dead zone almost always overtrade and lose to spread and noise.',
      'Reason four: ignoring fees. Spreads, swaps, and commissions add up. A trader on a 3-pip Standard spread who takes 20 round trips a week is losing 60 pips to costs alone. The same trader on a 0.0-pip ECN account paying $7 round trip per lot keeps almost all of that.',
      'Reason five: chasing news events. NFP, CPI, FOMC, ECB — these are not days for aggressive directional bets. The volatility looks like opportunity but is actually a tax on traders who think they can predict the unpredictable. Stay flat or trade tiny size.',
    ],
    readTime: '11 min read',
    date: 'April 14, 2026',
  },
  {
    slug: 'how-withdrawals-work',
    category: 'Withdrawals',
    title: 'How Withdrawals Work at Bull4x',
    excerpt: 'You made profits on your live account. Now what? Here is exactly how withdrawals work — KYC, processing time, available rails, and how the money lands in your bank. No marketing fluff, just the actual process.',
    body: [
      'The withdrawal process at Bull4x begins the moment you click Withdraw inside your client dashboard. From there, the process is in four clear stages.',
      'Stage one is identity verification. We need a valid government-issued photo ID (passport or national ID) and proof of address (utility bill or bank statement, dated within the last three months). This usually takes 24 to 48 hours to verify. We do this digitally — no in-person meeting, no notarisation, nothing complicated. Once verified, your KYC stays on file for all future withdrawals.',
      'Stage two is the source-of-funds check. For your first withdrawal, you can only withdraw to the same payment method you used to deposit (AML rule). Profits in excess of your original deposit can then be sent to a verified bank account, e-wallet, or crypto wallet.',
      'Stage three is the rail selection. Withdraw to USD or EUR bank wire, GBP SEPA, Visa/Mastercard refund, Skrill, Neteller, or USDT on TRC20 or ERC20. Each rail shows its expected processing time inside the dashboard before you confirm.',
      'Stage four is the transfer. Most withdrawals are processed the same business day. Bank wires usually land within 24 to 48 hours after we initiate the transfer. Crypto withdrawals typically clear within minutes of network confirmation. To date, every single client withdrawal we have approved has been paid on time.',
      'There are zero internal withdrawal fees on Bull4x accounts. The only costs you may incur are network fees on crypto or intermediary bank fees on international wires — both of which are external to us and shown transparently in the dashboard before you confirm.',
    ],
    readTime: '9 min read',
    date: 'April 8, 2026',
  },
  {
    slug: 'psychology-consistent-traders',
    category: 'Trader Psychology',
    title: 'The Psychology of Consistent Traders',
    excerpt: 'Consistency in trading is 90% mental and 10% technical. The traders who survive and thrive are not the ones who found the perfect indicator. They are the ones who learned to manage themselves before managing the market.',
    body: [
      'In trading, consistency is rarer than profitability. Plenty of traders make money. Very few do it consistently for years. The difference is almost entirely psychological — the ability to follow your own rules even when your emotions are screaming at you to break them.',
      'The first habit of consistent traders is process orientation. They do not measure success by the P&L of a single day. They measure it by whether they followed their plan. A losing day where they followed their rules is a good day. A winning day where they got lucky is a warning sign. This sounds backwards until you have lived it for a year.',
      'The second habit is journaling. Every consistent trader we have worked with keeps a written record. Not a fancy spreadsheet — just notes after each session. What did I plan to trade? What did I actually trade? Why did I deviate? The patterns become obvious after 30 days of honest journaling.',
      'The third habit is detachment from individual trades. Consistent traders do not get attached to outcomes. They take the setup, place the trade, and accept whatever the market delivers. If they win, fine. If they lose, fine. The next trade gets the same treatment. This emotional flatness is not natural — it is built through deliberate practice.',
      'The fourth habit is acceptance of small wins. Consistent traders are happy with 0.5% to 1% per day on average. They do not chase 5% days. They know that compounding 0.5% over 200 trading days produces a return that no single big day can match — and it does so without the drawdown that big swings always bring.',
      'The hardest part is patience with the process. Most traders who fail in the first three months would have made it if they had stayed disciplined for six. The market does not reward speed. It rewards staying power.',
    ],
    readTime: '12 min read',
    date: 'April 2, 2026',
  },
  {
    slug: 'choosing-the-right-account',
    category: 'Strategy',
    title: 'Choosing the Right Forex Account — Standard, Pro, or ECN?',
    excerpt: 'Standard, Pro, and ECN accounts price the same trade very differently. Your style, frequency, and lot size determine which structure leaves the most money in your pocket. Here is an honest comparison.',
    body: [
      'Most retail traders eventually face this question: which account type fits my style? The three most common structures are Standard (wider spread, zero commission), Pro (mid-tier spread, zero commission), and ECN (raw spread, commission per lot). The right choice depends on your average trade size, frequency, and target hold time.',
      'Standard accounts work for beginners and low-frequency traders. Spreads start around 1.2 pips on EUR/USD, but you pay no commission, so the all-in cost is predictable. If you take a few trades a week with wider stops, the Standard account is the simplest path. Minimum deposit at Bull4x is $100.',
      'Pro accounts target the active discretionary trader. Spreads start around 0.6 pips with zero commission, plus a dedicated account manager. If you take 5-20 trades a week and your average target is 25-50 pips, Pro often produces the lowest effective cost without the complexity of commissions. Minimum deposit is $500.',
      'ECN accounts are built for scalpers, high-frequency strategies, and algorithmic systems. Spreads start at 0.0 pips on EUR/USD with a $3.5 per lot per side commission ($7 round trip). For a trader doing 30+ trades a week with tight 10-15 pip targets, the raw spread savings far outweigh the commission. Minimum deposit is $2,000.',
      'There is also a psychological layer. Standard accounts hide costs in the spread, which makes traders less price-sensitive but also less aware of what they are paying. ECN accounts show every cost line by line, which forces honesty about transaction expenses. Many traders graduate from Standard to ECN once they realise just how much spread was eating their edge.',
      'Whichever you choose, all three account types at Bull4x run on the same STP/ECN routing engine and the same tier-1 liquidity pool. You just choose how you want the broker to price its execution. That is the whole point.',
    ],
    readTime: '13 min read',
    date: 'March 26, 2026',
  },
];

export default function BlogPage() {
  const [activePost, setActivePost] = useState(null);

  if (activePost) {
    return (
      <div className="landing-page min-h-screen bg-white">
        <TopBanner />
        <Navbar />

        <article className="pt-28 pb-14 md:pt-44 md:pb-24 px-6">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => { setActivePost(null); window.scrollTo(0, 0); }}
              className="text-sm font-semibold text-[#0158c6] hover:underline mb-6 inline-flex items-center gap-1"
            >
              ← Back to all articles
            </button>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-xs font-semibold text-[#0158c6] bg-[rgba(1,88,198,0.06)] px-3 py-1 rounded-full uppercase tracking-wider">{activePost.category}</span>
              <span className="text-xs text-[#6B7080] flex items-center gap-1"><Clock size={12} /> {activePost.readTime}</span>
              <span className="text-xs text-[#6B7080]">{activePost.date}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-6">
              {activePost.title}
            </h1>

            <p className="text-lg sm:text-xl text-[#6B7080] leading-relaxed mb-10 italic border-l-4 border-[#0158c6] pl-5">
              {activePost.excerpt}
            </p>

            <div className="space-y-6 text-base sm:text-lg text-[#0D0F1A] leading-relaxed">
              {activePost.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-[#E8EAF0]">
              <p className="text-sm text-[#6B7080] mb-4">Ready to apply this on a live account?</p>
              <Link href="/our-accounts" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0158c6] text-white font-semibold text-sm hover:bg-[#0199c6] transition-all">
                View Accounts <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </article>

        <Footer />
      </div>
    );
  }

  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Resources</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            Honest insights for <span className="text-[#0158c6]">global forex traders</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed">
            Long-form articles written by traders, not marketers. We cover the parts of forex trading that matter — risk, psychology, execution, and what actually works across global sessions.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="pb-16 md:pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post, i) => (
              <article
                key={post.slug}
                onClick={() => { setActivePost(post); window.scrollTo(0, 0); }}
                className={`group cursor-pointer bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-[#0158c6] transition-all ${i === 0 ? 'md:col-span-2' : ''}`}
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-[#0158c6] bg-[rgba(1,88,198,0.06)] px-3 py-1 rounded-full uppercase tracking-wider">{post.category}</span>
                  <span className="text-xs text-[#6B7080] flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                  <span className="text-xs text-[#6B7080]">{post.date}</span>
                </div>

                <h2 className={`font-bold text-[#0D0F1A] mb-3 leading-tight group-hover:text-[#0158c6] transition-colors ${i === 0 ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`} style={{ letterSpacing: '-0.02em' }}>
                  {post.title}
                </h2>

                <p className="text-base text-[#6B7080] leading-relaxed mb-5">
                  {post.excerpt}
                </p>

                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0158c6]">
                  <BookOpen size={14} /> Read full article <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-14 md:py-20 px-6 bg-[#FAFBFD]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-4">
            Want trading insights in your inbox?
          </h2>
          <p className="text-base text-[#6B7080] mb-8 max-w-xl mx-auto">
            We publish one article a week. No promotional emails, no upsells — just the kind of stuff we wish someone had told us when we started.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-5 py-3.5 rounded-full bg-white border border-[#E8EAF0] text-[#0D0F1A] text-sm focus:outline-none focus:border-[#0158c6] transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm hover:bg-[#0199c6] transition-all shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
