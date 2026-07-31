import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, Plus, Trash2, Search, BarChart2, MessageSquare, Briefcase, RefreshCw, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import {
  fetchWishlist, addToWishlist, removeFromWishlist,
  getLocalWishlist, addLocalWishlist, removeLocalWishlist,
} from '../utils/wishlist'

export default function WishlistPage() {
  const { user } = useAuth()
  const { showToast } = useNotifications()
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [addInput, setAddInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { loadWishlist() }, [user?.id])

  const loadWishlist = async () => {
    setLoading(true)
    try {
      if (user?.id) {
        const { data, error } = await fetchWishlist(user.id)
        if (error) throw error
        setItems(data || [])
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
    const t = addInput.trim().toUpperCase()
    if (!t) return
    if (items.find((i) => i.ticker === t)) {
      showToast(`${t} is already in your wishlist.`, 'error'); return
    }
    setAdding(true)
    try {
      if (user?.id) {
        const { data, error } = await addToWishlist(user.id, t)
        if (error) throw error
        setItems((prev) => [data, ...prev])
      } else {
        setItems(addLocalWishlist(t))
      }
      showToast(`${t} added to wishlist ⭐`, 'success')
      setAddInput('')
    } catch (err) {
      // Handle unique constraint (already exists)
      if (err.message?.includes('unique') || err.code === '23505') {
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
        await removeFromWishlist(user.id, ticker)
        setItems((prev) => prev.filter((i) => i.ticker !== ticker))
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
              Track stocks you're interested in. Quickly analyze or add them to your portfolio.
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={loadWishlist}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Add Stock Bar */}
        <form onSubmit={handleAdd} style={styles.addBar}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Star size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-yellow)' }} />
            <input
              id="wishlist-add-input"
              type="text"
              className="form-input"
              style={{ paddingLeft: '40px', textTransform: 'uppercase' }}
              placeholder="Add a ticker — e.g. TCS, INFY, HDFC"
              value={addInput}
              onChange={(e) => setAddInput(e.target.value.toUpperCase())}
            />
          </div>
          <button
            id="wishlist-add-btn"
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={adding || !addInput.trim()}
          >
            <Plus size={14} /> {adding ? 'Adding...' : 'Add'}
          </button>
        </form>

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
                ? 'Add NSE tickers above to start tracking stocks you\'re interested in.'
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
  const addedDate = item.added_at
    ? new Date(item.added_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    : ''

  return (
    <div style={cardStyles.card} className="glass-card">
      <div style={cardStyles.left}>
        <div style={cardStyles.ticker}>{item.ticker}</div>
        {addedDate && (
          <div style={cardStyles.date}>Added {addedDate}</div>
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
  left: { display: 'flex', flexDirection: 'column', gap: '2px' },
  ticker: {
    fontFamily: 'var(--font-mono)', fontWeight: '700',
    fontSize: '1.1rem', color: 'var(--accent-green)',
  },
  date: { fontSize: '0.72rem', color: 'var(--text-muted)' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
}

const styles = {
  page: { minHeight: 'calc(100vh - 90px)', padding: '32px 24px' },
  container: { maxWidth: '900px', margin: '0 auto' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
  },
  addBar: {
    display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'stretch',
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
