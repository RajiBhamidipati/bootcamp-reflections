'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import AuthForm from '@/components/auth/AuthForm'
import UserDashboard from '@/components/dashboard/UserDashboard'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Heart, LogOut, Settings, User } from 'lucide-react'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="flex space-x-1">
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-blue-600 text-sm font-medium">Loading your reflections...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-8 fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Bootcamp Reflections
                </h1>
              </div>
              <h2 className="text-5xl font-bold leading-tight text-gray-900">
                Track your learning{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  journey
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Capture insights, reflect on progress, and accelerate your growth with thoughtful daily reflections.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">📝</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Daily Reflections</h3>
                  <p className="text-sm text-gray-600">Track your daily progress</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
                <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">📊</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Visualize your growth</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="scale-in">
            <AuthForm 
              mode={authMode} 
              onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center slide-in">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                Bootcamp Reflections
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {user.name || user.email}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-xs text-blue-600 font-medium">
                      Administrator
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="stagger-children">
          {user.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <UserDashboard />
          )}
        </div>
      </main>
    </div>
  )
}
