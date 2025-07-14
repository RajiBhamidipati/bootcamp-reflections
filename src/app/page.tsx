'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import AuthForm from '@/components/auth/AuthForm'
import UserDashboard from '@/components/dashboard/UserDashboard'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { useState } from 'react'
import { Heart, LogOut, User } from 'lucide-react'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 text-gray-900">
            <Heart className="h-12 w-12 animate-pulse" />
          </div>
          <div className="flex space-x-1">
            <div className="h-1 w-1 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="h-1 w-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="h-1 w-1 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-gray-600 text-sm">Loading your reflections...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3">
                <div className="h-8 w-8 text-gray-900">
                  <Heart className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-light text-gray-900">
                  Bootcamp Reflections
                </h1>
              </div>
              <h2 className="text-4xl font-light leading-tight text-gray-900">
                Track your learning journey
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Capture insights, reflect on progress, and accelerate your growth with thoughtful daily reflections.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-6 bg-white rounded-lg border border-gray-200">
                <div className="h-8 w-8 text-gray-400">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Daily Reflections</h3>
                  <p className="text-sm text-gray-500">Track your daily progress</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-6 bg-white rounded-lg border border-gray-200">
                <div className="h-8 w-8 text-gray-400">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-500">Visualize your growth</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-6 w-6 text-gray-900">
                <Heart className="h-6 w-6" />
              </div>
              <span className="ml-3 text-xl font-light text-gray-900">
                Bootcamp Reflections
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200">
                <div className="h-6 w-6 bg-gray-900 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {user.name || user.email}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-xs text-gray-600">
                      Administrator
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
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
