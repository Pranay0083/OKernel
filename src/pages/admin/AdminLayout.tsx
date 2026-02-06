import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Terminal, Database, Activity, Mail, LogOut, ChevronRight, Cpu, Star, Settings, Target } from 'lucide-react';

import { useSystemConfig } from '../../hooks/useSystemConfig';

export const AdminLayout = () => {
    const { config } = useSystemConfig();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [_email, setEmail] = useState('');
    const [time, setTime] = useState(new Date());
    const [uptime, setUptime] = useState(0);
    // Use a constant for display memory - stable across renders
    const memUsage = 45;

    useEffect(() => {
        // Clock + Uptime
        const timer = setInterval(() => {
            setTime(new Date());
            setUptime(prev => prev + 1);
        }, 1000);

        // Auth Check
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/admin');
                return;
            }
            // Double check whitelist
            const { data } = await supabase.from('admin_whitelist').select('email').eq('email', session.user.email).single();
            if (!data) {
                await supabase.auth.signOut();
                navigate('/admin');
            } else {
                setEmail(data.email);
                setLoading(false);
            }
        };
        checkAuth();

        return () => clearInterval(timer);
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin');
    };

    if (loading) return <div className="bg-black h-screen w-screen flex items-center justify-center text-green-500 font-mono">_initializing_core...</div>;

    const navItems = [
        { label: 'Overview', path: '/admin/dashboard', icon: Activity },
        { label: 'Inbox Stream', path: '/admin/inbox', icon: Mail },
        { label: 'Featured (Public)', path: '/admin/featured', icon: Star },
        { label: 'System Config', path: '/admin/config', icon: Settings },
        { label: 'Sponsor Goals', path: '/admin/sponsor', icon: Target },
        { label: 'DB Explorer', path: '/admin/database', icon: Database },
        { label: 'SQL Console', path: '/admin/sql', icon: Terminal },
    ];

    return (
        <div className="h-screen w-screen bg-black text-green-500 font-mono overflow-hidden flex flex-col crt-scanline">

            {/* Top Bar */}
            <header className="h-10 border-b border-zinc-800 bg-zinc-950 flex items-center px-4 justify-between select-none">
                <div className="flex items-center gap-4 text-xs">
                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500/50 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                        <span className="font-bold tracking-wider text-sm">SYSCORE_ROOT_TERMINAL {config.version.toUpperCase()} :: ACCESS_LEVEL_1</span>
                    </div>
                </div>
                <div className="text-xs text-zinc-500">
                    UPTIME: {uptime}s | MEM: {memUsage}% | {time.toLocaleTimeString()}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-zinc-800 bg-zinc-950/50 flex flex-col">
                    <div className="p-4 border-b border-zinc-800">
                        <div className="flex items-center gap-2 text-white font-bold tracking-wider">
                            <Cpu size={16} className="text-green-500" />
                            OKERNEL
                        </div>
                        <div className="text-[10px] text-zinc-600 mt-1">ADMINISTRATIVE_ACCESS_LVL_0</div>
                    </div>

                    <nav className="flex-1 p-2 space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs rounded transition-all group relative ${isActive
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                        : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                                        }`}
                                >
                                    <item.icon size={14} />
                                    {item.label}
                                    {isActive && (
                                        <ChevronRight size={12} className="absolute right-2 opacity-100" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="p-2 border-t border-zinc-800">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        >
                            <LogOut size={14} />
                            TERMINATE_SESSION
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto bg-black relative">
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] pointer-events-none bg-[length:100%_2px,3px_100%] pointer-events-none" />

                    <div className="relative z-10 p-6 min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
