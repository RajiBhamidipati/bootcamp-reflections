import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://muzedjmymisbfbkdoyev.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11emVkam15bWlzYmZia2RveWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjc2NTAsImV4cCI6MjA2NzY0MzY1MH0.v6XiiOU6W_A_Ujzc20bScgo7owS3XtjOJWfcSID_CsI'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11emVkam15bWlzYmZia2RveWV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA2NzY1MCwiZXhwIjoyMDY3NjQzNjUwfQ.X3gFgeoZ5z-C78svQr67bWI5X6C5nsSiQPKScH1kbM8'

// Debug log for environment variables
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set (length: ' + supabaseAnonKey.length + ')' : 'Missing')

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration!')
  console.error('URL:', supabaseUrl)
  console.error('Key:', supabaseAnonKey ? 'Present' : 'Missing')
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
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
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
          content: any
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
          content: any
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
          content?: any
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