'use client'

import { useState, useEffect } from 'react'
import { useMsal } from '@azure/msal-react'
import { AnalyticsService, WeeklyStats, MonthlyStats } from '@/lib/analytics'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar, TrendingUp, Clock, Target } from 'lucide-react'

type ViewType = 'week' | 'month'

export default function Analytics() {
  const { accounts } = useMsal()
  const [viewType, setViewType] = useState<ViewType>('week')
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [viewType, accounts])

  const loadAnalytics = async () => {
    if (!accounts[0]) return

    setLoading(true)
    try {
      const userId = accounts[0].localAccountId
      const now = new Date()

      if (viewType === 'week') {
        const stats = await AnalyticsService.getWeeklyStats(userId, now)
        setWeeklyStats(stats)
      } else {
        const stats = await AnalyticsService.getMonthlyStats(userId, now)
        setMonthlyStats(stats)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMinutesToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setViewType('week')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              viewType === 'week'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewType('month')}
            className={`px-6 py-2 rounded-md font-medium transition ${
              viewType === 'month'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Weekly View */}
      {viewType === 'week' && weeklyStats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {formatMinutesToHours(weeklyStats.totalMinutes)}
              </div>
              <div className="text-sm text-gray-600">Total Focus Time</div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {weeklyStats.dailyBreakdown.length}
              </div>
              <div className="text-sm text-gray-600">Active Days</div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {Math.round(weeklyStats.averageSessionLength)}m
              </div>
              <div className="text-sm text-gray-600">Avg Session</div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {weeklyStats.dailyBreakdown.reduce((sum, d) => sum + d.tasksCompleted, 0)}
              </div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
          </div>

          {/* Daily Breakdown Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Focus Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyStats.dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number) => [formatMinutesToHours(value), 'Focus Time']}
                />
                <Bar dataKey="totalMinutes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Most Productive Day */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">🏆 Most Productive Day</h3>
            <p className="text-2xl font-bold">
              {weeklyStats.mostProductiveDay 
                ? new Date(weeklyStats.mostProductiveDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : 'No data yet'}
            </p>
          </div>
        </>
      )}

      {/* Monthly View */}
      {viewType === 'month' && monthlyStats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {formatMinutesToHours(monthlyStats.totalMinutes)}
              </div>
              <div className="text-sm text-gray-600">Total Focus Time</div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {monthlyStats.totalSessions}
              </div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {formatMinutesToHours(Math.round(monthlyStats.averageDaily))}
              </div>
              <div className="text-sm text-gray-600">Daily Average</div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {monthlyStats.productivityScore}%
              </div>
              <div className="text-sm text-gray-600">Productivity Score</div>
            </div>
          </div>

          {/* Productivity Score */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Score</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {monthlyStats.productivityScore >= 80 ? 'Excellent' : 
                     monthlyStats.productivityScore >= 60 ? 'Good' : 
                     monthlyStats.productivityScore >= 40 ? 'Fair' : 'Needs Improvement'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {monthlyStats.productivityScore}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-blue-200">
                <div
                  style={{ width: `${monthlyStats.productivityScore}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Based on a target of 4 hours daily focus time. Keep up the great work!
            </p>
          </div>

          {/* Month Summary */}
          <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">📊 {monthlyStats.month} Summary</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm opacity-90">Total Hours</p>
                <p className="text-2xl font-bold">{Math.round(monthlyStats.totalMinutes / 60)}h</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Sessions</p>
                <p className="text-2xl font-bold">{monthlyStats.totalSessions}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}