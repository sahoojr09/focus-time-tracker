'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMsal } from '@azure/msal-react'
import { Play, Pause, Square, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MicrosoftGraphService, TodoTask, TodoList } from '@/lib/microsoftGraph'
import { loginRequest } from '@/lib/msalConfig'

export default function FocusTimer() {
  const { instance, accounts } = useMsal()
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus')
  const [selectedTask, setSelectedTask] = useState<TodoTask | null>(null)
  const [tasks, setTasks] = useState<TodoTask[]>([])
  const [taskLists, setTaskLists] = useState<TodoList[]>([])
  const [selectedListId, setSelectedListId] = useState<string>('')
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  // Load tasks from Microsoft To Do
  const loadTasks = useCallback(async () => {
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })

      const graphService = new MicrosoftGraphService(response.accessToken)
      const lists = await graphService.getTaskLists()
      setTaskLists(lists)

      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id)
        const tasksData = await graphService.getTasks(lists[0].id)
        setTasks(tasksData.filter(t => t.status !== 'completed'))
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }, [instance, accounts, selectedListId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Load tasks when list changes
  useEffect(() => {
    if (selectedListId) {
      const loadListTasks = async () => {
        try {
          const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          })
          const graphService = new MicrosoftGraphService(response.accessToken)
          const tasksData = await graphService.getTasks(selectedListId)
          setTasks(tasksData.filter(t => t.status !== 'completed'))
        } catch (error) {
          console.error('Error loading list tasks:', error)
        }
      }
      loadListTasks()
    }
  }, [selectedListId, instance, accounts])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime - 1)
      }, 1000)
    } else if (time === 0) {
      handleSessionComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, time])

  const handleStart = () => {
    if (!isRunning) {
      setSessionStartTime(new Date())
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = async () => {
    if (sessionStartTime) {
      await saveSession()
    }
    setIsRunning(false)
    setTime(sessionType === 'focus' ? 25 * 60 : 5 * 60)
    setSessionStartTime(null)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTime(sessionType === 'focus' ? 25 * 60 : 5 * 60)
    setSessionStartTime(null)
  }

  const handleSessionComplete = async () => {
    setIsRunning(false)
    if (sessionStartTime) {
      await saveSession()
    }
    
    // Auto-switch between focus and break
    if (sessionType === 'focus') {
      setSessionType('break')
      setTime(5 * 60)
    } else {
      setSessionType('focus')
      setTime(25 * 60)
    }
    setSessionStartTime(null)
  }

  const saveSession = async () => {
    if (!sessionStartTime || !accounts[0]) return

    const endTime = new Date()
    const durationMinutes = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 60000)

    try {
      await supabase.from('focus_sessions').insert({
        user_id: accounts[0].localAccountId,
        task_id: selectedTask?.id,
        task_name: selectedTask?.title || 'Untitled Session',
        start_time: sessionStartTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        session_type: sessionType,
      })
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = sessionType === 'focus' 
    ? ((25 * 60 - time) / (25 * 60)) * 100
    : ((5 * 60 - time) / (5 * 60)) * 100

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Session Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => {
                setSessionType('focus')
                setTime(25 * 60)
                setIsRunning(false)
              }}
              className={`px-6 py-2 rounded-md font-medium transition ${
                sessionType === 'focus'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600'
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => {
                setSessionType('break')
                setTime(5 * 60)
                setIsRunning(false)
              }}
              className={`px-6 py-2 rounded-md font-medium transition ${
                sessionType === 'break'
                  ? 'bg-white text-green-600 shadow'
                  : 'text-gray-600'
              }`}
            >
              Break
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          <div className="w-64 h-64 mx-auto">
            <svg className="transform -rotate-90 w-64 h-64">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke={sessionType === 'focus' ? '#3b82f6' : '#10b981'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900">{formatTime(time)}</div>
                <div className="text-sm text-gray-500 mt-2 uppercase tracking-wide">
                  {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Task List
          </label>
          <select
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isRunning}
          >
            {taskLists.map(list => (
              <option key={list.id} value={list.id}>
                {list.displayName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Task (Optional)
          </label>
          <select
            value={selectedTask?.id || ''}
            onChange={(e) => {
              const task = tasks.find(t => t.id === e.target.value)
              setSelectedTask(task || null)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isRunning}
          >
            <option value="">No task selected</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition"
            >
              <Play className="w-5 h-5" />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-medium transition"
            >
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </button>
          )}
          <button
            onClick={handleStop}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            <Square className="w-5 h-5" />
            <span>Stop</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  )
}