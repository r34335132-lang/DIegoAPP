export type UserRole = "coach" | "student"

export interface Profile {
  id: string
  email: string
  username: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  coach_id: string
  age: number | null
  weight: number | null
  sport: string | null
  medical_condition: string | null
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Exercise {
  id: string
  coach_id: string
  name: string
  description: string | null
  video_url: string | null
  duration_seconds: number | null
  folder_id: string | null
  created_at: string
  updated_at: string
}

export interface Routine {
  id: string
  coach_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface RoutineExercise {
  id: string
  routine_id: string
  exercise_id: string
  order_index: number
  sets: number
  reps: number | null
  rest_seconds: number | null
  created_at: string
  exercise?: Exercise
}

export interface StudentRoutine {
  id: string
  student_id: string
  routine_id: string
  assigned_at: string
  routine?: Routine
}

export interface WorkoutSession {
  id: string
  student_id: string
  routine_id: string
  started_at: string
  ended_at: string | null
  total_exercise_time: number
  total_rest_time: number
  total_video_time: number
  status: "in_progress" | "completed" | "cancelled"
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
  sender?: Profile
  receiver?: Profile
}

export interface ExerciseFolder {
  id: string
  coach_id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}
