'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import ReflectionForm from '@/components/reflections/ReflectionForm'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MoodReflectionPage() {
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
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mood Check-in
            </h1>
            <p className="text-gray-600">
              Quick mood and energy level check-in
            </p>
          </div>
        </div>

        <ReflectionForm 
          type="mood" 
          onSubmit={() => router.push('/')}
        />
      </div>
    </div>
  )
}