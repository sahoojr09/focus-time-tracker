'use client'

import { useMsal } from '@azure/msal-react'
import { loginRequest } from '@/lib/msalConfig'
import { Timer, TrendingUp, Target, BarChart3 } from 'lucide-react'

export default function LoginPage() {
  const { instance } = useMsal()

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Timer className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Focus Time Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track your study hours, integrate with Microsoft To Do, and boost your productivity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <TrendingUp className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Track Focus Time</h3>
            <p className="text-gray-600">Monitor your study sessions with precision timing and task association</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Target className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Microsoft To Do</h3>
            <p className="text-gray-600">Seamlessly integrate with your existing tasks and workflows</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <BarChart3 className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">Get weekly and monthly insights into your productivity patterns</p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg shadow-lg transition-all transform hover:scale-105"
          >
            Sign in with Microsoft
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Connect your Microsoft account to get started
          </p>
        </div>
      </div>
    </div>
  )
}