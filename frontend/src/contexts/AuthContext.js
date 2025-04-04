'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getSession } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    try {
      const { session } = await getSession()
      setUser(session?.user ?? null)
      setSession(session)
    } catch (error) {
      console.error('Error checking auth state:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
