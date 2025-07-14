'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Reflection, AnalyticsData, User } from '@/types'

// Extended types for admin dashboard with joins
interface ReflectionWithUser extends Reflection {
  users: Pick<User, 'name' | 'email'> | null
}

interface AnalyticsWithUser extends AnalyticsData {
  users: Pick<User, 'name' | 'email'> | null
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatDate, formatDateTime } from '@/lib/utils'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Download, 
  BarChart3,
  Heart,
  Brain,
  Zap,
  Target,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReflections: 0,
    avgMoodScore: 0,
    avgSentimentScore: 0,
    activeUsers: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [reflections, setReflections] = useState<ReflectionWithUser[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('30')

  const fetchAdminData = useCallback(async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchReflections(),
        fetchAnalytics()
      ])
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData()
    }
  }, [user, fetchAdminData])

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get total reflections
      const { count: totalReflections } = await supabase
        .from('reflections')
        .select('*', { count: 'exact', head: true })

      // Get average mood score
      const { data: moodData } = await supabase
        .from('reflections')
        .select('mood_score')
        .not('mood_score', 'is', null)

      const avgMoodScore = moodData?.length 
        ? moodData.reduce((sum, r) => sum + (r.mood_score || 0), 0) / moodData.length
        : 0

      // Get average sentiment score
      const { data: sentimentData } = await supabase
        .from('reflections')
        .select('sentiment_score')
        .not('sentiment_score', 'is', null)

      const avgSentimentScore = sentimentData?.length 
        ? sentimentData.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / sentimentData.length
        : 0

      // Get active users (users who created reflections in last 7 days)
      const { count: activeUsers } = await supabase
        .from('reflections')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      setStats({
        totalUsers: totalUsers || 0,
        totalReflections: totalReflections || 0,
        avgMoodScore: Math.round(avgMoodScore * 10) / 10,
        avgSentimentScore: Math.round(avgSentimentScore * 100) / 100,
        activeUsers: activeUsers || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching users:', error)
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchReflections = async () => {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching reflections:', error)
      } else {
        setReflections(data || [])
      }
    } catch (error) {
      console.error('Error fetching reflections:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .order('date', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching analytics:', error)
      } else {
        setAnalytics(data || [])
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const response = await fetch(`/api/admin/export?format=${format}&timeRange=${timeRange}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reflections-export-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const filteredReflections = reflections.filter(reflection => {
    const matchesSearch = !searchTerm || 
      reflection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reflection.content.daily_highlight?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reflection.content.challenges_faced?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || reflection.type === filterType
    
    return matchesSearch && matchesType
  })

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100">
          Monitor and manage the bootcamp reflection platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reflections</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalReflections}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Mood Score</p>
                <p className="text-2xl font-bold text-red-600">{stats.avgMoodScore}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Sentiment</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgSentimentScore}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.activeUsers}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport('csv')}>
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('json')}>
                Export JSON
              </Button>
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="reflections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="reflections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Reflections</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reflections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="mood">Mood</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReflections.map((reflection) => (
                  <div key={reflection.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {reflection.type}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {reflection.users?.name || 'Unknown User'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(reflection.created_at)}
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
                              Sentiment: {reflection.sentiment_score.toFixed(2)}
                            </div>
                          )}
                          {reflection.keywords && (
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              Keywords: {reflection.keywords.slice(0, 3).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.name || 'No name'}</h3>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Joined {formatDate(user.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Recent Analytics Data</h4>
                  {analytics.slice(0, 10).map((data) => (
                    <div key={data.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{data.users?.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-600">{formatDate(data.date)}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4 text-red-500" />
                              {data.mood_average.toFixed(1)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Brain className="h-4 w-4 text-purple-500" />
                              {data.stress_average.toFixed(1)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              {data.energy_average.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Trending Keywords</h4>
                  <div className="space-y-2">
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
                        <div key={keyword} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{keyword}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Platform Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Overall Trends</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Average mood score across all users: {stats.avgMoodScore}/10</li>
                    <li>• {stats.activeUsers} users have been active in the last 7 days</li>
                    <li>• {stats.totalReflections} total reflections have been created</li>
                    <li>• Overall sentiment is {stats.avgSentimentScore > 0 ? 'positive' : 'negative'}</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Recommendations</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Consider implementing mood tracking reminders for inactive users</li>
                    <li>• The platform is showing positive engagement trends</li>
                    <li>• Weekly reflections could help users track progress better</li>
                    <li>• Consider adding group reflection features for collaboration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}