import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nohticgnlhxvukeulfix.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vaHRpY2dubGh4dnVrZXVsZml4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTc5ODUsImV4cCI6MjA5MTE5Mzk4NX0.d_YFm_BR7xeygFVUtYJvw1CYOqTRud0cCagdXlZnCfs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
