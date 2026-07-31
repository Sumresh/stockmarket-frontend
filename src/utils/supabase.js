import { createClient } from '@supabase/supabase-js'

// ── Supabase Config ───────────────────────────────────────────
const SUPABASE_URL = 'https://gsxexhhlqotqidkbrfoq.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_2yFBwS1aXvPnmd0tcDG93w_vjTkjzua'

// Deployed site URL — used as the redirect target for auth emails
// Falls back to current origin so local dev still works
export const SITE_URL =
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' && window.location.origin !== 'http://localhost:3000'
    ? window.location.origin
    : 'https://niftybuddy.vercel.app')

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Tell Supabase JS where to redirect after email confirmation
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// ── Auth Helpers ──────────────────────────────────────────────

/** Register a new user with email/password + profile metadata */
export const signUp = (email, password, metadata) =>
  supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,                    // name, phone, notifyChannel in user_metadata
      emailRedirectTo: `${SITE_URL}/`,   // after clicking confirmation link → go to NiftyBuddy
    },
  })

/** Sign in with email + password */
export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

/** Sign in with Google OAuth (free, no rate limits) */
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${SITE_URL}/dashboard`,   // after Google auth → go straight to dashboard
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',            // always show account picker
      },
    },
  })

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
