'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Loader2, Mail, Lock, User } from 'lucide-react'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onToggleMode: () => void
}

export default function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    console.log('Form submitted with mode:', mode)
    console.log('Email:', email)
    console.log('Password length:', password.length)

    try {
      if (mode === 'signup') {
        console.log('Attempting signup with Supabase...')
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://bootcamp-reflections.vercel.app')}/auth/callback`
          }
        })
        console.log('Signup result:', { data, error })

        if (error) {
          setError(error.message)
        } else {
          setSuccess('Account created successfully! Please check your email to confirm your account.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })

        if (error) {
          setError(error.message)
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white">
      <div className="pb-8 mb-8 text-center">
        <h1 className="text-2xl font-light text-gray-900 mb-2">
          {mode === 'signin' ? 'Welcome back' : 'Get started'}
        </h1>
        <p className="text-sm text-gray-500">
          {mode === 'signin' 
            ? 'Sign in to your account' 
            : 'Create your account to continue'
          }
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {mode === 'signup' && (
            <div className="space-y-4">
              <label htmlFor="name" className="text-base font-medium text-gray-900">
                Name (optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12 border-gray-200 focus:border-gray-400 focus:ring-0 rounded-lg h-12 text-base"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label htmlFor="email" className="text-base font-medium text-gray-900">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 border-gray-200 focus:border-gray-400 focus:ring-0 rounded-lg h-12 text-base"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label htmlFor="password" className="text-base font-medium text-gray-900">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 border-gray-200 focus:border-gray-400 focus:ring-0 rounded-lg h-12 text-base"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium text-base hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'signin' ? 'Sign in' : 'Create account'
            )}
          </button>

          <div className="text-center text-sm text-gray-500">
            {mode === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="text-gray-900 hover:text-gray-700 font-medium hover:underline transition-colors"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onToggleMode}
                  className="text-gray-900 hover:text-gray-700 font-medium hover:underline transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}