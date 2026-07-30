import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Zap, Bell, MessageSquare, ShieldCheck, ArrowRight, BarChart2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

/* Animated floating candlestick SVG elements */
function FloatingChart({ style, delay = '0s' }) {
  return (
    <div style={{ position: 'absolute', opacity: 0.12, ...style, animation: `float-slow 6s ease-in-out ${delay} infinite` }}>
      <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
        <rect x="20" y="10" width="12" height="50" fill="#00ff9d" rx="2" />
        <rect x="20" y="30" width="12" height="22" fill="#00ff9d" rx="1" opacity="0.6" />
        <line x1="26" y1="5" x2="26" y2="65" stroke="#00ff9d" strokeWidth="2" />
        <rect x="48" y="35" width="12" height="35" fill="#ff4d6d" rx="2" />
        <rect x="48" y="35" width="12" height="18" fill="#ff4d6d" rx="1" opacity="0.6" />
        <line x1="54" y1="25" x2="54" y2="80" stroke="#ff4d6d" strokeWidth="2" />
      </svg>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="glass-card" style={{ padding: '28px', textAlign: 'center', animation: 'fadeInUp 0.6s ease forwards' }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        background: `rgba(${color}, 0.12)`, border: `1px solid rgba(${color}, 0.25)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
      }}>
        <Icon size={24} color={`rgb(${color})`} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>{desc}</p>
    </div>
  )
}

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={styles.hero}>
        {/* Floating background elements */}
        <div style={styles.heroBg} />
        <FloatingChart style={{ top: '15%', left: '5%' }} delay="0s" />
        <FloatingChart style={{ top: '20%', right: '8%' }} delay="1.5s" />
        <FloatingChart style={{ bottom: '20%', left: '12%' }} delay="0.8s" />
        <FloatingChart style={{ bottom: '25%', right: '5%' }} delay="2s" />
        <FloatingChart style={{ top: '50%', left: '3%' }} delay="3s" />

        {/* Glow orbs */}
        <div style={{ ...styles.glowOrb, background: 'radial-gradient(circle, rgba(0,255,157,0.15) 0%, transparent 70%)', top: '20%', left: '15%' }} />
        <div style={{ ...styles.glowOrb, background: 'radial-gradient(circle, rgba(255,77,109,0.1) 0%, transparent 70%)', bottom: '30%', right: '15%' }} />

        <div style={styles.heroContent}>
          {/* Label */}
          <div style={styles.heroLabel}>
            <span className="live-dot" />
            <span>AI-Powered Stock Intelligence for NSE</span>
          </div>

          {/* Mega title — Robotos-style */}
          <h1 style={styles.heroTitle}>
            <span style={styles.heroTitleLine1}>STOCK</span>
            <span style={styles.heroTitleLine2} className="animate-neon-pulse">CHECK</span>
            <span style={styles.heroTitleLine3}>AI</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Real-time buy/sell signals, AI-powered stock analysis, portfolio monitoring,<br />
            and smart WhatsApp & email alerts — all in one place.
          </p>

          <div style={styles.heroCTA}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Launch Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/auth?tab=register" className="btn btn-primary btn-lg">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/auth" className="btn btn-ghost btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Live stat pills */}
          <div style={styles.statPills}>
            <div style={styles.statPill}>
              <TrendingUp size={14} color="var(--accent-green)" />
              <span>Live NSE Signals</span>
            </div>
            <div style={styles.statPill}>
              <Bell size={14} color="var(--accent-yellow)" />
              <span>WhatsApp / Email Alerts</span>
            </div>
            <div style={styles.statPill}>
              <MessageSquare size={14} color="var(--accent-blue)" />
              <span>AI Chat Analysis</span>
            </div>
          </div>
        </div>

        {/* Scrolling ticker tape */}
        <div style={styles.tickerWrap}>
          <div style={styles.tickerInner}>
            {[
              'TCS ▲ 3,892.40', 'RELIANCE ▼ 2,941.20', 'INFY ▲ 1,621.55', 'HDFC ▲ 1,712.80',
              'WIPRO ▼ 478.30', 'BAJFINANCE ▲ 7,212.60', 'ICICIBANK ▲ 1,089.45', 'TITAN ▲ 3,322.15',
              'TCS ▲ 3,892.40', 'RELIANCE ▼ 2,941.20', 'INFY ▲ 1,621.55', 'HDFC ▲ 1,712.80',
              'WIPRO ▼ 478.30', 'BAJFINANCE ▲ 7,212.60', 'ICICIBANK ▲ 1,089.45', 'TITAN ▲ 3,322.15',
            ].map((t, i) => (
              <span key={i} style={{
                ...styles.tickerItem,
                color: t.includes('▲') ? 'var(--accent-green)' : 'var(--accent-red)',
              }}>
                {t} &nbsp;&nbsp;·&nbsp;&nbsp;
              </span>
            ))}
          </div>
          <style>{`
            @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          `}</style>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="section-heading" style={{ justifyContent: 'center' }}>Everything you need</div>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
              Built for serious investors
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <FeatureCard
              icon={Zap}
              title="AI Verdict Engine"
              desc="RAG-powered analysis combining fundamentals, live news, and technical indicators to give you a BUY / SELL / HOLD verdict."
              color="0,255,157"
            />
            <FeatureCard
              icon={BarChart2}
              title="Technical Analysis"
              desc="RSI, MACD, and momentum signals layered on top of AI fundamentals for a complete picture."
              color="78,168,222"
            />
            <FeatureCard
              icon={Bell}
              title="Smart Alerts"
              desc="Get notified via email or WhatsApp when your portfolio holdings trigger a buy or sell signal."
              color="255,214,10"
            />
            <FeatureCard
              icon={MessageSquare}
              title="AI Chat"
              desc="Ask any question about any stock. The AI has full context of fundamentals and recent news."
              color="191,90,242"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Risk Management"
              desc="P&L tracking with automatic override alerts when a position hits deep loss territory."
              color="255,77,109"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Portfolio Dashboard"
              desc="Track all your NSE holdings, monitor live P&L, and run on-demand portfolio checks."
              color="0,255,157"
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section style={{ ...styles.section, background: 'var(--bg-surface)' }}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="section-heading" style={{ justifyContent: 'center' }}>How it works</div>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>
              Three steps to smarter trading
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
            {[
              { step: '01', title: 'Add your portfolio', desc: 'Enter your NSE holdings — ticker, quantity, and average buy price.' },
              { step: '02', title: 'AI analyzes in real-time', desc: 'Our engine scrapes fundamentals, fetches news, runs RAG + technicals every 15 minutes during market hours.' },
              { step: '03', title: 'Get alerts & act', desc: 'Receive buy/sell/hold signals via WhatsApp or email instantly. Review full analysis on the dashboard.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={styles.stepNum}>{step}</div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', marginBottom: '8px' }}>{title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.7' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Footer ───────────────────────────────────── */}
      <section style={{ ...styles.section, textAlign: 'center', padding: '100px 24px' }}>
        <div style={styles.container}>
          <div style={styles.ctaGlow} />
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '16px' }}>
            START TODAY — FREE
          </p>
          <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-mono)', lineHeight: 1.1, marginBottom: '24px' }}>
            Your AI stock<br />advisor awaits.
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 40px', lineHeight: '1.7' }}>
            Join investors using StockCheck AI to make data-driven decisions backed by real analysis — not noise.
          </p>
          <Link to="/auth?tab=register" className="btn btn-primary btn-lg">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '24px', height: '24px', background: 'var(--accent-green)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} color="#080a0f" />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>StockCheck AI</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            For educational purposes only. Not financial advice. Always do your own research.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '8px' }}>
            © {new Date().getFullYear()} StockCheck AI. Built with FastAPI + Cohere + React.
          </p>
        </div>
      </footer>
    </div>
  )
}

const styles = {
  hero: {
    minHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: '60px',
  },
  heroBg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,255,157,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  glowOrb: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '0 24px',
    maxWidth: '800px',
  },
  heroLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--accent-green-dim)',
    border: '1px solid rgba(0,255,157,0.2)',
    borderRadius: '100px',
    padding: '6px 16px',
    fontSize: '0.78rem',
    color: 'var(--accent-green)',
    fontFamily: 'var(--font-mono)',
    marginBottom: '32px',
    letterSpacing: '0.05em',
  },
  heroTitle: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 0.95,
    marginBottom: '28px',
    gap: '0px',
  },
  heroTitleLine1: {
    fontSize: 'clamp(5rem, 14vw, 10rem)',
    fontFamily: 'var(--font-mono)',
    fontWeight: '700',
    color: 'white',
    WebkitTextStroke: '3px rgba(255,255,255,0.15)',
    display: 'block',
  },
  heroTitleLine2: {
    fontSize: 'clamp(5rem, 14vw, 10rem)',
    fontFamily: 'var(--font-mono)',
    fontWeight: '700',
    color: 'var(--accent-green)',
    WebkitTextStroke: '3px rgba(0,255,157,0.3)',
    display: 'block',
  },
  heroTitleLine3: {
    fontSize: 'clamp(5rem, 14vw, 10rem)',
    fontFamily: 'var(--font-mono)',
    fontWeight: '700',
    color: 'white',
    WebkitTextStroke: '3px rgba(255,255,255,0.15)',
    display: 'block',
  },
  heroSubtitle: {
    fontSize: '1.05rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.7',
    marginBottom: '36px',
  },
  heroCTA: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '40px',
  },
  statPills: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  statPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '100px',
    padding: '6px 14px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  tickerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--border-color)',
    padding: '10px 0',
  },
  tickerInner: {
    display: 'inline-flex',
    animation: 'marquee 30s linear infinite',
    whiteSpace: 'nowrap',
  },
  tickerItem: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.78rem',
    fontWeight: '700',
    padding: '0 4px',
  },
  section: {
    padding: '100px 24px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  stepNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'var(--accent-green)',
    opacity: 0.3,
    lineHeight: 1,
    flexShrink: 0,
    width: '64px',
  },
  ctaGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '300px',
    background: 'radial-gradient(ellipse, rgba(0,255,157,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  footer: {
    borderTop: '1px solid var(--border-color)',
    padding: '40px 24px',
    background: 'var(--bg-surface)',
  },
}
