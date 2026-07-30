import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const config = {
  BUY:        { cls: 'badge-buy',        icon: <TrendingUp size={11} />,   label: 'BUY' },
  ACCUMULATE: { cls: 'badge-accumulate', icon: <TrendingUp size={11} />,   label: 'ACCUMULATE' },
  SELL:       { cls: 'badge-sell',       icon: <TrendingDown size={11} />, label: 'SELL' },
  HOLD:       { cls: 'badge-hold',       icon: <Minus size={11} />,        label: 'HOLD' },
}

export default function SignalBadge({ action, size = 'default' }) {
  const c = config[action?.toUpperCase()] || config.HOLD
  return (
    <span className={`badge ${c.cls}`} style={size === 'lg' ? { fontSize: '0.85rem', padding: '6px 16px' } : {}}>
      {c.icon}
      {c.label}
    </span>
  )
}
