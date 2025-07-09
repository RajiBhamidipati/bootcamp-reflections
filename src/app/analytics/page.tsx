'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Reflection, AnalyticsData } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Target, Download } from 'lucide-react'
import Link from 'next/link'
import MoodChart from '@/components/charts/MoodChart'
import SentimentChart from '@/components/charts/SentimentChart'
import ReflectionTypeChart from '@/components/charts/ReflectionTypeChart'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, timeRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000)
      
      // Fetch reflections
      const { data: reflectionsData, error: reflectionsError } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (reflectionsError) {
        console.error('Error fetching reflections:', reflectionsError)
      } else {
        setReflections(reflectionsData || [])
      }

      // Fetch analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError)
      } else {
        setAnalytics(analyticsData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const data = {
        reflections,
        analytics,
        timeRange,
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `my-analytics-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const getInsights = () => {
    if (analytics.length === 0) return []
    
    const insights = []
    const avgMood = analytics.reduce((sum, a) => sum + a.mood_average, 0) / analytics.length
    const avgStress = analytics.reduce((sum, a) => sum + a.stress_average, 0) / analytics.length
    const avgEnergy = analytics.reduce((sum, a) => sum + a.energy_average, 0) / analytics.length
    const avgSentiment = analytics.reduce((sum, a) => sum + a.sentiment_score, 0) / analytics.length
    
    if (avgMood >= 7) {
      insights.push('Your mood has been consistently positive!')
    } else if (avgMood <= 4) {
      insights.push('Your mood has been lower than usual. Consider reaching out for support.')
    }
    
    if (avgStress >= 7) {
      insights.push('Stress levels are high. Consider stress management techniques.')
    } else if (avgStress <= 3) {
      insights.push('Great job maintaining low stress levels!')
    }
    
    if (avgEnergy >= 7) {
      insights.push('Your energy levels are strong!')
    } else if (avgEnergy <= 4) {
      insights.push('Energy levels are low. Consider rest and self-care.')
    }
    
    if (avgSentiment > 0.3) {
      insights.push('Your reflections show a positive outlook.')
    } else if (avgSentiment < -0.3) {
      insights.push('Your reflections suggest some challenges. Consider seeking support.')
    }
    
    return insights
  }

  if (!user) {
    return <div>Please sign in to access this page.</div>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const insights = getInsights()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Track your reflection patterns and mood trends
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-900 text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Mood & Energy Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MoodChart data={analytics} height={300} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SentimentChart data={analytics} height={300} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Reflection Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReflectionTypeChart data={reflections} height={300} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Summary Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Reflections</p>
                    <p className="text-2xl font-bold text-gray-900">{reflections.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Analytics Days</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.length}</p>
                  </div>
                  {analytics.length > 0 && (
                    <>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-600">Avg Mood</p>
                        <p className="text-2xl font-bold text-red-900">
                          {(analytics.reduce((sum, a) => sum + a.mood_average, 0) / analytics.length).toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-600">Avg Energy</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {(analytics.reduce((sum, a) => sum + a.energy_average, 0) / analytics.length).toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">Avg Stress</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {(analytics.reduce((sum, a) => sum + a.stress_average, 0) / analytics.length).toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Avg Sentiment</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {(analytics.reduce((sum, a) => sum + a.sentiment_score, 0) / analytics.length).toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                {analytics.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Top Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analytics
                        .flatMap(a => a.keywords)
                        .reduce((acc, keyword) => {
                          acc[keyword] = (acc[keyword] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                        && Object.entries(
                          analytics
                            .flatMap(a => a.keywords)
                            .reduce((acc, keyword) => {
                              acc[keyword] = (acc[keyword] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                        )
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([keyword, count]) => (
                          <span key={keyword} className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {keyword} ({count})
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}