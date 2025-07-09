'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import ReflectionForm from '@/components/reflections/ReflectionForm'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Heart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DailyReflectionPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    return <div>Please sign in to access this page.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-center">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Daily Reflection
            </h1>
            <p className="text-gray-600">
              Take a moment to reflect on your day and track your progress
            </p>
          </div>
        </div>

        <ReflectionForm 
          type="daily" 
          onSubmit={() => router.push('/')}
        />
      </div>
    </div>
  )
}