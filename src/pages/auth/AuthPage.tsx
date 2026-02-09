
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, Lock, Cpu } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AuthPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'idle' | 'checking' | 'authenticated'>('checking');
    const [logs, setLogs] = useState<string[]>(['> initializing_auth_protocol...', '> connecting_secure_uplink...']);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setStatus('authenticated');
                setLogs(prev => [...prev, '> session_detected: ACCESS_GRANTED', '> redirecting_dashboard...']);
                setTimeout(() => navigate('/root/dashboard'), 800);
            } else {
                setStatus('idle');
                setLogs(prev => [...prev, '> session_not_found', '> waiting_for_credentials...']);
            }
        };
        checkSession();
    }, [navigate]);

    const handleGoogleLogin = async () => {
        setLogs(prev => [...prev, '> initiating_oauth_handshake...']);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/root/dashboard`
            }
        });
        if (error) {
            setLogs(prev => [...prev, `> ERROR: ${error.message}`]);
        }
    };

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background Noise/Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 via-blue-500/50 to-purple-500/50"></div>

            <div className="w-full max-w-md border border-zinc-800 bg-zinc-950/90 backdrop-blur-xl rounded-xl overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.1)] relative z-10">

                {/* Header */}
                <div className="bg-zinc-900/50 px-4 py-3 flex items-center gap-2 border-b border-zinc-800">
                    <div className="flex gap-1.5">
                        <div 
                            onClick={() => navigate('/')}
                            className="w-3 h-3 rounded-full bg-red-500/50 cursor-pointer hover:bg-red-500 hover:shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all" 
                            title="Go Home"
                        />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-zinc-500 text-xs">
                        <Lock size={12} />
                        SECURE_GATEWAY
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-green-500/5 rounded-full flex items-center justify-center mx-auto border border-green-500/20 relative">
                            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-green-500"></div>
                            <Cpu size={40} className="text-green-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">System Access</h1>
                            <p className="text-zinc-500 text-sm">Sympathy.dev // Development Environment</p>
                        </div>
                    </div>

                    {/* Terminal Logs */}
                    <div className="bg-black/80 rounded border border-zinc-800/50 p-4 h-32 overflow-y-auto text-xs text-zinc-400 font-mono space-y-1 custom-scrollbar">
                        {logs.map((log, i) => (
                            <div key={i} className={log.includes('GRANTED') ? 'text-green-500' : log.includes('ERROR') ? 'text-red-500' : ''}>
                                {log}
                            </div>
                        ))}
                        <div className="animate-pulse text-green-500">_</div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <Button
                            onClick={handleGoogleLogin}
                            className="w-full bg-white hover:bg-zinc-200 text-black font-bold h-12 flex items-center justify-center gap-2 transition-all"
                            disabled={status === 'authenticated'}
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            {status === 'authenticated' ? 'REDIRECTING...' : 'Continue with Google'}
                        </Button>

                        <div className="text-center">
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                                Access Restricted to Authorized Personnel
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
