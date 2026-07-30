import axios from 'axios'

// ── Base URL ──────────────────────────────────────────────────
// Deployed backend on Vercel. Change to '/api' for local dev
// (vite.config.js proxies /api → http://localhost:8000).
const BASE_URL = 'https://stockmarket-v1.vercel.app'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// ── Stock Verdict ─────────────────────────────────────────────
export const getVerdict = (ticker) =>
  api.post('/verdict', { ticker }).then((r) => r.data)

// ── AI Chat ───────────────────────────────────────────────────
export const sendChatMessage = (ticker, question) =>
  api.post('/chat', { ticker, question }).then((r) => r.data)

// ── Portfolio ─────────────────────────────────────────────────
export const getPortfolio = () =>
  api.get('/portfolio').then((r) => r.data)

export const addHolding = (ticker, quantity, avg_buy_price) =>
  api.post('/portfolio', { ticker, quantity, avg_buy_price }).then((r) => r.data)

export const deleteHolding = (ticker) =>
  api.delete(`/portfolio/${ticker}`).then((r) => r.data)

// ── Run Portfolio Check ───────────────────────────────────────
export const runPortfolioCheck = (cronSecret, force = false) =>
  api
    .post(`/run-check?force=${force}`, null, {
      headers: { 'x-cron-secret': cronSecret },
    })
    .then((r) => r.data)

// ── Health ────────────────────────────────────────────────────
export const checkHealth = () =>
  api.get('/health').then((r) => r.data)

export default api
