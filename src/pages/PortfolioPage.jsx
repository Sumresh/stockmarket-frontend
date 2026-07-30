import { useState, useEffect } from 'react'
import { Plus, Trash2, RefreshCw, Play, X, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { getPortfolio, addHolding, deleteHolding, runPortfolioCheck } from '../utils/api'
import { fetchHoldingsFromSupabase, upsertHolding, removeHolding as sbRemoveHolding } from '../utils/supabase'
import Modal from '../components/Modal'
import SignalBadge from '../components/SignalBadge'

export default function PortfolioPage() {
  const { user } = useAuth()
  const { showToast, addNotification, addEmailAlert } = useNotifications()

  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [runResult, setRunResult] = useState(null)

  // Form
  const [ticker, setTicker] = useState('')
  const [qty, setQty] = useState('')
  const [avgPrice, setAvgPrice] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchHoldings() }, [])

  // Read directly from Supabase (same source as backend)
  const fetchHoldings = async () => {
    setLoading(true)
    try {
      const { data, error } = await fetchHoldingsFromSupabase()
      if (error) throw error
      setHoldings(data || [])
    } catch (err) {
      // Fallback: try backend API
      try {
        const res = await getPortfolio()
        setHoldings(res.holdings || [])
      } catch {
        showToast('Cannot load portfolio. Check Supabase / backend connection.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddHolding = async (e) => {
    e.preventDefault()
    if (!ticker || !qty || !avgPrice) return
    setSaving(true)
    try {
      // Write via Supabase directly (same table backend uses)
      const { error } = await upsertHolding(ticker.toUpperCase(), parseFloat(qty), parseFloat(avgPrice))
      if (error) throw error
      showToast(`${ticker.toUpperCase()} saved to portfolio.`, 'success')
      setShowModal(false)
      setTicker(''); setQty(''); setAvgPrice('')
      await fetchHoldings()
    } catch (err) {
      // Fallback to backend API
      try {
        await addHolding(ticker.toUpperCase(), parseFloat(qty), parseFloat(avgPrice))
        showToast(`${ticker.toUpperCase()} added to portfolio.`, 'success')
        setShowModal(false)
        setTicker(''); setQty(''); setAvgPrice('')
        await fetchHoldings()
      } catch {
        showToast('Failed to add holding.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (t) => {
    if (!window.confirm(`Remove ${t} from portfolio?`)) return
    try {
      // Delete via Supabase directly
      const { error } = await sbRemoveHolding(t)
      if (error) throw error
      showToast(`${t} removed.`, 'success')
      await fetchHoldings()
    } catch {
      // Fallback to backend API
      try {
        await deleteHolding(t)
        showToast(`${t} removed.`, 'success')
        await fetchHoldings()
      } catch {
        showToast('Failed to remove holding.', 'error')
      }
    }
  }

  const handleRunCheck = async () => {
    const secret = user?.cronSecret || prompt('Enter your CRON_SECRET (from .env):')
    if (!secret) return
    setRunning(true)
    setRunResult(null)
    try {
      const res = await runPortfolioCheck(secret, true)
      setRunResult(res)
      const sentCount = (res.results || []).filter((r) => r.action).length
      showToast(
        sentCount > 0
          ? `Portfolio check done — ${sentCount} alert(s) sent to ${user?.notifyChannel || 'email'}!`
          : 'Portfolio check done — no signals triggered.',
        'success'
      )
      if (res.results) {
        res.results.forEach((r) => {
          if (r.action) {
            // in-app log
            addNotification({
              type: r.action,
              ticker: r.ticker,
              source: 'run-check',
              message: `${r.action} signal for ${r.ticker} — alert sent via ${user?.notifyChannel || 'email'}`,
            })
            // email/whatsapp alert log (the real delivery)
            addEmailAlert({
              type: r.action,
              ticker: r.ticker,
              channel: user?.notifyChannel || 'email',
              to: user?.notifyChannel === 'whatsapp' ? user?.phone : user?.email,
              message: `${r.action} signal for ${r.ticker} sent via backend notifier`,
            })
          }
        })
      }
    } catch (err) {
      showToast('Run check failed. Wrong CRON_SECRET or backend down.', 'error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div className="section-heading">Portfolio Manager</div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', marginTop: '6px' }}>
              Your Holdings
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Manage your NSE stock positions. The AI will monitor these every 15 min during market hours.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={fetchHoldings}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleRunCheck} disabled={running}>
              <Play size={14} /> {running ? 'Running...' : 'Run Check'}
            </button>
            <button id="add-holding-btn" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Add Holding
            </button>
          </div>
        </div>

        {/* Run Result */}
        {runResult && (
          <div style={styles.runResultCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
                ✅ Portfolio Check Results
              </h3>
              <button style={styles.closeBtn} onClick={() => setRunResult(null)}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(runResult.results || []).map((r) => (
                <div key={r.ticker} style={styles.runResultRow}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{r.ticker}</span>
                  {r.action ? <SignalBadge action={r.action} /> : <span style={{ color: 'var(--accent-red)', fontSize: '0.78rem' }}>{r.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Holdings Table */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '52px', borderRadius: '8px' }} />)}
            </div>
          ) : holdings.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', marginBottom: '10px' }}>
                No holdings yet
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
                Add your first NSE stock holding to start receiving AI signals.
              </p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} /> Add your first stock
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Quantity</th>
                    <th>Avg Buy Price</th>
                    <th>Investment</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const investment = (h.quantity * h.avg_buy_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                    return (
                      <tr key={h.ticker}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1rem', color: 'var(--accent-green)' }}>
                            {h.ticker}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{h.quantity}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>₹{h.avg_buy_price}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>₹{investment}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => window.location.assign(`/verdict/${h.ticker}`)}
                              title="Analyze"
                            >
                              Analyze
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(h.ticker)}
                              title="Remove"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contact info reminder */}
        <div style={styles.infoBox}>
          <div style={{ fontSize: '1.2rem' }}>📬</div>
          <div>
            <strong style={{ fontSize: '0.9rem' }}>Alert Delivery</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
              Signals are sent to: <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
              {user?.phone && <> &amp; <strong style={{ color: 'var(--text-primary)' }}>{user?.phone}</strong></>}
              {' '}via <strong style={{ color: 'var(--accent-green)' }}>{(user?.notifyChannel || 'email').toUpperCase()}</strong>.
              <a href="/settings" style={{ color: 'var(--accent-green)', marginLeft: '6px' }}>Change in Settings →</a>
            </p>
          </div>
        </div>
      </div>

      {/* Add Holding Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Stock Holding"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button
              id="save-holding-btn"
              className="btn btn-primary"
              onClick={handleAddHolding}
              disabled={saving}
            >
              {saving ? 'Saving...' : <><Check size={14} /> Save Holding</>}
            </button>
          </>
        }
      >
        <form onSubmit={handleAddHolding} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label className="form-label">NSE Ticker Symbol *</label>
            <input
              id="holding-ticker"
              type="text"
              className="form-input"
              placeholder="e.g. TCS, RELIANCE, INFY"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              required
              style={{ textTransform: 'uppercase' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Use the exact NSE symbol (as on screener.in)
            </span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                id="holding-qty"
                type="number"
                className="form-input"
                placeholder="e.g. 10"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                min="0.001"
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Avg Buy Price (₹) *</label>
              <input
                id="holding-price"
                type="number"
                className="form-input"
                placeholder="e.g. 3450"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
                min="0.01"
                step="any"
                required
              />
            </div>
          </div>

          {ticker && qty && avgPrice && (
            <div style={styles.calcPreview}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total investment:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-green)' }}>
                ₹{(parseFloat(qty || 0) * parseFloat(avgPrice || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}

const styles = {
  page: { minHeight: 'calc(100vh - 90px)', padding: '32px 24px' },
  container: { maxWidth: '1100px', margin: '0 auto' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '28px', flexWrap: 'wrap', gap: '16px',
  },
  runResultCard: {
    background: 'var(--accent-green-dim)',
    border: '1px solid rgba(0,255,157,0.25)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  runResultRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  closeBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
  },
  calcPreview: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  infoBox: {
    display: 'flex', gap: '14px', alignItems: 'flex-start',
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: '12px', padding: '18px', marginTop: '20px',
  },
}
