
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runSecurityTests() {
    console.log('🛡️  Running Security Verification...');
    let passed = 0;
    let failed = 0;

    // TEST 1: READ PUBLIC REVIEWS (Should Succeed)
    console.log('\n[TEST 1] Reading Public Reviews (featured_reviews)...');
    const { data: publicData, error: publicError } = await supabase
        .from('featured_reviews')
        .select('*');

    if (publicError) {
        console.error('❌ FAILED: Could not read public reviews.', publicError.message);
        failed++;
    } else if (publicData.length === 0) {
        console.warn('⚠️  WARNING: No reviews found. Did seeding work?');
        // Not a failure of security, but functional issue
        passed++;
    } else {
        console.log(`✅ SUCCESS: Read ${publicData.length} public reviews.`);
        passed++;
    }

    // TEST 2: WRITE PRIVATE FEEDBACK (Should Succeed)
    console.log('\n[TEST 2] Writing Private Feedback (user_feedback)...');
    const { error: writeError } = await supabase
        .from('user_feedback')
        .insert([{
            message: 'Security Verification Test',
            version: 'TEST',
            user_agent: 'Verification Script'
        }]);

    if (writeError) {
        console.error('❌ FAILED: Could not write private feedback.', writeError.message);
        failed++;
    } else {
        console.log('✅ SUCCESS: Private feedback inserted.');
        passed++;
    }

    // TEST 3: READ PRIVATE FEEDBACK (Should Fail or return Empty)
    console.log('\n[TEST 3] Attempting to Read Private Feedback (user_feedback)...');
    const { data: privateData, error: privateError } = await supabase
        .from('user_feedback')
        .select('*');

    // Supabase RLS often returns empty array for "silent" reject, OR an error depending on config.
    // We expect either an error OR an empty array (meaning we can't see the row we just inserted).

    if (privateError) {
        console.log('✅ SUCCESS: Read blocked by Error (Expected).', privateError.message);
        passed++;
    } else if (privateData.length === 0) {
        console.log('✅ SUCCESS: Read returned 0 rows (RLS Hidden).');
        passed++;
    } else {
        console.error('❌ SECURITY FAILURE: We could read private messages!', privateData);
        failed++;
    }

    console.log('\n----------------------------------------');
    console.log(`Summary: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

runSecurityTests();
