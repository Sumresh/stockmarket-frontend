import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

const NOTIF_KEY = 'stockcheck_notifications'
const EMAIL_ALERTS_KEY = 'stockcheck_email_alerts'   // alerts actually sent by backend

export function NotificationProvider({ children }) {
  // In-app notifications (all analyses, verdicts, etc.)
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]') } catch { return [] }
  })

  // Email/WhatsApp alerts that were sent by the backend (from run-check only)
  const [emailAlerts, setEmailAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(EMAIL_ALERTS_KEY) || '[]') } catch { return [] }
  })

  const [toasts, setToasts] = useState([])

  // ── In-app notification ────────────────────────────────────────
  const addNotification = useCallback((notif) => {
    const entry = {
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      source: notif.source || 'analysis',  // 'analysis' | 'run-check'
      ...notif,
    }
    setNotifications((prev) => {
      const updated = [entry, ...prev].slice(0, 100)
      localStorage.setItem(NOTIF_KEY, JSON.stringify(updated))
      return updated
    })
    return entry
  }, [])

  // ── Email alert (backend actually sent email/WhatsApp) ────────
  // Call this only after a successful run-check that returned signals
  const addEmailAlert = useCallback((alert) => {
    const entry = {
      id: `email_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...alert,
    }
    setEmailAlerts((prev) => {
      const updated = [entry, ...prev].slice(0, 200)
      localStorage.setItem(EMAIL_ALERTS_KEY, JSON.stringify(updated))
      return updated
    })
    return entry
  }, [])

  const markRead = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      localStorage.setItem(NOTIF_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const markEmailAlertRead = useCallback((id) => {
    setEmailAlerts((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      localStorage.setItem(EMAIL_ALERTS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      localStorage.setItem(NOTIF_KEY, JSON.stringify(updated))
      return updated
    })
    setEmailAlerts((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      localStorage.setItem(EMAIL_ALERTS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    localStorage.removeItem(NOTIF_KEY)
    localStorage.removeItem(EMAIL_ALERTS_KEY)
    setNotifications([])
    setEmailAlerts([])
  }, [])

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = `toast_${Date.now()}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  // unread in-app notifications
  const unreadCount = notifications.filter((n) => !n.read).length
  // unread email/WhatsApp alerts sent by backend
  const unreadEmailAlerts = emailAlerts.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        emailAlerts,
        toasts,
        unreadCount,
        unreadEmailAlerts,
        addNotification,
        addEmailAlert,
        markRead,
        markEmailAlertRead,
        markAllRead,
        clearAll,
        showToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider')
  return ctx
}
