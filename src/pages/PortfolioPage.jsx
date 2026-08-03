import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, RefreshCw, Play, X, Check, Upload, FileText, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { getPortfolio, addHolding, deleteHolding, runPortfolioCheck, importCsvPortfolio } from '../utils/api'
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

  // Add holding form
  const [ticker, setTicker] = useState('')
  const [qty, setQty] = useState('')
  const [avgPrice, setAvgPrice] = useState('')
  const [saving, setSaving] = useState(false)

  // CSV import
  const [showCsvImport, setShowCsvImport] = useState(false)
  const [csvImporting, setCsvImporting] = useState(false)
  const [csvResult, setCsvResult] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => { fetchHoldings() }, [])

  // Read from backend API (sends X-User-Id automatically)
  const fetchHoldings = async () => {
    setLoading(true)
    try {
      const res = await getPortfolio()
      setHoldings(res.holdings || [])
    } catch {
      showToast('Cannot load portfolio. Check backend connection.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddHolding = async (e) => {
    e.preventDefault()
    if (!ticker || !qty || !avgPrice) return
    setSaving(true)
    try {
      await addHolding(ticker.toUpperCase(), parseFloat(qty), parseFloat(avgPrice))
      showToast(`${ticker.toUpperCase()} saved to portfolio.`, 'success')
      setShowModal(false)
      setTicker(''); setQty(''); setAvgPrice('')
      await fetchHoldings()
    } catch {
      showToast('Failed to add holding.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (t) => {
    if (!window.confirm(`Remove ${t} from portfolio?`)) return
    try {
      await deleteHolding(t)
      showToast(`${t} removed.`, 'success')
      await fetchHoldings()
    } catch {
      showToast('Failed to remove holding.', 'error')
    }
  }

  const handleRunCheck = async () => {
    // Default to "Chennai" for testing — no more prompt needed
    const secret = user?.cronSecret || 'Chennai'
    setRunning(true)
    setRunResult(null)
    try {
      const res = await runPortfolioCheck(secret, true)
      setRunResult(res)

      // The new backend returns { status, results: { [user_id]: [...] } }
      // Flatten results for display
      const allResults = []
      if (res.results && typeof res.results === 'object') {
        Object.values(res.results).forEach((userResults) => {
          if (Array.isArray(userResults)) {
            allResults.push(...userResults)
          }
        })
      }

      const sentCount = allResults.filter((r) => r.action && r.action !== 'HOLD').length
      showToast(
        sentCount > 0
          ? `Portfolio check done — ${sentCount} alert(s) triggered!`
          : 'Portfolio check done — no signals triggered.',
        'success'
      )
      allResults.forEach((r) => {
        if (r.action) {
          addNotification({
            type: r.action,
            ticker: r.ticker,
            source: 'run-check',
            message: `${r.action} signal for ${r.ticker}${r.alert_type ? ` — ${r.alert_type}` : ''}`,
          })
          if (r.action !== 'HOLD' || r.alert_type) {
            addEmailAlert({
              type: r.action,
              ticker: r.ticker,
              channel: user?.notifyChannel || 'email',
              message: `${r.action} signal for ${r.ticker} sent via backend notifier`,
            })
          }
        }
      })
      // Store flattened results for display
      setRunResult({ ...res, _flatResults: allResults })
    } catch {
      showToast('Run check failed. Wrong CRON_SECRET or backend down.', 'error')
    } finally {
      setRunning(false)
    }
  }

  // ── CSV Import Handler ────────────────────────────────────────
  const handleCsvFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvImporting(true)
    setCsvResult(null)
    try {
      const csvText = await file.text()
      const res = await importCsvPortfolio(csvText)
      setCsvResult(res)
      showToast(`Imported ${res.imported} holding(s) from CSV!`, 'success')
      await fetchHoldings()
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.error || err.message
      setCsvResult({ error: detail })
      showToast(`CSV import failed: ${detail}`, 'error')
    } finally {
      setCsvImporting(false)
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const displayResults = runResult?._flatResults || []

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
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={fetchHoldings}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleRunCheck} disabled={running}>
              <Play size={14} /> {running ? 'Running...' : 'Run Check'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCsvImport(!showCsvImport)}>
              <Upload size={14} /> Import CSV
            </button>
            <button id="add-holding-btn" className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Add Holding
            </button>
          </div>
        </div>

        {/* CSV Import Section */}
        {showCsvImport && (
          <div className="glass-card" style={styles.csvSection}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <FileText size={18} color="var(--accent-blue)" />
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>Import from CSV</h3>
              <button style={styles.closeBtn} onClick={() => { setShowCsvImport(false); setCsvResult(null) }}>
                <X size={16} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '14px', lineHeight: '1.6' }}>
              Upload a CSV exported from any broker app (Groww, Zerodha, Upstox, etc.).<br />
              The system auto-detects columns like <strong style={{ color: 'var(--text-secondary)' }}>Symbol/Ticker</strong>,{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>Quantity</strong>, and{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>Avg Buy Price</strong> — exact header names don't matter.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label
                htmlFor="csv-file-input"
                className="btn btn-primary btn-sm"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={14} /> {csvImporting ? 'Importing...' : 'Choose CSV File'}
              </label>
              <input
                id="csv-file-input"
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={handleCsvFile}
                disabled={csvImporting}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Supports: .csv from Groww, Zerodha Console, Upstox, etc.
              </span>
            </div>

            {/* CSV Result */}
            {csvResult && !csvResult.error && (
              <div style={styles.csvResultSuccess}>
                <Check size={16} color="var(--accent-green)" />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                    {csvResult.imported} stock(s) imported successfully
                  </div>
                  {csvResult.columns_detected && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      Detected: ticker={csvResult.columns_detected.ticker_column}, qty={csvResult.columns_detected.quantity_column}, price={csvResult.columns_detected.avg_price_column}
                    </div>
                  )}
                  {csvResult.skipped?.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-yellow)', fontWeight: '600' }}>
                        ⚠️ {csvResult.skipped.length} row(s) skipped:
                      </div>
                      {csvResult.skipped.map((s, i) => (
                        <div key={i} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          • {s.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {csvResult?.error && (
              <div style={styles.csvResultError}>
                <AlertTriangle size={16} color="var(--accent-red)" />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {csvResult.error}
                </div>
              </div>
            )}
          </div>
        )}

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
              {displayResults.map((r) => (
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
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  <Plus size={16} /> Add your first stock
                </button>
                <button className="btn btn-ghost" onClick={() => setShowCsvImport(true)}>
                  <Upload size={16} /> Import from CSV
                </button>
              </div>
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
  csvSection: {
    padding: '20px 24px',
    marginBottom: '20px',
    border: '1px solid rgba(78,168,222,0.2)',
  },
  csvResultSuccess: {
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    marginTop: '16px', padding: '14px 16px',
    background: 'var(--accent-green-dim)', border: '1px solid rgba(0,255,157,0.2)',
    borderRadius: '10px',
  },
  csvResultError: {
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    marginTop: '16px', padding: '14px 16px',
    background: 'var(--accent-red-dim)', border: '1px solid rgba(255,77,109,0.2)',
    borderRadius: '10px',
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
    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto',
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
