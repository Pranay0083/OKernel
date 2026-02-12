
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Env vars missing.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAdminSecurity() {
    console.log('🛡️  Verifying Admin Whitelist Security...');

    // TEST: Anonymous Read (Should FAIL to see anything)
    console.log('[TEST] Attempting Anonymous Read of admin_whitelist...');

    const { data, error } = await supabase
        .from('admin_whitelist')
        .select('*');

    if (error) {
        console.log('✅ SUCCESS: Read blocked by Error (RLS Active).', error.message);
    } else if (data && data.length === 0) {
        console.log('✅ SUCCESS: Read returned 0 rows. Anonymous users cannot see the whitelist.');
    } else {
        console.error('❌ CRITICAL FAILURE: Anonymous user leaked the admin list!', data);
        process.exit(1);
    }
}

verifyAdminSecurity();
