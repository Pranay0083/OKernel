// Central configuration file for environment variables and global settings
export const config = {
    // Environment
    mode: import.meta.env.VITE_MODE || 'prod',
    
    // API & External Services
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,

    // Feature Flags
    isDev: (import.meta.env.VITE_MODE || 'prod') === 'dev',
    enableMockAuth: (import.meta.env.VITE_MODE || 'prod') === 'dev', // Auto-enable mock auth in dev
};
