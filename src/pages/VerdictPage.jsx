import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, RefreshCw, CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { getVerdict } from '../utils/api'
import { useNotifications } from '../contexts/NotificationContext'
import SignalBadge from '../components/SignalBadge'
import ConfidenceMeter from '../components/ConfidenceMeter'

export default function VerdictPage() {
  const { ticker } = useParams()
  const navigate = useNavigate()
  const { showToast, addNotification } = useNotifications()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (ticker) fetchVerdict()
  }, [ticker])

  const fetchVerdict = async () => {
    setLoading(true)
    setError('')
    setData(null)
    try {
      const result = await getVerdict(ticker)
      if (result.error) { setError(result.error); return }
      setData(result)
      addNotification({
        type: result.verdict,
        ticker: ticker.toUpperCase(),
        message: `${result.verdict} signal — confidence ${result.confidence}% — ${result.summary?.slice(0, 80)}...`,
      })
      showToast(`Analysis complete for ${ticker.toUpperCase()}`, 'success')
    } catch {
      setError('Analysis failed. Check that the ticker is valid on screener.in and backend is running.')
      showToast('Analysis failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const riskColor = (risk) => ({
    Low: 'var(--accent-green)', Medium: 'var(--accent-yellow)', High: 'var(--accent-red)',
  }[risk] || 'var(--text-muted)')

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost btn-sm" onClick={fetchVerdict} disabled={loading}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to={`/chat/${ticker}`} className="btn btn-ghost btn-sm">
              <MessageSquare size={14} /> Chat with AI
            </Link>
          </div>
        </div>

        {/* Ticker title */}
        <div style={styles.titleRow}>
          <h1 style={styles.tickerTitle}>{ticker?.toUpperCase()}</h1>
          {data && <SignalBadge action={data.verdict} size="lg" />}
        </div>

        {/* Loading */}
        {loading && (
          <div style={styles.loadingCard} className="glass-card">
            <div style={styles.spinner} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>Analyzing {ticker?.toUpperCase()}...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Scraping fundamentals, fetching news, running AI analysis. This may take 15–30 seconds.
              </p>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Fetching fundamentals from screener.in', 'Fetching latest news', 'Embedding & running RAG', 'Generating AI verdict'].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)', animation: `pulse-ring 1.5s ${i * 0.4}s ease-out infinite` }} />
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <style>{`@keyframes pulse-ring { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={styles.errorCard}>
            <AlertTriangle size={24} color="var(--accent-red)" />
            <div>
              <h3 style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-red)', marginBottom: '6px' }}>Analysis Failed</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{error}</p>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: '12px' }} onClick={fetchVerdict}>
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Verdict Result */}
        {data && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Summary card */}
            <div className="glass-card" style={{ padding: '32px' }}>
              <div style={styles.verdictGrid}>
                {/* Left: main metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <ConfidenceMeter value={data.confidence} />
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <MetricPill label="VERDICT" value={data.verdict} color="var(--accent-green)" />
                    <MetricPill label="RISK" value={data.risk} color={riskColor(data.risk)} />
                    <MetricPill label="CONFIDENCE" value={`${data.confidence}%`} color="var(--accent-blue)" />
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7' }}>
                    {data.summary}
                  </p>
                </div>

                {/* Right: positives / negatives */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {data.positives?.length > 0 && (
                    <div>
                      <div className="section-heading" style={{ color: 'var(--accent-green)', marginBottom: '10px' }}>Positives</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data.positives.map((p, i) => (
                          <div key={i} style={styles.procon}>
                            <CheckCircle size={14} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.negatives?.length > 0 && (
                    <div>
                      <div className="section-heading" style={{ color: 'var(--accent-red)', marginBottom: '10px' }}>Negatives</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data.negatives.map((n, i) => (
                          <div key={i} style={styles.procon}>
                            <XCircle size={14} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{n}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to={`/chat/${ticker}`} className="btn btn-primary">
                <MessageSquare size={16} /> Chat with AI about {ticker?.toUpperCase()}
              </Link>
              <Link to="/portfolio" className="btn btn-ghost">
                Add to Portfolio
              </Link>
            </div>

            {/* Disclaimer */}
            <div style={styles.disclaimer}>
              ⚠️ This analysis is AI-generated for educational purposes only. Not financial advice. Always do your own research before investing.
            </div>
          </div>
        )}

        {/* Default state — no analysis yet */}
        {!data && !loading && !error && (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <TrendingUp size={48} color="var(--accent-green)" style={{ margin: '0 auto 20px', display: 'block', opacity: 0.5 }} />
            <h3 style={{ fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>Ready to analyze {ticker?.toUpperCase()}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Click Analyze to get an AI-powered buy/sell verdict with fundamentals, news, and technical signals.
            </p>
            <button className="btn btn-primary btn-lg" onClick={fetchVerdict}>
              Analyze {ticker?.toUpperCase()} Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricPill({ label, value, color }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 18px', minWidth: '100px' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1rem', color }}>
        {value}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: 'calc(100vh - 90px)', padding: '32px 24px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' },
  tickerTitle: { fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: '700', color: 'var(--text-primary)' },
  loadingCard: {
    padding: '40px', display: 'flex', gap: '24px', alignItems: 'flex-start',
  },
  spinner: {
    width: '40px', height: '40px', border: '3px solid var(--border-color)',
    borderTop: '3px solid var(--accent-green)', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite', flexShrink: 0, marginTop: '4px',
  },
  errorCard: {
    background: 'var(--accent-red-dim)', border: '1px solid rgba(255,77,109,0.25)',
    borderRadius: '12px', padding: '28px', display: 'flex', gap: '16px', alignItems: 'flex-start',
  },
  verdictGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px',
  },
  procon: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  disclaimer: {
    background: 'rgba(255,214,10,0.06)', border: '1px solid rgba(255,214,10,0.2)',
    borderRadius: '10px', padding: '14px 18px',
    fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.6',
  },
}
