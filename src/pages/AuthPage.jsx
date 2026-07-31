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

  const { login, register, loginWithGoogle } = useAuth()
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
          <span style={styles.logoText}>Nifty<span style={{ color: 'var(--accent-green)' }}>Buddy</span></span>
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

        {/* Google Sign-In Button */}
        <button
          id="google-signin-btn"
          type="button"
          style={styles.googleBtn}
          onClick={loginWithGoogle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>
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
    background: 'none', border: 'none',
    color: 'var(--accent-green)', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: '600',
  },
  googleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    width: '100%', padding: '12px 20px',
    background: '#fff', border: '1px solid #dadce0',
    borderRadius: '8px', cursor: 'pointer',
    fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: '600',
    color: '#3c4043', transition: 'box-shadow 0.2s, background 0.2s',
    marginBottom: '4px',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0',
  },
  dividerLine: { flex: 1, height: '1px', background: 'var(--border-color)' },
  dividerText: { fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' },
}
