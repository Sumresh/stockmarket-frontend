import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Bot, User, BarChart2 } from 'lucide-react'
import { sendChatMessage } from '../utils/api'
import { useNotifications } from '../contexts/NotificationContext'

const SAMPLE_QUESTIONS = [
  'What are the key risks?',
  'Is this a good long-term investment?',
  'What does the recent news say?',
  'How is the P/E ratio?',
  'Should I buy more or hold?',
]

export default function ChatPage() {
  const { ticker } = useParams()
  const navigate = useNavigate()
  const { showToast } = useNotifications()
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hello! I'm your AI stock advisor for **${ticker?.toUpperCase()}**. Ask me anything about this stock — fundamentals, recent news, valuation, technicals, or whether to buy, sell, or hold.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (question = input) => {
    if (!question.trim()) return
    const userMsg = { role: 'user', text: question }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await sendChatMessage(ticker, question)
      setMessages((prev) => [...prev, { role: 'ai', text: res.answer }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: '❌ Sorry, I encountered an error. Please ensure the backend is running and try again.', error: true }])
      showToast('Chat request failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} />
          </button>
          <div style={styles.botAvatar}>
            <Bot size={18} color="var(--accent-green)" />
          </div>
          <div>
            <div style={styles.headerTitle}>AI Advisor — {ticker?.toUpperCase()}</div>
            <div style={styles.headerSub}>
              <span className="live-dot" style={{ width: '6px', height: '6px' }} />
              <span>Powered by Cohere RAG</span>
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/verdict/${ticker}`)}
        >
          <BarChart2 size={14} /> Full Analysis
        </button>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {/* Sample questions */}
        {messages.length <= 1 && (
          <div style={styles.samplesWrap}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              Try asking:
            </p>
            <div style={styles.sampleGrid}>
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  style={styles.sampleBtn}
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                {/* Avatar */}
                <div style={{ ...styles.msgAvatar, background: msg.role === 'user' ? 'var(--accent-green)' : 'var(--bg-surface)', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                  {msg.role === 'user'
                    ? <User size={12} color="#080a0f" />
                    : <Bot size={12} color="var(--accent-green)" />
                  }
                </div>
                <div
                  className="chat-bubble"
                  style={msg.role === 'user' ? {} : { background: msg.error ? 'var(--accent-red-dim)' : undefined }}
                >
                  {formatMessage(msg.text)}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ ...styles.msgAvatar, background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                <Bot size={12} color="var(--accent-green)" />
              </div>
              <div className="chat-bubble ai" style={{ padding: '14px 18px' }}>
                <div style={styles.typingDots}>
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div style={styles.inputBar}>
        <div style={styles.inputWrap}>
          <input
            id="chat-input"
            type="text"
            className="form-input"
            placeholder={`Ask anything about ${ticker?.toUpperCase()}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
            style={{ paddingRight: '52px' }}
          />
          <button
            id="chat-send-btn"
            className="btn btn-primary"
            style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', padding: '0 16px', minWidth: 'auto' }}
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <Send size={14} />
          </button>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '8px' }}>
          AI can make mistakes. Verify important information independently.
        </p>
      </div>

      <style>{`
        .typing-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--text-muted); display: inline-block;
          animation: blink 1.4s infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%,80%,100% { opacity: 0.2; } 40% { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function formatMessage(text) {
  // Basic markdown: bold, newlines
  if (!text) return null
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      )}
      {i < text.split('\n').length - 1 && <br />}
    </span>
  ))
}

const styles = {
  page: {
    height: 'calc(100vh - 90px)',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 0 16px',
    borderBottom: '1px solid var(--border-color)',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  botAvatar: {
    width: '40px', height: '40px', borderRadius: '12px',
    background: 'var(--accent-green-dim)', border: '1px solid rgba(0,255,157,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1rem' },
  headerSub: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  samplesWrap: { padding: '0 0 8px' },
  sampleGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  sampleBtn: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '100px',
    padding: '8px 16px',
    color: 'var(--text-secondary)',
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-body)',
  },
  messages: { display: 'flex', flexDirection: 'column', gap: '16px' },
  msgAvatar: {
    width: '28px', height: '28px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  typingDots: { display: 'flex', gap: '4px', alignItems: 'center' },
  inputBar: {
    padding: '16px 0 24px',
    borderTop: '1px solid var(--border-color)',
    flexShrink: 0,
  },
  inputWrap: { position: 'relative' },
}
