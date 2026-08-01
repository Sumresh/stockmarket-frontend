import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Bell, Lock, Save, Check,
  Eye, EyeOff, Shield, Key, ChevronDown, ChevronUp,
  ExternalLink, Copy, CheckCheck, Loader,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { getSettings, saveSettings } from '../utils/api'

// ── Collapsible Instructions Component ───────────────────────
function ApiKeyGuide({ title, color, steps, link, linkLabel }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: '10px', borderRadius: '10px', border: `1px solid ${color}33`, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: `${color}11`,
          border: 'none', cursor: 'pointer', color: color, fontWeight: '600', fontSize: '0.8rem',
        }}
      >
        <span>📋 How to get your {title}</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && (
        <div style={{ padding: '16px 18px', background: 'var(--bg-surface)' }}>
          <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {steps.map((step, i) => (
              <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.6' }}>
                {step}
              </li>
            ))}
          </ol>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '14px', color: color, fontSize: '0.8rem', fontWeight: '600',
            }}
          >
            {linkLabel} <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  )
}

// ── Copy-to-clipboard helper ──────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      title="Copy"
    >
      {copied ? <CheckCheck size={13} color="var(--accent-green)" /> : <Copy size={13} />}
    </button>
  )
}

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useNotifications()

  // Profile fields (stored in Supabase user_metadata)
  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [cronSecret, setCronSecret] = useState(user?.cronSecret || '')

  // Backend settings (stored in user_settings table via POST /settings)
  const [cohereKey, setCohereKey] = useState('')
  const [newsApiKey, setNewsApiKey] = useState('')
  const [channel, setChannel] = useState('email')
  const [notifyEmailTo, setNotifyEmailTo] = useState('')
  const [notifyWhatsappTo, setNotifyWhatsappTo] = useState('')

  const [showCron, setShowCron] = useState(false)
  const [showCohere, setShowCohere] = useState(false)
  const [showNews, setShowNews] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)

  // Load backend settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await getSettings()
      if (data.cohere_api_key) setCohereKey(data.cohere_api_key)
      if (data.news_api_key) setNewsApiKey(data.news_api_key)
      if (data.notify_channel) setChannel(data.notify_channel)
      if (data.notify_email_to) setNotifyEmailTo(data.notify_email_to)
      if (data.notify_whatsapp_to) setNotifyWhatsappTo(data.notify_whatsapp_to)
    } catch {
      // Settings not configured yet — that's fine
    } finally {
      setLoadingSettings(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      // 1. Save profile fields to Supabase user_metadata
      await updateProfile({ name, phone, notifyChannel: channel, cronSecret })

      // 2. Save API keys + notification prefs to backend user_settings table
      const settingsPayload = {}
      // Only send keys if they don't look like masked values (e.g. "co-...xxxx")
      if (cohereKey && !cohereKey.includes('...')) settingsPayload.cohere_api_key = cohereKey
      if (newsApiKey && !newsApiKey.includes('...')) settingsPayload.news_api_key = newsApiKey
      settingsPayload.notify_channel = channel
      if (notifyEmailTo) settingsPayload.notify_email_to = notifyEmailTo
      if (notifyWhatsappTo) settingsPayload.notify_whatsapp_to = notifyWhatsappTo

      await saveSettings(settingsPayload)

      setSaved(true)
      showToast('Settings saved!', 'success')
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      showToast(`Failed to save: ${err.message}`, 'error')
    }
  }

  return (
    <div style={styles.page} className="page-pad">
      <div style={styles.container}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div className="section-heading">Account</div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', marginTop: '6px' }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage your profile, notifications, and API keys.
          </p>
        </div>

        {loadingSettings ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '40px', justifyContent: 'center' }}>
            <Loader size={20} className="spin-icon" style={{ animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading settings...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* ── Profile ─────────────────────────────── */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={styles.sectionHeader}>
                <User size={18} color="var(--accent-green)" />
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>Profile</h2>
              </div>
              <hr style={styles.divider} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={styles.inputIcon} />
                    <input id="s-name" type="text" className="form-input" style={{ paddingLeft: '38px' }}
                      value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={styles.inputIcon} />
                      <input id="s-email" type="email" className="form-input" style={{ paddingLeft: '38px' }}
                        value={email} readOnly placeholder="you@example.com"
                        title="Email is set via Supabase Auth and cannot be changed here" />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Email is managed by your auth provider</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp / Phone <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>(for alerts)</span></label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={14} style={styles.inputIcon} />
                      <input id="s-phone" type="tel" className="form-input" style={{ paddingLeft: '38px' }}
                        value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Format: +91XXXXXXXXXX</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Alert Preferences ──────────────────── */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={styles.sectionHeader}>
                <Bell size={18} color="var(--accent-yellow)" />
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>Alert Preferences</h2>
              </div>
              <hr style={styles.divider} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label">Preferred Channel</label>
                  <div className="channel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                    {[
                      { id: 'email', label: '📧 Email', desc: notifyEmailTo || email || 'your email' },
                      { id: 'whatsapp', label: '📱 WhatsApp', desc: notifyWhatsappTo || phone || 'your number' },
                      { id: 'console', label: '🖥️ Console', desc: 'Server logs only' },
                    ].map((ch) => (
                      <button
                        key={ch.id} type="button" id={`channel-${ch.id}`}
                        onClick={() => setChannel(ch.id)}
                        style={{
                          padding: '14px 10px', border: `1px solid ${channel === ch.id ? 'var(--accent-green)' : 'var(--border-color)'}`,
                          borderRadius: '10px', background: channel === ch.id ? 'var(--accent-green-dim)' : 'var(--bg-surface)',
                          cursor: 'pointer', textAlign: 'center', position: 'relative',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <div style={{ fontSize: '1.2rem' }}>{ch.label.split(' ')[0]}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: '600', color: channel === ch.id ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                          {ch.label.slice(3)}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{ch.desc}</div>
                        {channel === ch.id && (
                          <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'var(--accent-green)', color: '#080a0f', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={9} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notification recipient addresses */}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      <span style={{ color: 'var(--accent-blue)' }}>●</span> Email Alert Recipient
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={styles.inputIcon} />
                      <input
                        type="email"
                        className="form-input"
                        style={{ paddingLeft: '38px' }}
                        placeholder={email || 'alerts@example.com'}
                        value={notifyEmailTo}
                        onChange={(e) => setNotifyEmailTo(e.target.value)}
                      />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Where alert emails are sent (defaults to your login email)
                    </span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <span style={{ color: 'var(--accent-green)' }}>●</span> WhatsApp Alert Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={14} style={styles.inputIcon} />
                      <input
                        type="tel"
                        className="form-input"
                        style={{ paddingLeft: '38px' }}
                        placeholder="whatsapp:+919876543210"
                        value={notifyWhatsappTo}
                        onChange={(e) => setNotifyWhatsappTo(e.target.value)}
                      />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Format: whatsapp:+91XXXXXXXXXX (Twilio sandbox format)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── API Keys ───────────────────────────── */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={styles.sectionHeader}>
                <Key size={18} color="var(--accent-purple)" />
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>API Keys</h2>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  Required for AI analysis &amp; news
                </span>
              </div>
              <hr style={styles.divider} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Cohere */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-purple)' }}>●</span> Cohere API Key
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>— for AI analysis &amp; chat</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Key size={14} style={styles.inputIcon} />
                    <input
                      id="s-cohere-key"
                      type={showCohere ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: '38px', paddingRight: '40px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
                      placeholder="co-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={cohereKey}
                      onChange={(e) => setCohereKey(e.target.value)}
                    />
                    <button type="button" style={styles.eyeBtn} onClick={() => setShowCohere(!showCohere)}>
                      {showCohere ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {cohereKey && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--accent-green)' }}>
                      <Check size={11} /> {cohereKey.includes('...') ? 'Key configured (masked)' : 'Key ready to save'}
                      {!cohereKey.includes('...') && <CopyButton text={cohereKey} />}
                    </div>
                  )}
                  <ApiKeyGuide
                    title="Cohere API Key"
                    color="#9b5de5"
                    link="https://dashboard.cohere.com/api-keys"
                    linkLabel="Open Cohere Dashboard →"
                    steps={[
                      <>Go to <strong>cohere.com</strong> and click <strong>Sign Up</strong> (free tier gives 1,000 API calls/month).</>,
                      <>After logging in, go to the <strong>API Keys</strong> section in the left sidebar.</>,
                      <>Click <strong>"New trial key"</strong> or copy your existing default key.</>,
                      <>Paste the key starting with <code style={{ color: '#9b5de5' }}>co-...</code> in the field above.</>,
                      <>The key will be used when your backend calls Cohere for AI verdict &amp; chat responses.</>,
                    ]}
                  />
                </div>

                {/* News API */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-blue)' }}>●</span> News API Key
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>— for live stock news</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Key size={14} style={styles.inputIcon} />
                    <input
                      id="s-news-key"
                      type={showNews ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: '38px', paddingRight: '40px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={newsApiKey}
                      onChange={(e) => setNewsApiKey(e.target.value)}
                    />
                    <button type="button" style={styles.eyeBtn} onClick={() => setShowNews(!showNews)}>
                      {showNews ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {newsApiKey && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--accent-green)' }}>
                      <Check size={11} /> {newsApiKey.includes('...') ? 'Key configured (masked)' : 'Key ready to save'}
                      {!newsApiKey.includes('...') && <CopyButton text={newsApiKey} />}
                    </div>
                  )}
                  <ApiKeyGuide
                    title="NewsAPI Key"
                    color="#4ea8de"
                    link="https://newsapi.org/register"
                    linkLabel="Get free NewsAPI key →"
                    steps={[
                      <>Visit <strong>newsapi.org</strong> and click <strong>Get API Key</strong> — it's completely free.</>,
                      <>Register with your email. No credit card required.</>,
                      <>After email confirmation, you'll see your API key on the dashboard.</>,
                      <>Paste the 32-character key in the field above.</>,
                      <>The key is used to fetch latest news headlines for any stock you analyze.</>,
                    ]}
                  />
                </div>

                <div style={styles.apiNote}>
                  <Shield size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    Keys are stored securely in the backend's user_settings table (Supabase). They are never returned in full — the backend masks them for display. Never share your API keys with anyone.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Security ───────────────────────────── */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={styles.sectionHeader}>
                <Shield size={18} color="var(--accent-blue)" />
                <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>Security</h2>
              </div>
              <hr style={styles.divider} />
              <div className="form-group">
                <label className="form-label">CRON Secret Key</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={styles.inputIcon} />
                  <input
                    id="s-cron-secret"
                    type={showCron ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '38px', paddingRight: '40px' }}
                    value={cronSecret}
                    onChange={(e) => setCronSecret(e.target.value)}
                    placeholder="Your CRON_SECRET from .env"
                  />
                  <button type="button" style={styles.eyeBtn} onClick={() => setShowCron(!showCron)}>
                    {showCron ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Required to trigger manual portfolio checks from the Portfolio page.
                </span>
              </div>
            </div>

            {/* Save */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button id="settings-save-btn" type="submit" className="btn btn-primary" style={{ minWidth: '160px' }}>
                {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: 'calc(100vh - 90px)', padding: '32px 24px' },
  container: { maxWidth: '800px', margin: '0 auto' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' },
  divider: { border: 'none', borderTop: '1px solid var(--border-color)', margin: '14px 0 18px' },
  inputIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' },
  eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' },
  apiNote: {
    display: 'flex', gap: '10px', alignItems: 'flex-start',
    background: 'rgba(78,168,222,0.06)', border: '1px solid rgba(78,168,222,0.2)',
    borderRadius: '8px', padding: '12px 14px', color: 'var(--accent-blue)',
  },
}
