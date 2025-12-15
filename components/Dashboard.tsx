'use client'

import { useState } from 'react'
import { useMsal } from '@azure/msal-react'
import { LogOut, Timer, BarChart3, Settings } from 'lucide-react'
import FocusTimer from './FocusTimer'
import Analytics from './Analytics'
import SettingsPanel from './SettingsPanel'

type Tab = 'timer' | 'analytics' | 'settings'

export default function Dashboard() {
  const { instance, accounts } = useMsal()
  const [activeTab, setActiveTab] = useState<Tab>('timer')

  const handleLogout = () => {
    instance.logoutPopup()
  }

  const userName = accounts[0]?.name || 'User'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Timer className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Focus Time Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {userName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('timer')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'timer'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Timer className="w-5 h-5" />
              <span>Focus Timer</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'timer' && <FocusTimer />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  )
}