
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

const testimonials = [
    {
        message: "Finally, a tool that actually shows what happens during a Context Switch. Saved my OS final.",
        version: "v0.3.0",
        user_agent: "CS Student, MIT",
        name: "Alex Chen",
        email: "alex.chen@mit.edu"
    },
    {
        message: "I use kernelOne to demonstrate scheduling anomalies to my juniors. The visual clarity is unmatched.",
        version: "v0.3.0",
        user_agent: "Senior Systems Engineer",
        name: "Sarah Miller",
        email: "sarah.miller@techcorp.com"
    },
    {
        message: "The 'Hardware' accurate mode is brilliant. It forced me to understand PCB overhead.",
        version: "v0.3.0",
        user_agent: "Embedded Developer",
        name: "Davide Russo",
        email: "davide.russo@embedded.io"
    }
];

async function seed() {
    console.log('🌱 Seeding feedback...');

    const { data, error } = await supabase
        .from('user_feedback')
        .insert(testimonials)
        .select();

    if (error) {
        console.error('❌ Error inserting feedback:', error.message);
        console.error('Details:', error);
    } else {
        console.log('✅ Successfully inserted', data.length, 'testimonials!');
        console.log('Sample ID:', data[0].id);
    }
}

seed();
