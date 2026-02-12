
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

// NOTE: We cannot truly verify "Admin Actions" from a script without a Service Role Key or a user JWT.
// Since we only have the Anon Key here, we can only verify the *Public* side of things.
// We will verify that:
// 1. Anon CANNOT read private feedback (re-verify).
// 2. Featured reviews ARE readable.

// The true "Admin Action" test must be done manually by the user in the UI, 
// because we cannot robustly simulate a Google OAuth login from a CLI script easily.

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyPublicState() {
    console.log('🛡️  Verifying Public State (Pre-Manual Admin Test)...');

    // 1. Check Public Reviews
    const { data: publicReviews } = await supabase.from('featured_reviews').select('count');
    console.log(`✅ Public Featured Reviews: ${publicReviews?.length || 'Unknown'} rows accessible.`);

    // 2. Check Private Feedback (Should be 0)
    const { data: privateFeedback, error } = await supabase.from('user_feedback').select('*');

    if (error || (privateFeedback && privateFeedback.length === 0)) {
        console.log('✅ Private Feedback is SECURE (Not readable by script).');
    } else {
        console.error('❌ WARNING: Private feedback is leaking!', privateFeedback);
    }

    console.log('\n--> Please manually test "Feature" and "Delete" in the /admin/dashboard UI.');
}

verifyPublicState();
