'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Reflection, AnalyticsData, NotificationData } from '@/types'

export function useRealTimeReflections() {
  const { user } = useAuth()
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReflections = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching reflections:', error)
      } else {
        setReflections(data || [])
      }
    } catch (error) {
      console.error('Error fetching reflections:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleRealTimeUpdate = useCallback((payload: { eventType: string; new?: unknown; old?: unknown }) => {
    switch (payload.eventType) {
      case 'INSERT':
        if (payload.new) {
          setReflections(prev => [payload.new as Reflection, ...prev])
        }
        break
      case 'UPDATE':
        if (payload.new) {
          const newReflection = payload.new as Reflection
          setReflections(prev => 
            prev.map(reflection => 
              reflection.id === newReflection.id ? newReflection : reflection
            )
          )
        }
        break
      case 'DELETE':
        if (payload.old) {
          const oldReflection = payload.old as Reflection
          setReflections(prev => 
            prev.filter(reflection => reflection.id !== oldReflection.id)
          )
        }
        break
    }
  }, [])

  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchReflections()

    // Set up real-time subscription
    const subscription = supabase
      .channel('reflections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reflections',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleRealTimeUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, fetchReflections, handleRealTimeUpdate])

  const addReflection = async (reflection: Omit<Reflection, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .insert(reflection)
        .select()
        .single()

      if (error) {
        console.error('Error adding reflection:', error)
        return { error }
      }

      return { data }
    } catch (error) {
      console.error('Error adding reflection:', error)
      return { error }
    }
  }

  const updateReflection = async (id: string, updates: Partial<Reflection>) => {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating reflection:', error)
        return { error }
      }

      return { data }
    } catch (error) {
      console.error('Error updating reflection:', error)
      return { error }
    }
  }

  const deleteReflection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reflections')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting reflection:', error)
        return { error }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting reflection:', error)
      return { error }
    }
  }

  return {
    reflections,
    loading,
    addReflection,
    updateReflection,
    deleteReflection,
    refresh: fetchReflections
  }
}

export function useRealTimeAnalytics() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(365)

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
  }, [user])

  const handleRealTimeUpdate = useCallback((payload: { eventType: string; new?: unknown; old?: unknown }) => {
    switch (payload.eventType) {
      case 'INSERT':
        if (payload.new) {
          setAnalytics(prev => [payload.new as AnalyticsData, ...prev])
        }
        break
      case 'UPDATE':
        if (payload.new) {
          const newAnalytics = payload.new as AnalyticsData
          setAnalytics(prev => 
            prev.map(analytics => 
              analytics.id === newAnalytics.id ? newAnalytics : analytics
            )
          )
        }
        break
      case 'DELETE':
        if (payload.old) {
          const oldAnalytics = payload.old as AnalyticsData
          setAnalytics(prev => 
            prev.filter(analytics => analytics.id !== oldAnalytics.id)
          )
        }
        break
    }
  }, [])

  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchAnalytics()

    // Set up real-time subscription
    const subscription = supabase
      .channel('analytics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleRealTimeUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, fetchAnalytics, handleRealTimeUpdate])

  return {
    analytics,
    loading,
    refresh: fetchAnalytics
  }
}

export function useRealTimeNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
      } else {
        setNotifications(data || [])
        setUnreadCount(data?.filter(n => !n.read).length || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleRealTimeUpdate = useCallback((payload: { eventType: string; new?: unknown; old?: unknown }) => {
    switch (payload.eventType) {
      case 'INSERT':
        if (payload.new) {
          const newNotification = payload.new as NotificationData
          setNotifications(prev => [newNotification, ...prev])
          if (!newNotification.read) {
            setUnreadCount(prev => prev + 1)
          }
        }
        break
      case 'UPDATE':
        if (payload.new) {
          const newNotification = payload.new as NotificationData
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === newNotification.id ? newNotification : notification
            )
          )
          // Recalculate unread count
          if (payload.old) {
            const oldNotification = payload.old as NotificationData
            setUnreadCount(prev => {
              // Check if read status changed
              if (!oldNotification.read && newNotification.read) {
                return prev - 1
              }
              if (oldNotification.read && !newNotification.read) {
                return prev + 1
              }
              return prev
            })
          }
        }
        break
      case 'DELETE':
        if (payload.old) {
          const oldNotification = payload.old as NotificationData
          setNotifications(prev => 
            prev.filter(notification => notification.id !== oldNotification.id)
          )
          if (!oldNotification.read) {
            setUnreadCount(prev => prev - 1)
          }
        }
        break
    }
  }, [])

  useEffect(() => {
    if (!user) return

    // Initial fetch
    fetchNotifications()

    // Set up real-time subscription
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleRealTimeUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, fetchNotifications, handleRealTimeUpdate])

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) {
        console.error('Error marking notification as read:', error)
        return { error }
      }

      return { success: true }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { error }
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return { error }
      }

      return { success: true }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return { error }
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  }
}