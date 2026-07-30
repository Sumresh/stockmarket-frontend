import { createClient } from '@supabase/supabase-js'

// ── Supabase Config ───────────────────────────────────────────
const SUPABASE_URL = 'https://gsxexhhlqotqidkbrfoq.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_2yFBwS1aXvPnmd0tcDG93w_vjTkjzua'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Auth Helpers ──────────────────────────────────────────────

/** Register a new user with email/password + profile metadata */
export const signUp = (email, password, metadata) =>
  supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },   // name, phone, notifyChannel stored in user_metadata
  })

/** Sign in with email + password */
export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

/** Sign out current session */
export const signOut = () => supabase.auth.signOut()

/** Get current session (non-reactive, one-shot) */
export const getSession = () => supabase.auth.getSession()

// ── Holdings Helpers ──────────────────────────────────────────
// Direct Supabase reads for portfolio (same table the backend writes to)

/** Fetch all holdings from the Supabase holdings table */
export const fetchHoldingsFromSupabase = () =>
  supabase
    .from('holdings')
    .select('ticker, quantity, avg_buy_price, created_at')
    .order('created_at', { ascending: false })

/** Upsert a holding (insert or update by ticker PK) */
export const upsertHolding = (ticker, quantity, avg_buy_price) =>
  supabase
    .from('holdings')
    .upsert({ ticker: ticker.toUpperCase(), quantity, avg_buy_price }, { onConflict: 'ticker' })
    .select()
    .single()

/** Delete a holding by ticker */
export const removeHolding = (ticker) =>
  supabase
    .from('holdings')
    .delete()
    .eq('ticker', ticker.toUpperCase())
