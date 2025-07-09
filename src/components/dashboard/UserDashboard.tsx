'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Reflection, AnalyticsData } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatDate, formatDateTime, getRelativeTime } from '@/lib/utils'
import { generateInsights } from '@/lib/sentiment'
import { Calendar, TrendingUp, Heart, Brain, Zap, Target, Plus, BookOpen, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function UserDashboard() {
  const { user } = useAuth()
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      fetchReflections()
      fetchAnalytics()
    }
  }, [user])

  const fetchReflections = async () => {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching reflections:', error)
      } else {
        setReflections(data || [])
        setInsights(generateInsights(data || []))
      }
    } catch (error) {
      console.error('Error fetching reflections:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(30)

      if (error) {
        console.error('Error fetching analytics:', error)
      } else {
        setAnalytics(data || [])
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecentAnalytics = () => {
    const recent = analytics.slice(0, 7)
    if (recent.length === 0) return null

    const avgMood = recent.reduce((sum, a) => sum + a.mood_average, 0) / recent.length
    const avgStress = recent.reduce((sum, a) => sum + a.stress_average, 0) / recent.length
    const avgEnergy = recent.reduce((sum, a) => sum + a.energy_average, 0) / recent.length
    const totalReflections = recent.reduce((sum, a) => sum + a.reflection_count, 0)

    return {
      avgMood: Math.round(avgMood * 10) / 10,
      avgStress: Math.round(avgStress * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      totalReflections
    }
  }

  const recentStats = getRecentAnalytics()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name || 'there'}!
        </h1>
        <p className="text-blue-100">
          Track your bootcamp journey with thoughtful reflections
        </p>
      </div>

      {/* Quick Stats */}
      {recentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Mood (7 days)</p>
                  <p className="text-2xl font-bold text-red-600">{recentStats.avgMood}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Energy (7 days)</p>
                  <p className="text-2xl font-bold text-yellow-600">{recentStats.avgEnergy}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Stress (7 days)</p>
                  <p className="text-2xl font-bold text-purple-600">{recentStats.avgStress}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reflections</p>
                  <p className="text-2xl font-bold text-green-600">{recentStats.totalReflections}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/reflect/daily">
              <Button variant="outline" className="w-full h-16 flex-col">
                <Heart className="h-6 w-6 mb-1" />
                Daily Reflection
              </Button>
            </Link>
            <Link href="/reflect/weekly">
              <Button variant="outline" className="w-full h-16 flex-col">
                <Calendar className="h-6 w-6 mb-1" />
                Weekly Review
              </Button>
            </Link>
            <Link href="/reflect/project">
              <Button variant="outline" className="w-full h-16 flex-col">
                <Target className="h-6 w-6 mb-1" />
                Project Review
              </Button>
            </Link>
            <Link href="/reflect/mood">
              <Button variant="outline" className="w-full h-16 flex-col">
                <Zap className="h-6 w-6 mb-1" />
                Mood Check
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="reflections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reflections">Recent Reflections</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reflections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Reflections</span>
                <Link href="/reflections">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reflections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No reflections yet. Start your journey!</p>
                  <Link href="/reflect/daily">
                    <Button className="mt-4">
                      Create First Reflection
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reflections.map((reflection) => (
                    <div key={reflection.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {reflection.type}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {getRelativeTime(reflection.created_at)}
                            </span>
                          </div>
                          <h3 className="font-medium mb-2">{reflection.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              Mood: {reflection.mood_score}/10
                            </div>
                            {reflection.sentiment_score && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                Sentiment: {reflection.sentiment_score > 0 ? 'Positive' : 'Negative'}
                              </div>
                            )}
                          </div>
                        </div>
                        <Link href={`/reflections/${reflection.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Personal Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Complete more reflections to unlock insights!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-900">{insight}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Analytics will appear as you create more reflections</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Daily Mood Trends</h4>
                      <div className="space-y-1">
                        {analytics.slice(0, 7).map((day) => (
                          <div key={day.date} className="flex items-center justify-between text-sm">
                            <span>{formatDate(day.date)}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${(day.mood_average / 10) * 100}%` }}
                                />
                              </div>
                              <span className="w-8 text-right">{day.mood_average.toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Recent Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analytics
                          .flatMap(a => a.keywords)
                          .slice(0, 10)
                          .map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Link href="/analytics">
                      <Button variant="outline" className="w-full">
                        View Detailed Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}