import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://acabsferoldgaxunfzgc.supabase.co';
const supabaseKey = 'sb_secret_apqDD0NggvTWhahAKZiWyQ_jp11w27w';

export const supabase = createClient(supabaseUrl, supabaseKey);
