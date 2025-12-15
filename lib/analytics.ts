import { supabase, FocusSession } from './supabase'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, parseISO } from 'date-fns'

export interface DailyStats {
  date: string
  totalMinutes: number
  sessionsCount: number
  tasksCompleted: number
}

export interface WeeklyStats {
  weekStart: string
  weekEnd: string
  totalMinutes: number
  dailyBreakdown: DailyStats[]
  mostProductiveDay: string
  averageSessionLength: number
}

export interface MonthlyStats {
  month: string
  totalMinutes: number
  weeklyBreakdown: WeeklyStats[]
  totalSessions: number
  averageDaily: number
  productivityScore: number
}

export class AnalyticsService {
  static async getDailyStats(userId: string, date: Date): Promise<DailyStats> {
    const startDate = format(date, 'yyyy-MM-dd')
    const endDate = format(date, 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', `${startDate}T00:00:00`)
      .lte('start_time', `${endDate}T23:59:59`)

    if (error) throw error

    const sessions = data as FocusSession[]
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0)

    return {
      date: startDate,
      totalMinutes,
      sessionsCount: sessions.length,
      tasksCompleted: new Set(sessions.map(s => s.task_id).filter(Boolean)).size,
    }
  }

  static async getWeeklyStats(userId: string, date: Date): Promise<WeeklyStats> {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', weekStart.toISOString())
      .lte('start_time', weekEnd.toISOString())

    if (error) throw error

    const sessions = data as FocusSession[]
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0)

    // Group by day
    const dailyMap = new Map<string, FocusSession[]>()
    sessions.forEach(session => {
      const day = format(parseISO(session.start_time), 'yyyy-MM-dd')
      if (!dailyMap.has(day)) {
        dailyMap.set(day, [])
      }
      dailyMap.get(day)!.push(session)
    })

    const dailyBreakdown: DailyStats[] = Array.from(dailyMap.entries()).map(([date, daySessions]) => ({
      date,
      totalMinutes: daySessions.reduce((sum, s) => sum + s.duration_minutes, 0),
      sessionsCount: daySessions.length,
      tasksCompleted: new Set(daySessions.map(s => s.task_id).filter(Boolean)).size,
    }))

    const mostProductiveDay = dailyBreakdown.reduce((max, day) => 
      day.totalMinutes > max.totalMinutes ? day : max
    , dailyBreakdown[0] || { date: '', totalMinutes: 0, sessionsCount: 0, tasksCompleted: 0 }).date

    return {
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      weekEnd: format(weekEnd, 'yyyy-MM-dd'),
      totalMinutes,
      dailyBreakdown,
      mostProductiveDay,
      averageSessionLength: sessions.length > 0 ? totalMinutes / sessions.length : 0,
    }
  }

  static async getMonthlyStats(userId: string, date: Date): Promise<MonthlyStats> {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', monthStart.toISOString())
      .lte('start_time', monthEnd.toISOString())

    if (error) throw error

    const sessions = data as FocusSession[]
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0)
    const daysInMonth = monthEnd.getDate()
    const averageDaily = totalMinutes / daysInMonth

    // Calculate productivity score (0-100)
    const targetDailyMinutes = 240 // 4 hours
    const productivityScore = Math.min(100, (averageDaily / targetDailyMinutes) * 100)

    return {
      month: format(date, 'MMMM yyyy'),
      totalMinutes,
      weeklyBreakdown: [], // Can be populated if needed
      totalSessions: sessions.length,
      averageDaily,
      productivityScore: Math.round(productivityScore),
    }
  }
}