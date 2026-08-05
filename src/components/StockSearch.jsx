import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import NSE_STOCKS from '../data/nse-stocks'

/**
 * StockSearch — Reusable autocomplete input for NSE stock tickers.
 *
 * Props:
 *   value        — controlled value (the ticker symbol string)
 *   onChange      — called with the ticker string on every keystroke
 *   onSelect      — called with { symbol, name, isin } when user picks from dropdown
 *   placeholder   — input placeholder text
 *   id            — HTML id for the input
 *   disabled      — disable the input
 *   autoFocus     — auto-focus the input on mount
 */
export default function StockSearch({
  value = '',
  onChange,
  onSelect,
  placeholder = 'e.g. TCS, RELIANCE, INFY',
  id,
  disabled = false,
  autoFocus = false,
}) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const wrapRef = useRef(null)
  const listRef = useRef(null)

  const query = value.trim().toLowerCase()

  // Filter stocks — match by symbol prefix OR name substring
  const results = query.length >= 1
    ? NSE_STOCKS.filter((s) => {
        const sym = s.symbol.toLowerCase()
        const name = s.name.toLowerCase()
        return sym.startsWith(query) || sym.includes(query) || name.includes(query)
      }).slice(0, 12) // Cap at 12 results
    : []

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted]
      if (item) item.scrollIntoView({ block: 'nearest' })
    }
  }, [highlighted])

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((prev) => (prev <= 0 ? results.length - 1 : prev - 1))
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault()
      handleSelect(results[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const handleSelect = (stock) => {
    onChange?.(stock.symbol)
    onSelect?.(stock)
    setOpen(false)
    setHighlighted(-1)
  }

  return (
    <div ref={wrapRef} style={styles.wrapper}>
      <div style={styles.inputWrap}>
        <Search size={15} style={styles.icon} />
        <input
          id={id}
          type="text"
          className="form-input"
          style={{ paddingLeft: '38px', textTransform: 'uppercase' }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange?.(e.target.value)
            setOpen(true)
            setHighlighted(-1)
          }}
          onFocus={() => query.length >= 1 && setOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div ref={listRef} style={styles.dropdown} className="glass-card">
          {results.map((stock, i) => (
            <div
              key={stock.symbol + stock.isin}
              style={{
                ...styles.item,
                background: i === highlighted ? 'rgba(0,255,157,0.1)' : 'transparent',
              }}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={(e) => {
                e.preventDefault() // Prevent blur before click registers
                handleSelect(stock)
              }}
            >
              <span style={styles.itemSymbol}>{stock.symbol}</span>
              <span style={styles.itemName}>{stock.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrapper: {
    position: 'relative',
    width: '100%',
  },
  inputWrap: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    maxHeight: '280px',
    overflowY: 'auto',
    zIndex: 100,
    padding: '4px',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    background: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  itemSymbol: {
    fontFamily: 'var(--font-mono)',
    fontWeight: '700',
    fontSize: '0.88rem',
    color: 'var(--accent-green)',
    minWidth: '100px',
  },
  itemName: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}
