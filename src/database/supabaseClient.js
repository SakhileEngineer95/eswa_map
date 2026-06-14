import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://soepadocivmmyufnwrot.supabase.co';        // ← Replace
const supabaseAnonKey = 'sb_publishable_PQx4X9l1YaqU9kR_Eb770w_Wfe6NZ3W';             // ← Replace

export const supabase = createClient(supabaseUrl, supabaseAnonKey);