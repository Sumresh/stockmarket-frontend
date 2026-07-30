import { useState } from 'react'
import { User, Mail, Phone, Bell, Lock, Save, Check, Eye, EyeOff, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useNotifications()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [channel, setChannel] = useState(user?.notifyChannel || 'email')
  const [cronSecret, setCronSecret] = useState(user?.cronSecret || '')
  const [showSecret, setShowSecret] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    updateProfile({ name, email, phone, notifyChannel: channel, cronSecret })
    setSaved(true)
    showToast('Settings saved successfully!', 'success')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div className="section-heading">Account</div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', marginTop: '6px' }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage your profile and notification preferences.
          </p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Profile */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={styles.sectionHeader}>
              <User size={18} color="var(--accent-green)" />
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>Profile Information</h2>
            </div>
            <hr className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={styles.inputIcon} />
                  <input
                    id="settings-name"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '40px' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={styles.inputIcon} />
                    <input
                      id="settings-email"
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    WhatsApp / Phone
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginLeft: '6px' }}>(for alerts)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={styles.inputIcon} />
                    <input
                      id="settings-phone"
                      type="tel"
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Format: +91XXXXXXXXXX (with country code)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={styles.sectionHeader}>
              <Bell size={18} color="var(--accent-yellow)" />
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>Alert Preferences</h2>
            </div>
            <hr className="divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Preferred Notification Channel</label>
                <div style={styles.channelGrid}>
                  {[
                    { id: 'email', label: '📧 Email', desc: `Alerts sent to ${email || 'your email'}` },
                    { id: 'whatsapp', label: '📱 WhatsApp', desc: `Alerts sent to ${phone || 'your number'}` },
                    { id: 'both', label: '🔔 Both', desc: 'Email + WhatsApp alerts' },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      id={`channel-${ch.id}`}
                      style={{
                        ...styles.channelCard,
                        ...(channel === ch.id ? styles.channelCardActive : {}),
                      }}
                      onClick={() => setChannel(ch.id)}
                    >
                      <div style={{ fontSize: '1.4rem' }}>{ch.label.split(' ')[0]}</div>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{ch.label.slice(3)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{ch.desc}</div>
                      {channel === ch.id && (
                        <div style={styles.channelCheck}><Check size={10} /></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.infoBox}>
                <Bell size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <strong style={{ fontSize: '0.82rem' }}>How alerts are sent</strong>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px', lineHeight: '1.6' }}>
                    The backend sends alerts via <strong>email (SMTP)</strong> or <strong>WhatsApp (Twilio)</strong> when your portfolio generates a signal. Make sure the backend environment variables (<code style={{ color: 'var(--accent-green)' }}>NOTIFY_CHANNEL</code>, <code style={{ color: 'var(--accent-green)' }}>NOTIFY_EMAIL_TO</code>, <code style={{ color: 'var(--accent-green)' }}>NOTIFY_WHATSAPP_TO</code>) match your selection above.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security / CRON */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={styles.sectionHeader}>
              <Shield size={18} color="var(--accent-blue)" />
              <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>Security</h2>
            </div>
            <hr className="divider" />

            <div className="form-group">
              <label className="form-label">CRON Secret Key</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={styles.inputIcon} />
                <input
                  id="settings-cron-secret"
                  type={showSecret ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '44px' }}
                  value={cronSecret}
                  onChange={(e) => setCronSecret(e.target.value)}
                  placeholder="Your CRON_SECRET from .env"
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Required to trigger manual portfolio checks from the Portfolio page.
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              id="settings-save-btn"
              type="submit"
              className="btn btn-primary"
              style={{ minWidth: '160px' }}
            >
              {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: 'calc(100vh - 90px)', padding: '32px 24px' },
  container: { maxWidth: '800px', margin: '0 auto' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px' },
  inputIcon: { position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' },
  eyeBtn: { position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' },
  channelGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  channelCard: {
    padding: '18px 14px', border: '1px solid var(--border-color)', borderRadius: '12px',
    background: 'var(--bg-surface)', cursor: 'pointer', transition: 'all 0.2s',
    textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '6px',
  },
  channelCardActive: {
    border: '1px solid var(--accent-green)',
    background: 'var(--accent-green-dim)',
  },
  channelCheck: {
    position: 'absolute', top: '8px', right: '8px',
    background: 'var(--accent-green)', color: '#080a0f',
    borderRadius: '50%', width: '18px', height: '18px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  infoBox: {
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    background: 'rgba(78,168,222,0.06)', border: '1px solid rgba(78,168,222,0.2)',
    borderRadius: '10px', padding: '16px', color: 'var(--accent-blue)',
  },
}
