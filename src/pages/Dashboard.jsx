import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Zap, Bell, Briefcase,
  ArrowRight, RefreshCw, Search, ChevronRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { getPortfolio, getVerdict } from '../utils/api'
import SignalBadge from '../components/SignalBadge'
import ConfidenceMeter from '../components/ConfidenceMeter'
import StockSearch from '../components/StockSearch'

export default function Dashboard() {
  const { user } = useAuth()
  const { notifications, unreadCount, unreadEmailAlerts, addNotification, showToast } = useNotifications()
  const navigate = useNavigate()

  const [holdings, setHoldings] = useState([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const [analyzeTicker, setAnalyzeTicker] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [quickResult, setQuickResult] = useState(null)

  useEffect(() => {
    fetchPortfolio()
  }, [])

  const fetchPortfolio = async () => {
    try {
      const data = await getPortfolio()
      setHoldings(data.holdings || [])
    } catch {
      showToast('Could not load portfolio.', 'error')
    } finally {
      setLoadingPortfolio(false)
    }
  }

  const handleQuickAnalyze = async (e) => {
    e.preventDefault()
    if (!analyzeTicker.trim()) return
    setAnalyzing(true)
    setQuickResult(null)
    try {
      const data = await getVerdict(analyzeTicker.trim())
      setQuickResult({ ticker: analyzeTicker.toUpperCase(), ...data })
      addNotification({
        type: data.verdict,
        ticker: analyzeTicker.toUpperCase(),
        message: `${data.verdict} signal for ${analyzeTicker.toUpperCase()} — confidence ${data.confidence}%`,
      })
      showToast(`Analysis complete for ${analyzeTicker.toUpperCase()}`, 'success')
    } catch (err) {
      showToast('Analysis failed. Check ticker symbol.', 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  const recentSignals = notifications.slice(0, 5)
  const totalHoldings = holdings.length
  const signalsToday = notifications.filter((n) => {
    const d = new Date(n.timestamp)
    return d.toDateString() === new Date().toDateString()
  }).length

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* ── Welcome Header ── */}
        <div style={styles.welcomeRow}>
          <div>
            <div className="section-heading">Dashboard</div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', marginTop: '6px' }}>
              Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Here's your market overview and portfolio at a glance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
            <Link to="/portfolio" className="btn btn-ghost btn-sm">
              <Briefcase size={14} /> Portfolio
            </Link>
            <button onClick={fetchPortfolio} className="btn btn-ghost btn-sm" title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid-stats" style={{ marginBottom: '28px' }}>
          <StatCard
            label="Holdings"
            value={totalHoldings}
            icon={<Briefcase size={18} />}
            color="var(--accent-green)"
            loading={loadingPortfolio}
          />
          <StatCard
            label="Signals Today"
            value={signalsToday}
            icon={<Zap size={18} />}
            color="var(--accent-yellow)"
          />
          <StatCard
            label="Email Alerts Sent"
            value={unreadEmailAlerts}
            icon={<Bell size={18} />}
            color="var(--accent-red)"
            tooltip="Alerts delivered to your email/WhatsApp by the backend"
          />
          <StatCard
            label="AI Analyses"
            value={notifications.length}
            icon={<TrendingUp size={18} />}
            color="var(--accent-blue)"
          />
        </div>

        <div style={styles.mainGrid}>
          {/* ── LEFT column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick Analyze */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="section-heading">Quick Analysis</div>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', margin: '8px 0 16px' }}>
                Analyze any NSE stock
              </h2>
              <form onSubmit={handleQuickAnalyze} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <StockSearch
                    id="quick-ticker-input"
                    value={analyzeTicker}
                    onChange={setAnalyzeTicker}
                    onSelect={(s) => setAnalyzeTicker(s.symbol)}
                    placeholder="Search stocks... e.g. TCS, Reliance"
                  />
                </div>
                <button
                  id="quick-analyze-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={analyzing}
                  style={{ flexShrink: 0 }}
                >
                  {analyzing ? 'Analyzing...' : <><Zap size={14} /> Analyze</>}
                </button>
              </form>

              {/* Quick Result */}
              {analyzing && (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton" style={{ height: '20px', width: '60%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '90%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '75%' }} />
                </div>
              )}

              {quickResult && !analyzing && (
                <div style={styles.quickResult}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1.1rem' }}>
                      {quickResult.ticker}
                    </span>
                    <SignalBadge action={quickResult.verdict} size="lg" />
                  </div>
                  <ConfidenceMeter value={quickResult.confidence} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginTop: '12px' }}>
                    {quickResult.summary}
                  </p>
                  <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate(`/verdict/${quickResult.ticker}`)}
                    >
                      Full Analysis <ChevronRight size={12} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate(`/chat/${quickResult.ticker}`)}
                    >
                      Chat with AI
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Holdings Overview */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div className="section-heading">Portfolio</div>
                  <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', marginTop: '6px' }}>
                    Your Holdings
                  </h2>
                </div>
                <Link to="/portfolio" className="btn btn-ghost btn-sm">
                  Manage <ArrowRight size={12} />
                </Link>
              </div>

              {loadingPortfolio ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '52px', borderRadius: '8px' }} />)}
                </div>
              ) : holdings.length === 0 ? (
                <div style={styles.emptyState}>
                  <Briefcase size={32} color="var(--text-muted)" />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>No holdings yet</p>
                  <Link to="/portfolio" className="btn btn-ghost btn-sm" style={{ marginTop: '10px' }}>
                    Add your first stock
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {holdings.slice(0, 5).map((h) => (
                    <div key={h.ticker} style={styles.holdingRow}>
                      <div style={styles.holdingTicker}>{h.ticker}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {h.quantity} shares @ ₹{h.avg_buy_price}
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                        onClick={() => navigate(`/verdict/${h.ticker}`)}
                      >
                        Analyze
                      </button>
                    </div>
                  ))}
                  {holdings.length > 5 && (
                    <Link to="/portfolio" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', padding: '8px' }}>
                      +{holdings.length - 5} more →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Recent Signals */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div className="section-heading">Signals Feed</div>
                  <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', marginTop: '6px' }}>
                    Recent Alerts
                  </h2>
                </div>
                <Link to="/notifications" className="btn btn-ghost btn-sm">
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {recentSignals.length === 0 ? (
                <div style={styles.emptyState}>
                  <Bell size={32} color="var(--text-muted)" />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>
                    No signals yet. Analyze a stock to generate your first signal.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentSignals.map((n) => (
                    <SignalRow key={n.id} notif={n} />
                  ))}
                </div>
              )}
            </div>

            {/* Market Status */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div className="section-heading">Market Status</div>
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', margin: '6px 0 16px' }}>
                NSE / BSE
              </h2>
              <MarketStatus />
            </div>

            {/* User contact info reminder */}
            {(!user?.phone) && (
              <div style={styles.reminderCard}>
                <Bell size={18} color="var(--accent-yellow)" />
                <div>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>Set up alert notifications</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Add your email/phone to receive buy & sell alerts.
                  </p>
                  <Link to="/settings" className="btn btn-ghost btn-sm" style={{ marginTop: '10px' }}>
                    Go to Settings
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color, loading }) {
  return (
    <div className="glass-card stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="stat-label">{label}</span>
        <div style={{ color, opacity: 0.6 }}>{icon}</div>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: '32px', width: '60px', borderRadius: '4px' }} />
      ) : (
        <div className="stat-value" style={{ color }}>{value}</div>
      )}
    </div>
  )
}

function SignalRow({ notif }) {
  const actionColor = {
    BUY: 'var(--accent-green)', SELL: 'var(--accent-red)',
    HOLD: 'var(--accent-yellow)', ACCUMULATE: 'var(--accent-blue)',
  }
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 12px',
      background: 'var(--bg-surface)',
      borderRadius: '10px',
      border: '1px solid var(--border-color)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
        background: actionColor[notif.type] || 'var(--text-muted)',
      }} />
      <div style={{ flex: 1, paddingLeft: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.9rem' }}>
            {notif.ticker || '—'}
          </span>
          <SignalBadge action={notif.type} />
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
          {notif.message}
        </p>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
        {formatTime(notif.timestamp)}
      </div>
    </div>
  )
}

function MarketStatus() {
  const now = new Date()
  const istHour = (now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) % 24
  const istMin = (now.getUTCMinutes() + 30) % 60
  const isWeekday = now.getUTCDay() > 0 && now.getUTCDay() < 6
  const isOpen = isWeekday && (istHour > 9 || (istHour === 9 && istMin >= 15)) && (istHour < 15 || (istHour === 15 && istMin <= 30))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[
        { name: 'NSE', open: isOpen },
        { name: 'BSE', open: isOpen },
        { name: 'F&O', open: isOpen },
      ].map(({ name, open }) => (
        <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{name}</span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '700',
            color: open ? 'var(--accent-green)' : 'var(--accent-red)',
          }}>
            {open && <span className="live-dot" />}
            {open ? 'OPEN' : 'CLOSED'}
          </span>
        </div>
      ))}
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
        Market hours: Mon–Fri 9:15 AM – 3:30 PM IST
      </p>
    </div>
  )
}

const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 90px)',
    padding: '32px 24px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  welcomeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  quickResult: {
    marginTop: '20px',
    padding: '18px',
    background: 'var(--bg-surface)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  holdingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'var(--bg-surface)',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    gap: '12px',
    flexWrap: 'wrap',
  },
  holdingTicker: {
    fontFamily: 'var(--font-mono)',
    fontWeight: '700',
    fontSize: '0.95rem',
    color: 'var(--accent-green)',
    minWidth: '80px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  reminderCard: {
    background: 'rgba(255,214,10,0.06)',
    border: '1px solid rgba(255,214,10,0.2)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
  },
}

// Responsive grid fix
const style = document.createElement('style')
style.textContent = `@media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr !important; } }`
document.head.appendChild(style)
