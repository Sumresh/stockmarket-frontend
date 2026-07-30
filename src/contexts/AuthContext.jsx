import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, signUp, signIn, signOut } from '../utils/supabase'

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

    // Session may be null until email confirmed; if not null, set user
    if (data.session?.user) {
      const u = buildUserObj(data.session.user)
      setUser(u)
      return u
    }
    // Email confirmation required → tell caller
    return { emailConfirmationRequired: true, email }
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

  // ── Update profile (stored in Supabase user_metadata) ─────────
  const updateProfile = async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: updates.name,
        phone: updates.phone,
        notifyChannel: updates.notifyChannel,
        cronSecret: updates.cronSecret,
      },
    })
    if (error) throw new Error(error.message)
    const updated = buildUserObj(data.user)
    setUser(updated)
    return updated
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
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
    createdAt: supaUser.created_at,
  }
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
