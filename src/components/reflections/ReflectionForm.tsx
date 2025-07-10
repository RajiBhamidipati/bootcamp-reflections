'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ReflectionContent } from '@/types'
import { analyzeSentiment, extractKeywords } from '@/lib/sentiment'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Slider } from '@/components/ui/Slider'
import { Loader2, Save, Heart, Brain, Zap, Target } from 'lucide-react'

interface ReflectionFormProps {
  type: 'daily' | 'weekly' | 'project' | 'mood'
  onSubmit?: () => void
}

export default function ReflectionForm({ type, onSubmit }: ReflectionFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ReflectionContent>({
    phase: 'week-1-8',
    overall_mood: 5,
    energy_level: 5,
    stress_level: 5,
    motivation: 5,
    daily_highlight: '',
    challenges_faced: '',
    learning_progress: '',
    goals_tomorrow: '',
    gratitude: '',
    weekly_goals_met: false,
    biggest_learning: '',
    areas_for_improvement: '',
    project_name: '',
    technologies_used: [],
    project_satisfaction: 5,
    collaboration_rating: 5,
    custom_fields: {}
  })

  const handleSliderChange = (field: string, value: number[]) => {
    setFormData(prev => ({ ...prev, [field]: value[0] }))
  }

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Analyze sentiment and extract keywords from text fields
      const textFields = [
        formData.daily_highlight,
        formData.challenges_faced,
        formData.learning_progress,
        formData.goals_tomorrow,
        formData.gratitude,
        formData.biggest_learning,
        formData.areas_for_improvement
      ].filter(Boolean)

      const combinedText = textFields.join(' ')
      const sentimentResult = analyzeSentiment(combinedText)
      const keywords = extractKeywords(combinedText)

      // Create reflection record
      const { error: insertError } = await supabase
        .from('reflections')
        .insert({
          user_id: user.id,
          type,
          title: getReflectionTitle(type, formData),
          content: formData,
          mood_score: formData.overall_mood,
          sentiment_score: sentimentResult.score,
          keywords
        })

      if (insertError) {
        setError(insertError.message)
        return
      }

      // Update daily analytics
      const today = new Date().toISOString().split('T')[0]
      await supabase.rpc('calculate_daily_analytics', {
        user_uuid: user.id,
        target_date: today
      })

      setSuccess('Reflection saved successfully!')
      
      // Reset form
      setFormData({
        phase: 'week-1-8',
        overall_mood: 5,
        energy_level: 5,
        stress_level: 5,
        motivation: 5,
        daily_highlight: '',
        challenges_faced: '',
        learning_progress: '',
        goals_tomorrow: '',
        gratitude: '',
        weekly_goals_met: false,
        biggest_learning: '',
        areas_for_improvement: '',
        project_name: '',
        technologies_used: [],
        project_satisfaction: 5,
        collaboration_rating: 5,
        custom_fields: {}
      })

      onSubmit?.()
    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Error saving reflection:', error)
    } finally {
      setLoading(false)
    }
  }

  const getReflectionTitle = (type: string, data: ReflectionContent) => {
    const today = new Date().toLocaleDateString()
    switch (type) {
      case 'daily':
        return `Daily Reflection - ${today}`
      case 'weekly':
        return `Weekly Reflection - ${today}`
      case 'project':
        return `Project Reflection: ${data.project_name || 'Unnamed Project'}`
      case 'mood':
        return `Mood Check-in - ${today}`
      default:
        return `Reflection - ${today}`
    }
  }

  const renderMoodSlider = (
    label: string,
    field: keyof ReflectionContent,
    icon: React.ReactNode,
    color: string
  ) => (
    <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-full ${color}`}>
            {icon}
          </div>
          <label className="text-sm font-medium text-gray-700">{label}</label>
        </div>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
          {String(formData[field])}
        </div>
      </div>
      <div className="px-2">
        <Slider
          value={[formData[field] as number]}
          onValueChange={(value) => handleSliderChange(field as string, value)}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>1 (Low)</span>
          <span>5</span>
          <span>10 (High)</span>
        </div>
      </div>
    </div>
  )

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'daily' && <Heart className="h-5 w-5 text-red-500" />}
          {type === 'weekly' && <Brain className="h-5 w-5 text-blue-500" />}
          {type === 'project' && <Target className="h-5 w-5 text-green-500" />}
          {type === 'mood' && <Zap className="h-5 w-5 text-yellow-500" />}
          {type.charAt(0).toUpperCase() + type.slice(1)} Reflection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phase Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bootcamp Phase</label>
            <Select
              value={formData.phase}
              onValueChange={(value) => handleInputChange('phase', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your current phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre-bootcamp">Pre-Bootcamp</SelectItem>
                <SelectItem value="week-1-8">Weeks 1-8 (Foundation)</SelectItem>
                <SelectItem value="week-9-16">Weeks 9-16 (Intermediate)</SelectItem>
                <SelectItem value="week-17-24">Weeks 17-24 (Advanced)</SelectItem>
                <SelectItem value="post-graduation">Post-Graduation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mood Sliders */}
          <div className="space-y-4">
            {renderMoodSlider('Overall Mood', 'overall_mood', <Heart className="h-4 w-4" />, 'bg-red-100')}
            {renderMoodSlider('Energy Level', 'energy_level', <Zap className="h-4 w-4" />, 'bg-yellow-100')}
            {renderMoodSlider('Stress Level', 'stress_level', <Brain className="h-4 w-4" />, 'bg-purple-100')}
            {renderMoodSlider('Motivation', 'motivation', <Target className="h-4 w-4" />, 'bg-green-100')}
          </div>

          {/* Text Fields - Context Aware */}
          {(type === 'daily' || type === 'mood') && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Daily Highlight</label>
                <Textarea
                  value={formData.daily_highlight}
                  onChange={(e) => handleInputChange('daily_highlight', e.target.value)}
                  placeholder="What was the best part of your day?"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Challenges Faced</label>
                <Textarea
                  value={formData.challenges_faced}
                  onChange={(e) => handleInputChange('challenges_faced', e.target.value)}
                  placeholder="What challenges did you encounter?"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Learning Progress</label>
                <Textarea
                  value={formData.learning_progress}
                  onChange={(e) => handleInputChange('learning_progress', e.target.value)}
                  placeholder="What did you learn today?"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Goals for Tomorrow</label>
                <Textarea
                  value={formData.goals_tomorrow}
                  onChange={(e) => handleInputChange('goals_tomorrow', e.target.value)}
                  placeholder="What do you want to accomplish tomorrow?"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {type === 'weekly' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Weekly Goals Met</label>
                <div className="mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.weekly_goals_met}
                      onChange={(e) => handleInputChange('weekly_goals_met', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">I met my weekly goals</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Biggest Learning</label>
                <Textarea
                  value={formData.biggest_learning}
                  onChange={(e) => handleInputChange('biggest_learning', e.target.value)}
                  placeholder="What was your biggest learning this week?"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Areas for Improvement</label>
                <Textarea
                  value={formData.areas_for_improvement}
                  onChange={(e) => handleInputChange('areas_for_improvement', e.target.value)}
                  placeholder="What areas would you like to improve?"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {type === 'project' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  value={formData.project_name}
                  onChange={(e) => handleInputChange('project_name', e.target.value)}
                  placeholder="Enter project name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Technologies Used</label>
                <Input
                  value={formData.technologies_used?.join(', ')}
                  onChange={(e) => handleInputChange('technologies_used', e.target.value.split(', '))}
                  placeholder="React, Node.js, PostgreSQL..."
                  className="mt-1"
                />
              </div>
              {renderMoodSlider('Project Satisfaction', 'project_satisfaction', <Target className="h-4 w-4" />, 'bg-blue-100')}
              {renderMoodSlider('Collaboration Rating', 'collaboration_rating', <Heart className="h-4 w-4" />, 'bg-green-100')}
            </div>
          )}

          {/* Gratitude - Always shown */}
          <div>
            <label className="text-sm font-medium">Gratitude</label>
            <Textarea
              value={formData.gratitude}
              onChange={(e) => handleInputChange('gratitude', e.target.value)}
              placeholder="What are you grateful for today?"
              className="mt-1"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Reflection
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}