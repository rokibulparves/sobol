//supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://evotwyhhjcjrtmmdjtar.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2b3R3eWhoamNqcnRtbWRqdGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2ODE1NzAsImV4cCI6MjA2MjI1NzU3MH0.lnEQhCabVgNuYA5JXvSgaUsX-kYv96iQyP4voQN2tdE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})