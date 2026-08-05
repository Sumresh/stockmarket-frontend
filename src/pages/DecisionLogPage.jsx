import { useState, useEffect } from 'react'
import { FileText, RefreshCw, Search, Filter, Clock, CheckCircle, XCircle, AlertTriangle, Newspaper } from 'lucide-react'
import { getDecisionLog } from '../utils/api'
import { useNotifications } from '../contexts/NotificationContext'
import SignalBadge from '../components/SignalBadge'
import StockSearch from '../components/StockSearch'

const SOURCE_FILTERS = ['ALL', 'HOLDING', 'WISHLIST']
const ACTION_FILTERS = ['ALL', 'BUY', 'SELL', 'HOLD', 'ACCUMULATE']

export default function DecisionLogPage() {
  const { showToast } = useNotifications()

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { fetchLog() }, [])

  const fetchLog = async () => {
    setLoading(true)
    try {
      const data = await getDecisionLog(100)
      setLogs(data.log || [])
    } catch {
      showToast('Failed to load decision log.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filtered = logs.filter((l) => {
    const matchSource = sourceFilter === 'ALL' || l.source?.toUpperCase() === sourceFilter
    const matchAction = actionFilter === 'ALL' || l.action?.toUpperCase() === actionFilter
    const matchSearch = !search ||
      l.ticker?.toLowerCase().includes(search.toLowerCase()) ||
      l.top_headline?.toLowerCase().includes(search.toLowerCase())
    return matchSource && matchAction && matchSearch
  })

  const notifiedCount = logs.filter((l) => l.notified).length
  const errorCount = logs.filter((l) => l.error).length

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div className="section-heading">Scheduler History</div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', marginTop: '6px' }}>
              <FileText size={24} color="var(--accent-blue)" style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              Decision Log
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Every check the scheduler makes — what it found, what it decided, and why it did or didn't notify you.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchLog} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statPill}>
            <Clock size={13} color="var(--accent-blue)" />
            <span>{logs.length} checks</span>
          </div>
          <div style={styles.statPill}>
            <CheckCircle size={13} color="var(--accent-green)" />
            <span>{notifiedCount} notified</span>
          </div>
          {errorCount > 0 && (
            <div style={{ ...styles.statPill, borderColor: 'rgba(255,77,109,0.3)' }}>
              <XCircle size={13} color="var(--accent-red)" />
              <span>{errorCount} errors</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Source:</span>
            <div style={styles.filterPills}>
              {SOURCE_FILTERS.map((f) => (
                <button
                  key={f}
                  style={{
                    ...styles.pill,
                    ...(sourceFilter === f ? styles.pillActive : {}),
                  }}
                  onClick={() => setSourceFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Action:</span>
            <div style={styles.filterPills}>
              {ACTION_FILTERS.map((f) => (
                <button
                  key={f}
                  style={{
                    ...styles.pill,
                    ...(actionFilter === f ? styles.pillActive : {}),
                  }}
                  onClick={() => setActionFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px', maxWidth: '280px' }}>
            <StockSearch
              id="decision-log-search"
              value={search}
              onChange={setSearch}
              onSelect={(s) => setSearch(s.symbol)}
              placeholder="Search ticker..."
            />
          </div>
        </div>

        {/* Log List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={styles.emptyState}>
            <FileText size={40} color="var(--text-muted)" style={{ opacity: 0.4 }} />
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', marginTop: '14px' }}>
              {logs.length === 0 ? 'No scheduler checks yet' : 'No results match your filters'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
              {logs.length === 0
                ? 'The scheduler runs every 15 min during market hours. Decision logs will appear here automatically.'
                : 'Try adjusting your filters or search.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                expanded={expandedId === log.id}
                onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LogCard({ log, expanded, onToggle }) {
  const ranAt = log.ran_at
    ? new Date(log.ran_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : ''
  const verdict = log.rag_verdict?.verdict || log.action
  const confidence = log.rag_verdict?.confidence
  const risk = log.rag_verdict?.risk
  const rsi = log.technicals?.rsi
  const macd = log.technicals?.macd

  return (
    <div
      style={{
        ...cardStyles.card,
        ...(log.error ? cardStyles.errorCard : {}),
        ...(log.notified ? cardStyles.notifiedCard : {}),
      }}
      className="glass-card"
      onClick={onToggle}
    >
      {/* Top row */}
      <div style={cardStyles.topRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={cardStyles.ticker}>{log.ticker}</span>
          {verdict && <SignalBadge action={verdict} />}
          <span style={cardStyles.sourceBadge}>
            {log.source === 'holding' ? '📊' : '⭐'} {log.source}
          </span>
          {log.alert_type && (
            <span style={cardStyles.alertBadge}>{log.alert_type}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {log.notified ? (
            <span style={cardStyles.notifiedBadge}>
              <CheckCircle size={11} /> Notified
            </span>
          ) : log.error ? (
            <span style={cardStyles.errorBadge}>
              <XCircle size={11} /> Error
            </span>
          ) : (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              No alert
            </span>
          )}
          <span style={cardStyles.time}>{ranAt}</span>
        </div>
      </div>

      {/* Headline */}
      {log.top_headline && (
        <div style={cardStyles.headlineRow}>
          <Newspaper size={12} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span style={cardStyles.headline}>{log.top_headline}</span>
        </div>
      )}

      {/* Error */}
      {log.error && (
        <div style={cardStyles.errorMsg}>
          <AlertTriangle size={12} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{log.error}</span>
        </div>
      )}

      {/* Expanded details */}
      {expanded && !log.error && (
        <div style={cardStyles.details}>
          <div style={cardStyles.detailGrid}>
            {confidence != null && (
              <DetailPill label="Confidence" value={`${confidence}%`} color="var(--accent-blue)" />
            )}
            {risk && (
              <DetailPill
                label="Risk"
                value={risk}
                color={risk === 'Low' ? 'var(--accent-green)' : risk === 'High' ? 'var(--accent-red)' : 'var(--accent-yellow)'}
              />
            )}
            {rsi != null && (
              <DetailPill label="RSI" value={rsi} color={rsi <= 30 ? 'var(--accent-green)' : rsi >= 70 ? 'var(--accent-red)' : 'var(--text-secondary)'} />
            )}
            {macd != null && (
              <DetailPill label="MACD" value={macd} color="var(--text-secondary)" />
            )}
          </div>

          {log.rag_verdict?.summary && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '12px' }}>
              {log.rag_verdict.summary}
            </p>
          )}

          {log.rag_verdict?.positives?.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {log.rag_verdict.positives.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', fontSize: '0.78rem', color: 'var(--accent-green)', marginTop: '4px' }}>
                  <CheckCircle size={11} style={{ flexShrink: 0, marginTop: '2px' }} /> <span style={{ color: 'var(--text-secondary)' }}>{p}</span>
                </div>
              ))}
            </div>
          )}
          {log.rag_verdict?.negatives?.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              {log.rag_verdict.negatives.map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', fontSize: '0.78rem', color: 'var(--accent-red)', marginTop: '4px' }}>
                  <XCircle size={11} style={{ flexShrink: 0, marginTop: '2px' }} /> <span style={{ color: 'var(--text-secondary)' }}>{n}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!log.error && (
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
          {expanded ? '▲ Click to collapse' : '▼ Click for details'}
        </div>
      )}
    </div>
  )
}

function DetailPill({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: '8px', padding: '8px 14px', minWidth: '80px',
    }}>
      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.9rem', color }}>
        {value}
      </div>
    </div>
  )
}

const cardStyles = {
  card: {
    padding: '16px 20px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
  },
  errorCard: {
    borderColor: 'rgba(255,77,109,0.2)',
    background: 'rgba(255,77,109,0.03)',
  },
  notifiedCard: {
    borderColor: 'rgba(0,255,157,0.15)',
  },
  topRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: '8px',
  },
  ticker: {
    fontFamily: 'var(--font-mono)', fontWeight: '700',
    fontSize: '1.05rem', color: 'var(--accent-green)',
  },
  sourceBadge: {
    fontSize: '0.68rem', color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
  },
  alertBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '0.65rem', color: 'var(--accent-yellow)',
    background: 'rgba(255,214,10,0.1)', border: '1px solid rgba(255,214,10,0.25)',
    borderRadius: '100px', padding: '2px 10px',
    fontFamily: 'var(--font-mono)', fontWeight: '700', letterSpacing: '0.05em',
  },
  notifiedBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '0.68rem', color: 'var(--accent-green)',
    fontFamily: 'var(--font-mono)', fontWeight: '600',
  },
  errorBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '0.68rem', color: 'var(--accent-red)',
    fontFamily: 'var(--font-mono)', fontWeight: '600',
  },
  time: {
    fontSize: '0.7rem', color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
  },
  headlineRow: {
    display: 'flex', gap: '8px', alignItems: 'flex-start',
    marginTop: '8px', padding: '8px 12px',
    background: 'rgba(78,168,222,0.04)', borderRadius: '8px',
    border: '1px solid rgba(78,168,222,0.1)',
  },
  headline: {
    fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5',
  },
  errorMsg: {
    display: 'flex', gap: '8px', alignItems: 'flex-start',
    marginTop: '8px', fontSize: '0.78rem', color: 'var(--accent-red)',
  },
  details: {
    marginTop: '14px', paddingTop: '14px',
    borderTop: '1px solid var(--border-color)',
  },
  detailGrid: {
    display: 'flex', gap: '10px', flexWrap: 'wrap',
  },
}

const styles = {
  page: { minHeight: 'calc(100vh - 90px)', padding: '32px 24px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
  },
  statsRow: {
    display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px',
  },
  statPill: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: '100px', padding: '6px 14px',
    fontSize: '0.75rem', color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  filterRow: {
    display: 'flex', gap: '16px', alignItems: 'center',
    marginBottom: '20px', flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  filterLabel: {
    fontSize: '0.72rem', color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
    letterSpacing: '0.1em', whiteSpace: 'nowrap',
  },
  filterPills: { display: 'flex', gap: '4px', flexWrap: 'wrap' },
  pill: {
    padding: '5px 12px', border: '1px solid var(--border-color)',
    borderRadius: '100px', background: 'transparent',
    color: 'var(--text-muted)', fontSize: '0.68rem',
    fontFamily: 'var(--font-mono)', fontWeight: '700', cursor: 'pointer',
    transition: 'all 0.15s', letterSpacing: '0.05em',
  },
  pillActive: {
    background: 'var(--accent-green-dim)', border: '1px solid var(--accent-green)',
    color: 'var(--accent-green)',
  },
  emptyState: {
    padding: '80px 40px', textAlign: 'center', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
  },
}
