import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { config } from '../config';

export const useAuth = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (config.enableMockAuth) {
            // Mock User for Dev Mode
            console.log('[useAuth] Dev Mode: Using Mock User');
            setUser({
                id: 'mock-user-123',
                email: 'dev@hackmist.tech',
                user_metadata: {
                    full_name: 'Dev Operator'
                },
                aud: 'authenticated',
                role: 'authenticated'
            });
            setLoading(false);
            return;
        }

        // Real Auth Logic
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('[useAuth] Error checking session:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        if (config.enableMockAuth) {
            console.log('[useAuth] Mock Sign Out');
            window.location.reload(); // Simple reload to reset state if needed
            return;
        }
        await supabase.auth.signOut();
    };

    return { user, loading, signOut };
};
