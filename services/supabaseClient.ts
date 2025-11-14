import { createClient } from '@supabase/supabase-js'

// These values were provided for the project 'Lead-Management'.
// In a typical project, these would be stored in environment variables.
const supabaseUrl = 'https://ntrskodidlyiibochwbu.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50cnNrb2RpZGx5aWlib2Nod2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTcwMDAsImV4cCI6MjA3ODY3MzAwMH0.XA8_BgAopuEqkpV-QAj2zv0xHr810ND6ERARbTXAHh8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
