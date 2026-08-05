import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Command, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react'
import NSE_STOCKS from '../data/nse-stocks'

/**
 * GlobalSearch — Ctrl+K / Cmd+K command-palette style search overlay.
 *
 * Props:
 *   isOpen    — controlled open state
 *   onClose   — called when overlay should close
 */
export default function GlobalSearch({ isOpen, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)

  // Filter stocks
  const q = query.trim().toLowerCase()
  const results = q.length >= 1
    ? NSE_STOCKS.filter((s) => {
        const sym = s.symbol.toLowerCase()
        const name = s.name.toLowerCase()
        return sym.startsWith(q) || sym.includes(q) || name.includes(q)
      }).slice(0, 10)
    : []

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setHighlighted(0)
      // Small delay to let the overlay render before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted]
      if (item) item.scrollIntoView({ block: 'nearest' })
    }
  }, [highlighted])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSelect = useCallback((stock) => {
    onClose()
    setQuery('')
    navigate(`/verdict/${stock.symbol}`)
  }, [navigate, onClose])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((prev) => (prev <= 0 ? results.length - 1 : prev - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[highlighted]) {
        handleSelect(results[highlighted])
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div
        className="global-search-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="global-search-input-wrap">
          <Search size={20} className="global-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="global-search-input"
            placeholder="Search NSE stocks by ticker or name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setHighlighted(0)
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="global-search-kbd">ESC</kbd>
        </div>

        {/* Results */}
        {q.length >= 1 && (
          <div className="global-search-results" ref={listRef}>
            {results.length > 0 ? (
              results.map((stock, i) => (
                <button
                  key={stock.symbol + stock.isin}
                  className={`global-search-item ${i === highlighted ? 'highlighted' : ''}`}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => handleSelect(stock)}
                >
                  <div className="global-search-item-left">
                    <span className="global-search-item-symbol">{stock.symbol}</span>
                    <span className="global-search-item-name">{stock.name}</span>
                  </div>
                  <ArrowRight size={14} className="global-search-item-arrow" />
                </button>
              ))
            ) : (
              <div className="global-search-empty">
                No stocks found for "<strong>{query}</strong>"
              </div>
            )}
          </div>
        )}

        {/* Footer hints */}
        <div className="global-search-footer">
          <div className="global-search-hint">
            <ArrowUp size={12} />
            <ArrowDown size={12} />
            <span>Navigate</span>
          </div>
          <div className="global-search-hint">
            <CornerDownLeft size={12} />
            <span>Select</span>
          </div>
          <div className="global-search-hint">
            <kbd>ESC</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  )
}
