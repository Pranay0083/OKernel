
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Terminal, ShieldAlert, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminLogin = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'idle' | 'checking' | 'authenticated' | 'denied'>('checking');
    const [logs, setLogs] = useState<string[]>(['> initializing_security_protocol...']);

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [...prev, `> ${msg}`]);
    }, []);

    const verifyAdminAccess = useCallback(async (email: string | undefined) => {
        if (!email) return;
        addLog(`verifying_identity: ${email}`);

        // Security Check: Query the whitelist for THIS email only
        const { data, error: _error } = await supabase
            .from('admin_whitelist')
            .select('email')
            .eq('email', email)
            .single();

        if (data) {
            addLog('ACCESS_GRANTED. redirecting_dashboard...');
            setStatus('authenticated');
            setTimeout(() => navigate('/admin/dashboard'), 1000);
        } else {
            addLog('ACCESS_DENIED. identity_not_whitelisted.');
            setStatus('denied');
            await supabase.auth.signOut();
        }
    }, [addLog, navigate]);

    // Check if user is already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                verifyAdminAccess(session.user.email);
            } else {
                setStatus('idle');
                addLog('session_not_found. waiting_for_auth...');
            }
        };
        checkSession();
    }, [addLog, verifyAdminAccess]);

    const handleGoogleLogin = async () => {
        addLog('initiating_oauth_handshake...');
        localStorage.setItem('syscore_auth_intent', 'true');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/admin/dashboard`
            }
        });
        if (error) addLog(`ERROR: ${error.message}`);
    };

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center p-4">
            <div className="w-full max-w-lg border border-zinc-800 bg-zinc-950/80 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,255,0,0.05)]">

                {/* Header */}
                <div className="bg-zinc-900/50 px-4 py-3 flex items-center gap-2 border-b border-zinc-800">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-zinc-500 text-xs">
                        <Lock size={12} />
                        SECURE_UPLINK
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                            <ShieldAlert size={32} className="text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Root Access Required</h1>
                        <p className="text-zinc-500 text-sm">SysCore // Kernel Administration</p>
                    </div>

                    {/* Terminal Logs */}
                    <div className="bg-black/50 rounded border border-zinc-800/50 p-4 h-32 overflow-y-auto text-xs text-zinc-400 font-mono space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className={log.includes('DENIED') ? 'text-red-500' : log.includes('GRANTED') ? 'text-green-500' : ''}>
                                {log}
                            </div>
                        ))}
                        {status === 'checking' && (
                            <div className="animate-pulse">_</div>
                        )}
                    </div>

                    {/* Actions */}
                    {status === 'denied' ? (
                        <div className="text-center text-red-500 bg-red-500/10 border border-red-500/20 p-4 rounded">
                            <h3 className="font-bold mb-1">UNAUTHORIZED</h3>
                            <p className="text-xs opacity-70">This incident will be reported.</p>
                            <Button
                                onClick={() => { setStatus('idle'); setLogs(['> system_reset...']); }}
                                className="mt-4 bg-red-500/20 text-red-500 border-red-500 hover:bg-red-500/30 w-full"
                            >
                                Retry Handshake
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={handleGoogleLogin}
                            className="w-full bg-green-600 hover:bg-green-500 text-black font-bold h-12"
                            disabled={status === 'authenticated'}
                        >
                            <Terminal className="mr-2 h-4 w-4" />
                            {status === 'authenticated' ? 'ACCESS GRANTED' : 'Authenticate via Google'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
