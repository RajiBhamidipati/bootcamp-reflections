'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth loading timeout, setting loading to false')
      setLoading(false)
    }, 3000) // Reduced timeout to 3 seconds

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
      clearTimeout(timeout)
    }).catch(error => {
      console.error('Error getting session:', error)
      setLoading(false)
      clearTimeout(timeout)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSupabaseUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    // Set a timeout for this specific operation
    const profileTimeout = setTimeout(() => {
      console.warn('Profile fetch timeout, using fallback user')
      setUser({
        id: userId,
        email: supabaseUser?.email || '',
        name: supabaseUser?.user_metadata?.name || null,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setLoading(false)
    }, 2000) // 2 second timeout for profile fetch

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      clearTimeout(profileTimeout)

      if (error) {
        console.error('Error fetching user profile:', error)
        // Always fallback to basic user object
        setUser({
          id: userId,
          email: supabaseUser?.email || '',
          name: supabaseUser?.user_metadata?.name || null,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      } else {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          created_at: data.created_at,
          updated_at: data.updated_at
        })
      }
    } catch (error) {
      clearTimeout(profileTimeout)
      console.error('Error fetching user profile:', error)
      // Fallback: create basic user object from Supabase auth user
      setUser({
        id: userId,
        email: supabaseUser?.email || '',
        name: supabaseUser?.user_metadata?.name || null,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    supabaseUser,
    loading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}