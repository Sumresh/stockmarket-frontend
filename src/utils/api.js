import axios from 'axios'
import { supabase } from './supabase'

// ── Base URL ──────────────────────────────────────────────────
// Default '/api' works in both environments:
//   • Production (Vercel) — vercel.json rewrites /api/* → stockmarket-v1.vercel.app/*
//   • Local dev          — vite.config.js proxies /api → http://localhost:8000
// Set VITE_API_BASE_URL only if you need to hit a different backend directly.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
})

// ── Interceptor: inject X-User-Id on every request ────────────
// The backend requires the logged-in user's UUID via X-User-Id
// on every user-scoped endpoint (/verdict, /portfolio, etc.).
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id) {
      config.headers['X-User-Id'] = session.user.id
    }
  } catch {
    // Silently skip — unauthenticated requests will fail at the backend
  }
  return config
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

export const importCsvPortfolio = (csvText) =>
  api.post('/portfolio/import-csv', { csv_text: csvText }).then((r) => r.data)

export const importGrowwPortfolio = (growwApiToken) =>
  api.post('/portfolio/import-groww', { groww_api_token: growwApiToken }).then((r) => r.data)

// ── Wishlist ──────────────────────────────────────────────────
export const getWishlist = () =>
  api.get('/wishlist').then((r) => r.data)

export const addWishlistItem = (ticker, target_price = null, notes = null) =>
  api.post('/wishlist', { ticker, target_price, notes }).then((r) => r.data)

export const deleteWishlistItem = (ticker) =>
  api.delete(`/wishlist/${ticker}`).then((r) => r.data)

// ── Settings (BYOK keys + notification prefs) ─────────────────
export const getSettings = () =>
  api.get('/settings').then((r) => r.data)

export const saveSettings = (settings) =>
  api.post('/settings', settings).then((r) => r.data)

// ── Decision Log (scheduler history) ──────────────────────────
export const getDecisionLog = (limit = 50) =>
  api.get(`/decision-log?limit=${limit}`).then((r) => r.data)

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
