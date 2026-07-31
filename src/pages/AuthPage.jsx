import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { TrendingUp, Eye, EyeOff, Mail, Phone, User, Lock, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'

export default function AuthPage() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') === 'register' ? 'register' : 'login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPass, setRegPass] = useState('')
  const [regChannel, setRegChannel] = useState('email')

  const { login, register } = useAuth()
  const { showToast } = useNotifications()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(loginEmail, loginPass)
      showToast('Welcome back!', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!regName || !regEmail || !regPass) {
      setError('Name, email and password are required.')
      return
    }
    if (regPass.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const result = await register({
        name: regName, email: regEmail, phone: regPhone,
        password: regPass, notifyChannel: regChannel,
      })
      if (result?.emailConfirmationRequired) {
        showToast('Check your email to confirm your account, then sign in.', 'info', 8000)
        setTab('login')
        setLoginEmail(regEmail)
      } else {
        showToast('Account created! Welcome to NiftyBuddy 🎉', 'success')
        navigate('/dashboard')
      }
    } catch (err) {
      // Friendly message for Supabase email rate limit
      if (err.message?.toLowerCase().includes('email rate limit') ||
          err.message?.toLowerCase().includes('rate limit exceeded') ||
          err.message?.toLowerCase().includes('over_email_send_rate_limit')) {
        setError('Too many signup attempts. In Supabase Dashboard → Authentication → Providers → Email → turn OFF "Confirm email", then try again.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Background glow */}
      <div style={styles.bgGlow} />
      <div style={styles.bgGlow2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}><TrendingUp size={20} color="#080a0f" /></div>
          <span style={styles.logoText}>StockCheck <span style={{ color: 'var(--accent-green)' }}>AI</span></span>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === 'login' ? styles.tabActive : {}) }}
            onClick={() => { setTab('login'); setError('') }}
          >
            Sign In
          </button>
          <button
            style={{ ...styles.tab, ...(tab === 'register' ? styles.tabActive : {}) }}
            onClick={() => { setTab('register'); setError('') }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}

        {/* ─ Login Form ─ */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.formGroup}>
              <label className="form-label">Email Address</label>
              <div style={styles.inputWrap}>
                <Mail size={15} style={styles.inputIcon} />
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label className="form-label">Password</label>
              <div style={styles.inputWrap}>
                <Lock size={15} style={styles.inputIcon} />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p style={styles.switchText}>
              Don't have an account?{' '}
              <button type="button" style={styles.switchLink} onClick={() => setTab('register')}>
                Create one free
              </button>
            </p>
          </form>
        )}

        {/* ─ Register Form ─ */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.formGroup}>
              <label className="form-label">Full Name</label>
              <div style={styles.inputWrap}>
                <User size={15} style={styles.inputIcon} />
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Sumresh Nair"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label className="form-label">Email Address</label>
              <div style={styles.inputWrap}>
                <Mail size={15} style={styles.inputIcon} />
                <input
                  id="reg-email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label className="form-label">
                Phone / WhatsApp <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>(for alerts)</span>
              </label>
              <div style={styles.inputWrap}>
                <Phone size={15} style={styles.inputIcon} />
                <input
                  id="reg-phone"
                  type="tel"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                  placeholder="+91 98765 43210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label className="form-label">Password</label>
              <div style={styles.inputWrap}>
                <Lock size={15} style={styles.inputIcon} />
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  placeholder="Create a strong password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button type="button" style={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Notification Channel */}
            <div style={styles.formGroup}>
              <label className="form-label">
                <Bell size={12} style={{ marginRight: '4px' }} />
                Preferred Alert Channel
              </label>
              <div style={styles.channelGrid}>
                {['email', 'whatsapp', 'both'].map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    id={`channel-${ch}`}
                    style={{
                      ...styles.channelBtn,
                      ...(regChannel === ch ? styles.channelBtnActive : {}),
                    }}
                    onClick={() => setRegChannel(ch)}
                  >
                    {ch === 'email' && '📧 Email'}
                    {ch === 'whatsapp' && '📱 WhatsApp'}
                    {ch === 'both' && '🔔 Both'}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>

            <p style={styles.switchText}>
              Already have an account?{' '}
              <button type="button" style={styles.switchLink} onClick={() => setTab('login')}>
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'fixed',
    top: '-200px',
    left: '-200px',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,255,157,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'fixed',
    bottom: '-200px',
    right: '-200px',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(191,90,242,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: 'var(--shadow-elevated)',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeInUp 0.5s ease',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '32px',
    justifyContent: 'center',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'var(--accent-green)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--accent-green-glow)',
  },
  logoText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.3rem',
    fontWeight: '700',
  },
  tabs: {
    display: 'flex',
    background: 'var(--bg-surface)',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '28px',
    gap: '4px',
  },
  tab: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-card)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute',
    right: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '2px',
  },
  channelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  channelBtn: {
    padding: '10px 6px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-body)',
  },
  channelBtnActive: {
    border: '1px solid var(--accent-green)',
    background: 'var(--accent-green-dim)',
    color: 'var(--accent-green)',
  },
  errorBox: {
    background: 'var(--accent-red-dim)',
    border: '1px solid rgba(255,77,109,0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '4px',
  },
  switchText: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    marginTop: '4px',
  },
  switchLink: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-green)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
}
