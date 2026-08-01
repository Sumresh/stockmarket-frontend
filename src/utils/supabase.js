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

// ── NOTE ──────────────────────────────────────────────────────
// Holdings and wishlist CRUD now goes through the backend API
// (see api.js). The backend attaches the user's UUID via the
// X-User-Id header and writes to the same Supabase tables.
