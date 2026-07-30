import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  TrendingUp, LayoutDashboard, Briefcase, Bell, Settings,
  LogOut, User, ChevronDown, Menu, X, Zap
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { to: '/notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.container}>
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} style={styles.logo}>
            <div style={styles.logoIcon}><TrendingUp size={18} color="#080a0f" /></div>
            <span style={styles.logoText}>Stock<span style={{ color: 'var(--accent-green)' }}>Check</span></span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div style={styles.navLinks}>
              {navLinks.map(({ to, label, icon: Icon, badge }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    ...styles.navLink,
                    ...(location.pathname === to ? styles.navLinkActive : {}),
                  }}
                >
                  <Icon size={15} />
                  {label}
                  {badge > 0 && <span style={styles.navBadge}>{badge}</span>}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div style={styles.right}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button style={styles.userBtn} onClick={() => setDropOpen(!dropOpen)}>
                  <div style={styles.avatar}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={styles.userName}>{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                {dropOpen && (
                  <div style={styles.dropdown} onClick={() => setDropOpen(false)}>
                    <div style={styles.dropHeader}>
                      <div style={styles.dropName}>{user.name}</div>
                      <div style={styles.dropEmail}>{user.email}</div>
                    </div>
                    <div style={styles.dropDivider} />
                    <button style={styles.dropItem} onClick={() => navigate('/settings')}>
                      <User size={14} /> Profile & Settings
                    </button>
                    <button style={styles.dropItem} onClick={handleLogout}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to="/auth" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/auth?tab=register" className="btn btn-primary btn-sm">Get Started</Link>
              </div>
            )}
            {user && (
              <button style={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Live status bar */}
        <div style={styles.statusBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
              NSE LIVE
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>NIFTY 50 <span style={{ color: 'var(--accent-green)' }}>▲ 0.42%</span></span>
            <span>SENSEX <span style={{ color: 'var(--accent-green)' }}>▲ 0.38%</span></span>
            <span>BANK NIFTY <span style={{ color: 'var(--accent-red)' }}>▼ 0.12%</span></span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && user && (
        <div style={styles.mobileMenu}>
          {navLinks.map(({ to, label, icon: Icon, badge }) => (
            <Link
              key={to}
              to={to}
              style={styles.mobileNavLink}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={16} />
              {label}
              {badge > 0 && <span style={styles.navBadge}>{badge}</span>}
            </Link>
          ))}
          <button style={{ ...styles.mobileNavLink, border: 'none', cursor: 'pointer', color: 'var(--accent-red)' }} onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}
    </>
  )
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(8, 10, 15, 0.92)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: 'var(--accent-green)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--accent-green-glow)',
  },
  logoText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s',
    position: 'relative',
  },
  navLinkActive: {
    color: 'var(--accent-green)',
    background: 'var(--accent-green-dim)',
  },
  navBadge: {
    background: 'var(--accent-red)',
    color: 'white',
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '1px 6px',
    borderRadius: '100px',
    minWidth: '18px',
    textAlign: 'center',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '100px',
    padding: '6px 14px 6px 6px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'border-color 0.2s',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--accent-green)',
    color: '#080a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '800',
    fontFamily: 'var(--font-mono)',
  },
  userName: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-elevated)',
    minWidth: '220px',
    overflow: 'hidden',
    zIndex: 200,
    animation: 'fadeInUp 0.2s ease',
  },
  dropHeader: {
    padding: '14px 16px',
    background: 'var(--bg-surface)',
  },
  dropName: {
    fontWeight: '700',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
  },
  dropEmail: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  dropDivider: {
    height: '1px',
    background: 'var(--border-color)',
  },
  dropItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    textAlign: 'left',
  },
  menuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '4px',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 24px',
    background: 'rgba(0,0,0,0.3)',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    flexWrap: 'wrap',
    gap: '8px',
  },
  mobileMenu: {
    position: 'fixed',
    top: '90px',
    left: 0,
    right: 0,
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-color)',
    zIndex: 90,
    padding: '12px 0',
    animation: 'fadeInUp 0.2s ease',
  },
  mobileNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'background 0.15s',
    background: 'none',
    width: '100%',
  },
}
