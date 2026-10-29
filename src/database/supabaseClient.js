import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL //"https://soepadocivmmyufnwrot.supabase.co" ;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY //"sb_publishable_PQx4X9l1YaqU9kR_Eb770w_Wfe6NZ3W";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);