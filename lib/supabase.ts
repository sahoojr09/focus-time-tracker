import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface FocusSession {
  id: string
  user_id: string
  task_id?: string
  task_name: string
  start_time: string
  end_time?: string
  duration_minutes: number
  session_type: 'focus' | 'break'
  created_at: string
}

export interface UserGoal {
  id: string
  user_id: string
  daily_target_minutes: number
  weekly_target_minutes: number
  created_at: string
}