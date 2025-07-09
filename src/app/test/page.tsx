'use client'

import { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult('')

    try {
      // Direct fetch to Supabase REST API
      const response = await fetch('https://muzedjmymisbfbkdoyev.supabase.co/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11emVkam15bWlzYmZia2RveWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjc2NTAsImV4cCI6MjA2NzY0MzY1MH0.v6XiiOU6W_A_Ujzc20bScgo7owS3XtjOJWfcSID_CsI',
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`✅ SUCCESS: Connected to Supabase!\n${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ ERROR: ${response.status} - ${response.statusText}`)
      }
    } catch (error) {
      setResult(`❌ FETCH ERROR: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testAuth = async () => {
    setLoading(true)
    setResult('')

    try {
      // Test auth endpoint directly
      const response = await fetch('https://muzedjmymisbfbkdoyev.supabase.co/auth/v1/signup', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11emVkam15bWlzYmZia2RveWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjc2NTAsImV4cCI6MjA2NzY0MzY1MH0.v6XiiOU6W_A_Ujzc20bScgo7owS3XtjOJWfcSID_CsI',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123'
        })
      })

      const data = await response.json()
      setResult(`Auth test result: ${response.status}\n${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`❌ AUTH ERROR: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Basic Connection'}
        </button>

        <button
          onClick={testAuth}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? 'Testing...' : 'Test Auth Endpoint'}
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}