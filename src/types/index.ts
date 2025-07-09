export interface User {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Reflection {
  id: string
  user_id: string
  type: 'daily' | 'weekly' | 'project' | 'mood'
  title: string
  content: ReflectionContent
  mood_score?: number
  sentiment_score?: number
  keywords?: string[]
  created_at: string
  updated_at: string
}

export interface ReflectionContent {
  // Context-aware questions based on bootcamp phase
  phase: 'pre-bootcamp' | 'week-1-8' | 'week-9-16' | 'week-17-24' | 'post-graduation'
  
  // Common fields
  overall_mood: number // 1-10 scale
  energy_level: number // 1-10 scale
  stress_level: number // 1-10 scale
  motivation: number // 1-10 scale
  
  // Text responses
  daily_highlight?: string
  challenges_faced?: string
  learning_progress?: string
  goals_tomorrow?: string
  gratitude?: string
  
  // Weekly specific
  weekly_goals_met?: boolean
  biggest_learning?: string
  areas_for_improvement?: string
  
  // Project specific
  project_name?: string
  technologies_used?: string[]
  project_satisfaction?: number
  collaboration_rating?: number
  
  // Custom fields for different phases
  custom_fields?: Record<string, any>
}

export interface AnalyticsData {
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

export interface AdminSettings {
  id: string
  notification_enabled: boolean
  reminder_time: string
  export_format: 'csv' | 'json' | 'pdf'
  analytics_retention_days: number
  created_at: string
  updated_at: string
}

export interface BlogPost {
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

export interface NotificationData {
  id: string
  user_id: string
  type: 'reminder' | 'achievement' | 'weekly_summary'
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    fill?: boolean
  }[]
}

export interface SentimentAnalysis {
  score: number // -1 to 1
  magnitude: number // 0 to infinity
  emotions: {
    joy: number
    sadness: number
    anger: number
    fear: number
    surprise: number
  }
}

export interface ExportData {
  reflections: Reflection[]
  analytics: AnalyticsData[]
  format: 'csv' | 'json' | 'pdf'
  dateRange: {
    start: string
    end: string
  }
}

export interface WeeklyReport {
  week_start: string
  week_end: string
  mood_trend: number[]
  stress_trend: number[]
  energy_trend: number[]
  total_reflections: number
  top_keywords: string[]
  sentiment_summary: SentimentAnalysis
  achievements: string[]
  areas_for_focus: string[]
}