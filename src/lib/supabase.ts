import { createClient } from '@supabase/supabase-js'

// Use environment variables - throw error if not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Clean and validate the URL
const cleanUrl = supabaseUrl?.trim()
const cleanKey = supabaseAnonKey?.trim()

// Debug log for environment variables (safe logging)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', cleanUrl)
  console.log('Supabase Anon Key:', cleanKey ? 'Set (length: ' + cleanKey.length + ')' : 'Missing')
}

// Validate configuration
if (!cleanUrl || !cleanKey) {
  console.error('Missing Supabase configuration!')
  console.error('URL:', cleanUrl)
  console.error('Key:', cleanKey ? 'Present' : 'Missing')
  throw new Error('Supabase configuration is invalid')
}

// Validate URL format
try {
  new URL(cleanUrl)
} catch {
  console.error('Invalid Supabase URL:', cleanUrl)
  throw new Error('Invalid Supabase URL format')
}

// Client-side Supabase client with minimal configuration
export const supabase = createClient(cleanUrl, cleanKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Admin client with service role key (for API routes only)
export const supabaseAdmin = createClient(cleanUrl!, supabaseServiceRoleKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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