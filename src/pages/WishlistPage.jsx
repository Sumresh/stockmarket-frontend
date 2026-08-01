import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, Plus, Trash2, Search, BarChart2, MessageSquare, Briefcase, RefreshCw, Target } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { getWishlist as apiGetWishlist, addWishlistItem, deleteWishlistItem } from '../utils/api'
import { getLocalWishlist, addLocalWishlist, removeLocalWishlist } from '../utils/wishlist'

export default function WishlistPage() {
  const { user } = useAuth()
  const { showToast } = useNotifications()
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [addTicker, setAddTicker] = useState('')
  const [addTargetPrice, setAddTargetPrice] = useState('')
  const [addNotes, setAddNotes] = useState('')
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => { loadWishlist() }, [user?.id])

  const loadWishlist = async () => {
    setLoading(true)
    try {
      if (user?.id) {
        const data = await apiGetWishlist()
        setItems(data.wishlist || [])
      } else {
        setItems(getLocalWishlist())
      }
    } catch {
      setItems(getLocalWishlist())
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const t = addTicker.trim().toUpperCase()
    if (!t) return
    if (items.find((i) => i.ticker === t)) {
      showToast(`${t} is already in your wishlist.`, 'error'); return
    }
    setAdding(true)
    try {
      if (user?.id) {
        const data = await addWishlistItem(
          t,
          addTargetPrice ? parseFloat(addTargetPrice) : null,
          addNotes || null,
        )
        setItems((prev) => [data.item || data, ...prev])
      } else {
        setItems(addLocalWishlist(t))
      }
      showToast(`${t} added to wishlist ⭐`, 'success')
      setAddTicker('')
      setAddTargetPrice('')
      setAddNotes('')
      setShowAddForm(false)
    } catch (err) {
      if (err.message?.includes('unique') || err.response?.status === 409) {
        showToast(`${t} is already in your wishlist.`, 'error')
      } else {
        showToast('Failed to add. Check connection.', 'error')
      }
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (ticker) => {
    try {
      if (user?.id) {
        await deleteWishlistItem(ticker)
        setItems((prev) => prev.filter((i) => i.ticker !== ticker.toUpperCase()))
      } else {
        setItems(removeLocalWishlist(ticker))
      }
      showToast(`${ticker} removed from wishlist.`, 'success')
    } catch {
      showToast('Failed to remove.', 'error')
    }
  }

  const filtered = items.filter((i) =>
    !search || i.ticker.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.page} className="page-pad">
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div className="section-heading">Watchlist</div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', marginTop: '6px' }}>
              <Star size={24} color="var(--accent-yellow)" style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              My Wishlist
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Track stocks you're interested in. Set target prices and get notified on entry opportunities.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost btn-sm" onClick={loadWishlist}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={14} /> Add Stock
            </button>
          </div>
        </div>

        {/* Add Stock Form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="glass-card" style={styles.addForm}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: '1 1 160px', minWidth: '160px' }}>
                <label className="form-label">NSE Ticker *</label>
                <input
                  id="wishlist-add-input"
                  type="text"
                  className="form-input"
                  style={{ textTransform: 'uppercase' }}
                  placeholder="e.g. TCS, INFY"
                  value={addTicker}
                  onChange={(e) => setAddTicker(e.target.value.toUpperCase())}
                />
              </div>
              <div className="form-group" style={{ flex: '1 1 140px', minWidth: '140px' }}>
                <label className="form-label">
                  <Target size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Target Price (₹)
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 3200"
                  value={addTargetPrice}
                  onChange={(e) => setAddTargetPrice(e.target.value)}
                  min="0.01"
                  step="any"
                />
              </div>
              <div className="form-group" style={{ flex: '2 1 200px', minWidth: '200px' }}>
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Watch for Q2 results"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                />
              </div>
              <button
                id="wishlist-add-btn"
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={adding || !addTicker.trim()}
                style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
              >
                <Plus size={14} /> {adding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        )}

        {/* Search */}
        {items.length > 4 && (
          <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '300px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.82rem' }}
              placeholder="Search watchlist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={styles.empty}>
            <Star size={40} color="var(--accent-yellow)" style={{ opacity: 0.4 }} />
            <h3 style={{ fontFamily: 'var(--font-mono)', marginTop: '14px' }}>
              {items.length === 0 ? 'Your wishlist is empty' : 'No results found'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
              {items.length === 0
                ? 'Click "Add Stock" above to start tracking stocks you\'re interested in.'
                : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((item) => (
              <WishlistCard
                key={item.ticker}
                item={item}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        {!user?.id && items.length > 0 && (
          <div style={styles.loginPrompt}>
            <span>⚠️ Your wishlist is saved locally.</span>
            <Link to="/auth" style={{ color: 'var(--accent-green)', fontWeight: '600', fontSize: '0.82rem' }}>
              Sign in to sync across devices →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function WishlistCard({ item, onRemove }) {
  const navigate = useNavigate()
  const addedDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    : ''

  return (
    <div style={cardStyles.card} className="glass-card">
      <div style={cardStyles.left}>
        <div style={cardStyles.ticker}>{item.ticker}</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {addedDate && (
            <div style={cardStyles.date}>Added {addedDate}</div>
          )}
          {item.target_price && (
            <div style={cardStyles.targetBadge}>
              <Target size={10} /> Target: ₹{item.target_price}
            </div>
          )}
        </div>
        {item.notes && (
          <div style={cardStyles.notes}>{item.notes}</div>
        )}
      </div>

      <div style={cardStyles.actions}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/verdict/${item.ticker}`)}
          title="Get AI analysis"
        >
          <BarChart2 size={13} /> Analyze
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/chat/${item.ticker}`)}
          title="Chat with AI"
        >
          <MessageSquare size={13} />
        </button>
        <Link
          to="/portfolio"
          className="btn btn-ghost btn-sm"
          title="Add to portfolio"
        >
          <Briefcase size={13} />
        </Link>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onRemove(item.ticker)}
          title="Remove"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

const cardStyles = {
  card: {
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  left: { display: 'flex', flexDirection: 'column', gap: '4px' },
  ticker: {
    fontFamily: 'var(--font-mono)', fontWeight: '700',
    fontSize: '1.1rem', color: 'var(--accent-green)',
  },
  date: { fontSize: '0.72rem', color: 'var(--text-muted)' },
  targetBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '0.72rem', color: 'var(--accent-yellow)',
    background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.2)',
    borderRadius: '100px', padding: '2px 10px',
    fontFamily: 'var(--font-mono)', fontWeight: '600',
  },
  notes: {
    fontSize: '0.78rem', color: 'var(--text-muted)',
    fontStyle: 'italic', marginTop: '2px',
  },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
}

const styles = {
  page: { minHeight: 'calc(100vh - 90px)', padding: '32px 24px' },
  container: { maxWidth: '900px', margin: '0 auto' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
  },
  addForm: {
    padding: '20px 24px',
    marginBottom: '20px',
  },
  empty: {
    padding: '80px 40px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  loginPrompt: {
    marginTop: '20px',
    display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap',
    background: 'var(--accent-yellow-dim)', border: '1px solid rgba(255,214,10,0.2)',
    borderRadius: '10px', padding: '14px 18px',
    fontSize: '0.82rem', color: 'var(--text-muted)',
  },
}
