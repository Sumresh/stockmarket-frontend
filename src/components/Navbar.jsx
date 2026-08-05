import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  TrendingUp, LayoutDashboard, Briefcase, Bell,
  Settings, LogOut, User, ChevronDown, Menu, X, Star, FileText, Search
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import GlobalSearch from './GlobalSearch'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropRef = useRef(null)

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setDropOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/dashboard',     label: 'Dashboard',  icon: LayoutDashboard },
    { to: '/portfolio',     label: 'Portfolio',   icon: Briefcase },
    { to: '/wishlist',      label: 'Wishlist',    icon: Star },
    { to: '/notifications', label: 'Alerts',      icon: Bell, badge: unreadCount },
    { to: '/decision-log',  label: 'Log',         icon: FileText },
    { to: '/settings',      label: 'Settings',    icon: Settings },
  ]

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.container} className="nav-container">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} style={styles.logo}>
            <div style={styles.logoIcon}><TrendingUp size={18} color="#080a0f" /></div>
            <span style={styles.logoText}>
              Nifty<span style={{ color: 'var(--accent-green)' }}>Buddy</span>
            </span>
          </Link>

          {/* Desktop Nav Links — hidden on mobile via CSS class */}
          {user && (
            <div style={styles.navLinks} className="nav-desktop-links">
              {navLinks.map(({ to, label, icon: Icon, badge }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    ...styles.navLink,
                    ...(location.pathname.startsWith(to) ? styles.navLinkActive : {}),
                  }}
                >
                  <Icon size={15} />
                  {label}
                  {badge > 0 && <span style={styles.navBadge}>{badge}</span>}
                </Link>
              ))}
            </div>
          )}

          {/* Global Search Trigger */}
          {user && (
            <button
              className="nav-search-trigger"
              style={styles.searchTrigger}
              onClick={() => setSearchOpen(true)}
              aria-label="Search stocks"
            >
              <Search size={14} />
              <span className="nav-search-text">Search stocks...</span>
              <kbd className="nav-search-kbd">Ctrl K</kbd>
            </button>
          )}

          {/* Right Side */}
          <div style={styles.right}>
            {user ? (
              <>
                {/* Avatar / user dropdown */}
                <div style={{ position: 'relative' }} ref={dropRef}>
                  <button style={styles.userBtn} onClick={() => setDropOpen(!dropOpen)}>
                    <div style={styles.avatar}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span style={styles.userName} className="nav-username">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      style={{
                        color: 'var(--text-muted)',
                        transition: 'transform 0.2s',
                        transform: dropOpen ? 'rotate(180deg)' : 'none',
                      }}
                    />
                  </button>

                  {dropOpen && (
                    <div style={styles.dropdown}>
                      <div style={styles.dropHeader}>
                        <div style={styles.dropName}>{user.name}</div>
                        <div style={styles.dropEmail}>{user.email}</div>
                      </div>
                      <div style={styles.dropDivider} />
                      <button style={styles.dropItem} onClick={() => { navigate('/settings'); setDropOpen(false) }}>
                        <User size={14} /> Profile &amp; Settings
                      </button>
                      <button style={styles.dropItem} onClick={() => { navigate('/wishlist'); setDropOpen(false) }}>
                        <Star size={14} /> My Wishlist
                      </button>
                      <div style={styles.dropDivider} />
                      <button style={{ ...styles.dropItem, color: 'var(--accent-red)' }} onClick={handleLogout}>
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Hamburger — shown on mobile via CSS */}
                <button
                  className="nav-menu-btn"
                  style={styles.menuBtn}
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Toggle menu"
                >
                  {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/auth" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/auth?tab=register" className="btn btn-primary btn-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>

        {/* Live NSE status bar */}
        <div style={styles.statusBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
              NSE LIVE
            </span>
          </div>
          <div
            className="status-bar-tickers"
            style={{ display: 'flex', gap: '16px', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            <span>NIFTY 50 <span style={{ color: 'var(--accent-green)' }}>▲ 0.42%</span></span>
            <span>SENSEX <span style={{ color: 'var(--accent-green)' }}>▲ 0.38%</span></span>
            <span>BANK NIFTY <span style={{ color: 'var(--accent-red)' }}>▼ 0.12%</span></span>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-down Menu */}
      {menuOpen && user && (
        <div style={styles.mobileMenu}>
          {navLinks.map(({ to, label, icon: Icon, badge }) => (
            <Link
              key={to}
              to={to}
              style={{
                ...styles.mobileNavLink,
                ...(location.pathname.startsWith(to) ? styles.mobileNavLinkActive : {}),
              }}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge > 0 && <span style={styles.navBadge}>{badge}</span>}
            </Link>
          ))}
          <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />
          <button
            style={{ ...styles.mobileNavLink, border: 'none', cursor: 'pointer', color: 'var(--accent-red)', width: '100%' }}
            onClick={handleLogout}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      )}

      {/* Global Search Overlay */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(8, 10, 15, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  container: {
    maxWidth: '1280px', margin: '0 auto',
    padding: '0 24px', height: '60px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '16px',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    textDecoration: 'none', flexShrink: 0,
  },
  logoIcon: {
    width: '32px', height: '32px', background: 'var(--accent-green)',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'var(--accent-green-glow)', flexShrink: 0,
  },
  logoText: {
    fontFamily: 'var(--font-mono)', fontSize: '1.1rem',
    fontWeight: '700', color: 'var(--text-primary)',
  },
  navLinks: {
    display: 'flex', alignItems: 'center', gap: '2px', flex: 1,
  },
  navLink: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '7px 12px', borderRadius: '8px',
    color: 'var(--text-secondary)', fontSize: '0.78rem',
    fontWeight: '600', textDecoration: 'none',
    transition: 'all 0.2s', position: 'relative', whiteSpace: 'nowrap',
  },
  navLinkActive: { color: 'var(--accent-green)', background: 'var(--accent-green-dim)' },
  searchTrigger: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
    borderRadius: '8px', padding: '7px 14px',
    cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem',
    transition: 'all 0.2s', flexShrink: 0, marginLeft: 'auto',
  },
  navBadge: {
    background: 'var(--accent-red)', color: 'white',
    fontSize: '0.6rem', fontWeight: '700', padding: '1px 5px',
    borderRadius: '100px', minWidth: '16px', textAlign: 'center',
  },
  right: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
  userBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: '100px', padding: '5px 12px 5px 5px',
    cursor: 'pointer', color: 'var(--text-primary)', transition: 'border-color 0.2s',
  },
  avatar: {
    width: '28px', height: '28px', borderRadius: '50%',
    background: 'var(--accent-green)', color: '#080a0f',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: '800', fontFamily: 'var(--font-mono)',
  },
  userName: { fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
    borderRadius: '12px', boxShadow: 'var(--shadow-elevated)',
    minWidth: '220px', overflow: 'hidden', zIndex: 200,
    animation: 'fadeInUp 0.2s ease',
  },
  dropHeader: { padding: '14px 16px', background: 'var(--bg-surface)' },
  dropName: { fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' },
  dropEmail: { fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' },
  dropDivider: { height: '1px', background: 'var(--border-color)' },
  dropItem: {
    display: 'flex', alignItems: 'center', gap: '8px',
    width: '100%', padding: '12px 16px',
    background: 'none', border: 'none',
    color: 'var(--text-secondary)', fontSize: '0.85rem',
    cursor: 'pointer', transition: 'background 0.15s, color 0.15s', textAlign: 'left',
  },
  menuBtn: {
    display: 'none',   // shown via CSS .nav-menu-btn { display: flex } at ≤768px
    background: 'none', border: 'none',
    color: 'var(--text-primary)', cursor: 'pointer', padding: '6px',
    borderRadius: '8px', alignItems: 'center', justifyContent: 'center',
  },
  statusBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '3px 24px', background: 'rgba(0,0,0,0.3)',
    borderTop: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', gap: '8px',
  },
  mobileMenu: {
    position: 'fixed', top: '86px', left: 0, right: 0,
    background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
    zIndex: 90, padding: '8px 0', animation: 'fadeInUp 0.2s ease',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  },
  mobileNavLink: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px 20px', color: 'var(--text-secondary)',
    fontSize: '0.95rem', fontWeight: '600', textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s', background: 'none',
  },
  mobileNavLinkActive: { color: 'var(--accent-green)', background: 'var(--accent-green-dim)' },
}
