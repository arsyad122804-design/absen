import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ttvyzeszqbanoworyxys.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dnl6ZXN6cWJhbm93b3J5eHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MjAzMjQsImV4cCI6MjEwMjA5NjMyNH0.jWBgneyKJvlzKkS6_6AcKuAIe-d8C_Jk8OjnMBgXYn0'

export const supabase = createClient(supabaseUrl, supabaseKey)
