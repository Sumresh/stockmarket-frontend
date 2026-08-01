// ── Wishlist Helpers ──────────────────────────────────────────
// All Supabase CRUD is now handled by the backend API (see api.js).
// Re-export the API functions for convenience, and keep the
// localStorage fallback for unauthenticated users.

export { getWishlist, addWishlistItem, deleteWishlistItem } from './api'

// ── localStorage fallback (when not logged in via Supabase) ───
const WL_KEY = 'niftybuddy_wishlist'

export const getLocalWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]') } catch { return [] }
}

export const addLocalWishlist = (ticker) => {
  const list = getLocalWishlist()
  if (list.find((t) => t.ticker === ticker.toUpperCase())) return list
  const updated = [{ ticker: ticker.toUpperCase(), created_at: new Date().toISOString() }, ...list]
  localStorage.setItem(WL_KEY, JSON.stringify(updated))
  return updated
}

export const removeLocalWishlist = (ticker) => {
  const updated = getLocalWishlist().filter((t) => t.ticker !== ticker.toUpperCase())
  localStorage.setItem(WL_KEY, JSON.stringify(updated))
  return updated
}
