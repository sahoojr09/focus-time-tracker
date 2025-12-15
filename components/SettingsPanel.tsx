'use client'

import { useState, useEffect } from 'react'
import { useMsal } from '@azure/msal-react'
import { supabase } from '@/lib/supabase'
import { Save, Target, Bell } from 'lucide-react'

export default function SettingsPanel() {
  const { accounts } = useMsal()
  const [dailyTarget, setDailyTarget] = useState(240) // 4 hours default
  const [weeklyTarget, setWeeklyTarget] = useState(1680) // 28 hours default
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadGoals()
  }, [accounts])

  const loadGoals = async () => {
    if (!accounts[0]) return

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', accounts[0].localAccountId)
        .single()

      if (data) {
        setDailyTarget(data.daily_target_minutes)
        setWeeklyTarget(data.weekly_target_minutes)
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }

  const handleSave = async () => {
    if (!accounts[0]) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_goals')
        .upsert({
          user_id: accounts[0].localAccountId,
          daily_target_minutes: dailyTarget,
          weekly_target_minutes: weeklyTarget,
        })

      if (!error) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving goals:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>

        {/* Daily Goal */}
        <div className="mb-6">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Daily Focus Goal (minutes)</span>
          </label>
          <input
            type="number"
            value={dailyTarget}
            onChange={(e) => setDailyTarget(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="15"
          />
          <p className="text-sm text-gray-500 mt-1">
            {Math.floor(dailyTarget / 60)}h {dailyTarget % 60}m per day
          </p>
        </div>

        {/* Weekly Goal */}
        <div className="mb-6">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span>Weekly Focus Goal (minutes)</span>
          </label>
          <input
            type="number"
            value={weeklyTarget}
            onChange={(e) => setWeeklyTarget(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="60"
          />
          <p className="text-sm text-gray-500 mt-1">
            {Math.floor(weeklyTarget / 60)}h {weeklyTarget % 60}m per week
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center justify-center space-x-2 w-full py-3 rounded-lg font-medium transition ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Save className="w-5 h-5" />
          <span>{saved ? 'Saved!' : saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Notifications (Coming Soon) */}
      <div className="bg-white rounded-xl shadow p-6 opacity-60">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
        </div>
        <p className="text-sm text-gray-600">
          Get reminders to take breaks and notifications when you reach your goals.
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{accounts[0]?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{accounts[0]?.username}</span>
          </div>
        </div>
      </div>
    </div>
  )
}