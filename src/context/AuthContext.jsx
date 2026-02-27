import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data ?? null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Carga la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Suscribe a cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // ── Acciones de autenticación ──────────────────────────────

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ?? null
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function register(nombre, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    })
    if (error) return { error, needsConfirmation: false }
    return { error: null, needsConfirmation: !data.session }
  }

  const isAdmin = profile?.rol === 'ADMIN'

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, isAdmin, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
