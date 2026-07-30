export default function ConfidenceMeter({ value = 0, showLabel = true }) {
  const pct = Math.min(100, Math.max(0, value))
  const level = pct >= 80 ? 'high' : pct >= 40 ? 'medium' : 'low'
  const color = level === 'high' ? 'var(--accent-green)' : level === 'medium' ? 'var(--accent-yellow)' : 'var(--accent-red)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>CONFIDENCE</span>
          <span style={{ color }}>{pct}%</span>
        </div>
      )}
      <div className="confidence-bar">
        <div
          className={`confidence-bar-fill ${level}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
