import { useNotifications } from '../contexts/NotificationContext'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

const icons = {
  success: <CheckCircle size={16} color="var(--accent-green)" />,
  error:   <AlertCircle size={16} color="var(--accent-red)" />,
  warning: <AlertTriangle size={16} color="var(--accent-yellow)" />,
  info:    <Info size={16} color="var(--accent-blue)" />,
}

export default function ToastContainer() {
  const { toasts } = useNotifications()
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {icons[t.type] || icons.info}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', flex: 1 }}>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
