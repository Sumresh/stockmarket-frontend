import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, signUp, signIn, signOut, signInWithGoogle } from '../utils/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Bootstrap: restore session from Supabase on mount ────────
  useEffect(() => {
    // 1. Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(buildUserObj(session.user))
      setLoading(false)
    })

    // 2. Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(buildUserObj(session.user))
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Register ──────────────────────────────────────────────────
  const register = async ({ name, email, phone, password, notifyChannel }) => {
    const { data, error } = await signUp(email, password, {
      name,
      phone: phone || '',
      notifyChannel: notifyChannel || 'email',
    })
    if (error) throw new Error(error.message)

    // When email confirmation is OFF → session is returned immediately
    if (data.session?.user) {
      const u = buildUserObj(data.session.user)
      setUser(u)
      return u
    }

    // When email confirmation is ON → session is null, user must confirm first
    // (Supabase free tier: disable "Confirm email" in Auth → Providers → Email to avoid this)
    if (data.user && !data.session) {
      return { emailConfirmationRequired: true, email }
    }

    throw new Error('Registration failed. Please try again.')
  }

  // ── Login ─────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data, error } = await signIn(email, password)
    if (error) throw new Error(error.message)
    const u = buildUserObj(data.user)
    setUser(u)
    return u
  }

  // ── Logout ────────────────────────────────────────────────────
  const logout = async () => {
    await signOut()
    setUser(null)
  }

  // ── Google OAuth ──────────────────────────────────────────────
  // Redirects to Google → user comes back to /dashboard
  const loginWithGoogle = () => signInWithGoogle()

  // ── Update profile (stored in Supabase user_metadata) ─────────
  const updateProfile = async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: updates.name,
        phone: updates.phone,
        notifyChannel: updates.notifyChannel,
        cronSecret: updates.cronSecret,
        cohereKey: updates.cohereKey,
        newsApiKey: updates.newsApiKey,
      },
    })
    if (error) throw new Error(error.message)
    const updated = buildUserObj(data.user)
    setUser(updated)
    return updated
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Helper: normalise Supabase user into our flat user shape ───
function buildUserObj(supaUser) {
  const meta = supaUser.user_metadata || {}
  return {
    id: supaUser.id,
    email: supaUser.email,
    name: meta.name || supaUser.email?.split('@')[0] || 'User',
    phone: meta.phone || '',
    notifyChannel: meta.notifyChannel || 'email',
    cronSecret: meta.cronSecret || '',
    cohereKey: meta.cohereKey || '',
    newsApiKey: meta.newsApiKey || '',
    createdAt: supaUser.created_at,
  }
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
