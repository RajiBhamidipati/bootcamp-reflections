import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const missing = []
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  throw new Error(
    `Missing required Supabase environment variables: ${missing.join(', ')}\n` +
    'Please check your .env.local file or deployment environment settings.'
  )
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (err) {
  throw new Error(
    `Invalid Supabase URL format: ${supabaseUrl}\n` +
    'Please check your NEXT_PUBLIC_SUPABASE_URL environment variable.\n' +
    `Error details: ${err instanceof Error ? err.message : 'Unknown error'}`
  )
}

// Validate service role key for server-side operations
if (!supabaseServiceRoleKey) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY is not set. Server-side admin operations will not work.'
  )
}

// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase configured:', {
    url: supabaseUrl,
    anonKeyLength: supabaseAnonKey.length,
    serviceRoleKeySet: !!supabaseServiceRoleKey
  })
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Admin client with service role key (for API routes only)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey, // Fallback to anon key if service role not available
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'user' | 'admin'
          updated_at?: string
        }
      }
      reflections: {
        Row: {
          id: string
          user_id: string
          type: 'daily' | 'weekly' | 'project' | 'mood'
          title: string
          content: Record<string, unknown>
          mood_score: number | null
          sentiment_score: number | null
          keywords: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'daily' | 'weekly' | 'project' | 'mood'
          title: string
          content: Record<string, unknown>
          mood_score?: number | null
          sentiment_score?: number | null
          keywords?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'daily' | 'weekly' | 'project' | 'mood'
          title?: string
          content?: Record<string, unknown>
          mood_score?: number | null
          sentiment_score?: number | null
          keywords?: string[] | null
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          date: string
          mood_average: number
          stress_average: number
          energy_average: number
          reflection_count: number
          sentiment_score: number
          keywords: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          mood_average: number
          stress_average: number
          energy_average: number
          reflection_count: number
          sentiment_score: number
          keywords: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          mood_average?: number
          stress_average?: number
          energy_average?: number
          reflection_count?: number
          sentiment_score?: number
          keywords?: string[]
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string
          anonymous_quotes: string[]
          tags: string[]
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt: string
          anonymous_quotes: string[]
          tags: string[]
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string
          anonymous_quotes?: string[]
          tags?: string[]
          published?: boolean
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'reminder' | 'achievement' | 'weekly_summary'
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'reminder' | 'achievement' | 'weekly_summary'
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'reminder' | 'achievement' | 'weekly_summary'
          title?: string
          message?: string
          read?: boolean
        }
      }
      admin_settings: {
        Row: {
          id: string
          notification_enabled: boolean
          reminder_time: string
          export_format: 'csv' | 'json' | 'pdf'
          analytics_retention_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          notification_enabled?: boolean
          reminder_time?: string
          export_format?: 'csv' | 'json' | 'pdf'
          analytics_retention_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          notification_enabled?: boolean
          reminder_time?: string
          export_format?: 'csv' | 'json' | 'pdf'
          analytics_retention_days?: number
          updated_at?: string
        }
      }
    }
  }
}