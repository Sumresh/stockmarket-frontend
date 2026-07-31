import { supabase } from './supabase'

// ── Wishlist Supabase Helpers ─────────────────────────────────
// Table: wishlist (id, user_id, ticker, notes, added_at)
// RLS: users can only see/edit their own rows

/** Fetch all wishlist items for the logged-in user */
export const fetchWishlist = (userId) =>
  supabase
    .from('wishlist')
    .select('id, ticker, notes, added_at')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

/** Add a ticker to the wishlist */
export const addToWishlist = (userId, ticker, notes = '') =>
  supabase
    .from('wishlist')
    .insert({ user_id: userId, ticker: ticker.toUpperCase(), notes })
    .select()
    .single()

/** Remove a ticker from the wishlist */
export const removeFromWishlist = (userId, ticker) =>
  supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('ticker', ticker.toUpperCase())

/** Update notes for a wishlist item */
export const updateWishlistNotes = (id, notes) =>
  supabase
    .from('wishlist')
    .update({ notes })
    .eq('id', id)
    .select()
    .single()

// ── localStorage fallback (when not logged in via Supabase) ───
const WL_KEY = 'niftybuddy_wishlist'

export const getLocalWishlist = () => {
  try { return JSON.parse(localStorage.getItem(WL_KEY) || '[]') } catch { return [] }
}

export const addLocalWishlist = (ticker) => {
  const list = getLocalWishlist()
  if (list.find((t) => t.ticker === ticker.toUpperCase())) return list
  const updated = [{ ticker: ticker.toUpperCase(), added_at: new Date().toISOString() }, ...list]
  localStorage.setItem(WL_KEY, JSON.stringify(updated))
  return updated
}

export const removeLocalWishlist = (ticker) => {
  const updated = getLocalWishlist().filter((t) => t.ticker !== ticker.toUpperCase())
  localStorage.setItem(WL_KEY, JSON.stringify(updated))
  return updated
}
