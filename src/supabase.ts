import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';

const supabaseUrl = 'https://eimnzwabtvjwdwcnqkky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbW56d2FidHZqd2R3Y25xa2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMzU2NDQsImV4cCI6MjA1NzkxMTY0NH0.73SqrUXWo1OR3wEn-EYumhB-X-bqa_f3lKgr23w-ouI';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
