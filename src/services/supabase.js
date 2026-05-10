import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dwyzycovqccfbucovqzt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3eXp5Y292cWNjZmJ1Y292cXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MjgyNTcsImV4cCI6MjA5NDAwNDI1N30.L7TWKXkB6laud7HMvP-2JPgJyCvjE8AvF18pAKm3xQw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const ADMIN_PASSWORD = 'ana@2026'