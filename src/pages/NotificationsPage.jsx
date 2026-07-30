import { useState } from 'react'
import { Bell, BellOff, Trash2, CheckCheck, Search, Filter } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import SignalBadge from '../components/SignalBadge'

const FILTERS = ['ALL', 'BUY', 'SELL', 'HOLD', 'ACCUMULATE']

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead, clearAll, unreadCount } = useNotifications()
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const filtered = notifications.filter((n) => {
    const matchFilter = filter === 'ALL' || n.type?.toUpperCase() === filter
    const matchSearch = !search || n.ticker?.toLowerCase().includes(search.toLowerCase()) || n.message?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const formatDate = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div className="section-heading">Alerts & Signals</div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', marginTop: '6px' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={styles.unreadBadge}>{unreadCount} new</span>
              )}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {unreadCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => { if (window.confirm('Clear all notifications?')) clearAll() }}
              >
                <Trash2 size={14} /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filters & Search */}
        <div style={styles.filterRow}>
          {/* Signal type filter */}
          <div style={styles.filterPills}>
            {FILTERS.map((f) => (
              <button
                key={f}
                id={`filter-${f.toLowerCase()}`}
                style={{
                  ...styles.filterPill,
                  ...(filter === f ? styles.filterPillActive : {}),
                }}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '180px', maxWidth: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="notif-search"
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.82rem' }}
              placeholder="Search ticker or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <div style={styles.emptyState} className="glass-card">
            <BellOff size={40} color="var(--text-muted)" />
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', marginTop: '14px' }}>
              {notifications.length === 0 ? 'No notifications yet' : 'No results found'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
              {notifications.length === 0
                ? 'Run a stock analysis or portfolio check to generate signals.'
                : 'Try adjusting your filter or search.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((n) => (
              <div
                key={n.id}
                style={{
                  ...styles.notifCard,
                  ...(n.read ? {} : styles.notifUnread),
                }}
                onClick={() => !n.read && markRead(n.id)}
              >
                {/* Unread dot */}
                {!n.read && <div style={styles.unreadDot} />}

                <div style={styles.notifMain}>
                  <div style={styles.notifTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={styles.notifTicker}>{n.ticker || '—'}</span>
                      {n.type && <SignalBadge action={n.type} />}
                    </div>
                    <span style={styles.notifTime}>{formatDate(n.timestamp)}</span>
                  </div>
                  <p style={styles.notifMsg}>{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: 'calc(100vh - 90px)', padding: '32px 24px' },
  container: { maxWidth: '900px', margin: '0 auto' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
  },
  unreadBadge: {
    display: 'inline-block', marginLeft: '12px',
    background: 'var(--accent-red)', color: 'white',
    fontSize: '0.65rem', fontWeight: '700', padding: '2px 10px',
    borderRadius: '100px', verticalAlign: 'middle', fontFamily: 'var(--font-body)',
  },
  filterRow: {
    display: 'flex', gap: '12px', alignItems: 'center',
    marginBottom: '20px', flexWrap: 'wrap',
  },
  filterPills: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  filterPill: {
    padding: '6px 14px', border: '1px solid var(--border-color)',
    borderRadius: '100px', background: 'transparent',
    color: 'var(--text-muted)', fontSize: '0.72rem',
    fontFamily: 'var(--font-mono)', fontWeight: '700', cursor: 'pointer',
    transition: 'all 0.15s', letterSpacing: '0.05em',
  },
  filterPillActive: {
    background: 'var(--accent-green-dim)', border: '1px solid var(--accent-green)',
    color: 'var(--accent-green)',
  },
  notifCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: '12px', padding: '18px 20px', cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s', position: 'relative',
    display: 'flex', alignItems: 'flex-start', gap: '14px',
  },
  notifUnread: {
    background: 'var(--bg-card-hover)',
    borderColor: 'rgba(0,255,157,0.15)',
  },
  unreadDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: 'var(--accent-green)', flexShrink: 0, marginTop: '6px',
    boxShadow: 'var(--accent-green-glow)',
  },
  notifMain: { flex: 1 },
  notifTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '6px', flexWrap: 'wrap', gap: '8px',
  },
  notifTicker: {
    fontFamily: 'var(--font-mono)', fontWeight: '700',
    fontSize: '1rem', color: 'var(--text-primary)',
  },
  notifTime: {
    fontSize: '0.72rem', color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
  },
  notifMsg: { color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' },
  emptyState: {
    padding: '80px 40px', textAlign: 'center', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
  },
}
