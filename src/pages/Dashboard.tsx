import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { config } from '../config';
import { Terminal, Cpu, Calendar, BookOpen, Settings, Activity, HardDrive, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---
interface Snippet {
    id: number | string;
    name: string;
    type?: string;
    date: string;
    language?: string;
    created_at?: string;
    size?: string; // Mocked size
    permissions?: string; // Mocked permissions
}

interface LogEntry {
    id: number;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

// --- Components ---

interface User {
    email?: string;
    id?: string;
}

const GlobalHUD = ({ user, handleLogout }: { user: User | null, handleLogout: () => void }) => {
    return (
        <div className="w-full h-10 border-b border-green-500/20 bg-zinc-950/90 backdrop-blur-md flex items-center justify-between px-4 font-mono text-xs select-none sticky top-0 z-40">
            <div className="flex items-center space-x-4 text-zinc-500">
                <span className="text-zinc-300">root@okernel:~</span>
                <span className="hidden sm:inline">/</span>
                <span className="hidden sm:inline">dashboard</span>
            </div>
            
            <div className="flex items-center space-x-6">
                <div className="hidden md:flex items-center space-x-2 text-green-500/80">
                    <Activity size={12} className="animate-pulse" />
                    <span>SYS_integrity: 100%</span>
                </div>
                <div className="text-zinc-500">
                    UPTIME: <span className="text-zinc-300">00:42:12</span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-zinc-300 hidden sm:inline">{user?.email?.split('@')[0] || 'dev'}</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="hover:text-red-400 text-zinc-500 transition-colors uppercase"
                >
                    [exit]
                </button>
            </div>
        </div>
    );
};

const ShellPromptHero = () => {
    return (
        <div className="relative group overflow-hidden rounded-sm border border-white/10 bg-black p-8 h-full min-h-[240px] flex flex-col justify-between">
            <div className="font-mono text-zinc-400 space-y-2 text-sm z-10">
                <p>&gt; initializing_kernel_bridge...</p>
                <p>&gt; loading_modules... <span className="text-green-500">OK</span></p>
                <p>&gt; mounting_filesystem... <span className="text-green-500">OK</span></p>
                <p className="animate-pulse">_</p>
            </div>
            
            <div className="z-10 mt-8">
                <Link 
                    to="/shell-maker" 
                    className="inline-flex items-center space-x-2 bg-zinc-100 text-black px-6 py-3 font-mono font-bold hover:bg-green-400 transition-colors duration-300"
                >
                    <Terminal size={18} />
                    <span>LAUNCH_SHELL_MAKER</span>
                </Link>
                <p className="text-zinc-600 text-xs mt-3 font-mono">Write your OS in C. Compile in-browser.</p>
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_2px,transparent_2px),linear-gradient(90deg,rgba(18,18,18,0)_2px,transparent_2px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
        </div>
    );
};

const FileSystemTable = ({ snippets, navigate }: { snippets: Snippet[], navigate: (path: string) => void }) => {
    return (
        <div className="rounded-sm border border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-900/60">
                <div className="flex items-center space-x-2 text-zinc-400">
                    <HardDrive size={14} />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">/var/www/recent_files</span>
                </div>
                <div className="text-xs text-zinc-600 font-mono">[-X]</div>
            </div>
            
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-xs font-mono text-zinc-400">
                    <thead className="bg-zinc-950/50 text-zinc-500 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 font-normal">PERMS</th>
                            <th className="px-4 py-2 font-normal">USER</th>
                            <th className="px-4 py-2 font-normal">SIZE</th>
                            <th className="px-4 py-2 font-normal">NAME</th>
                            <th className="px-4 py-2 font-normal text-right">MODIFIED</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {snippets.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-zinc-600 italic">
                                    No files found in directory.
                                </td>
                            </tr>
                        ) : (
                            snippets.map((snippet) => (
                                <tr 
                                    key={snippet.id} 
                                    onClick={() => navigate(`/shell-maker?id=${snippet.id}`)}
                                    className="hover:bg-green-500/10 hover:text-green-400 cursor-pointer transition-colors group"
                                >
                                    <td className="px-4 py-3 opacity-60 group-hover:opacity-100">{snippet.permissions || '-rw-r--r--'}</td>
                                    <td className="px-4 py-3 opacity-60 group-hover:opacity-100">root</td>
                                    <td className="px-4 py-3 opacity-60 group-hover:opacity-100">{snippet.size || '4kb'}</td>
                                    <td className="px-4 py-3 font-bold text-zinc-300 group-hover:text-green-400 flex items-center gap-2">
                                        {snippet.name || 'untitled'}
                                    </td>
                                    <td className="px-4 py-3 text-right opacity-60 group-hover:opacity-100">{snippet.date}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TelemetryPanel = () => {
    // Mock bars
    return (
        <div className="rounded-sm border border-white/5 bg-zinc-900/40 backdrop-blur-md p-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider">CPU_LOAD</span>
                <Cpu size={14} />
            </div>
            
            <div className="space-y-3 font-mono text-xs text-zinc-400">
                <div className="flex items-center gap-3">
                    <span className="w-8">CORE0</span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-sm overflow-hidden">
                        <div className="h-full bg-green-500/80 w-[45%] animate-pulse"></div>
                    </div>
                    <span>45%</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-8">CORE1</span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-sm overflow-hidden">
                        <div className="h-full bg-green-500/60 w-[32%]"></div>
                    </div>
                    <span>32%</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-8">CORE2</span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-sm overflow-hidden">
                        <div className="h-full bg-green-500/40 w-[12%]"></div>
                    </div>
                    <span>12%</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-8">MEM</span>
                    <div className="flex-1 h-2 bg-zinc-800 rounded-sm overflow-hidden">
                        <div className="h-full bg-blue-500/50 w-[60%]"></div>
                    </div>
                    <span>60%</span>
                </div>
            </div>
        </div>
    );
};

const ToolBelt = () => {
    const modules = [
        { name: 'CPU_SCHEDULER', icon: Calendar, path: '/cpu-scheduler', color: 'text-purple-400' },
        { name: 'CODE_TRACER', icon: Zap, path: '/code-tracer/cpu', color: 'text-yellow-400' },
        { name: 'DOCS', icon: BookOpen, path: '/docs', color: 'text-blue-400' },
        { name: 'SETTINGS', icon: Settings, path: '/settings', color: 'text-zinc-400' },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {modules.map((mod) => (
                <Link 
                    key={mod.name} 
                    to={mod.path}
                    className="aspect-square flex flex-col items-center justify-center space-y-2 rounded-sm border border-white/5 bg-zinc-900/40 hover:bg-zinc-800 hover:border-white/10 transition-all group relative overflow-hidden"
                >
                    <mod.icon size={24} className={`${mod.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 group-hover:text-zinc-300">
                        {mod.name}
                    </span>
                    {/* Corner accents */}
                    <div className="absolute top-1 right-1 w-1 h-1 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/10 rounded-full"></div>
                </Link>
            ))}
        </div>
    );
};

const SessionLog = () => {
    const [logs, setLogs] = useState<LogEntry[]>([
        { id: 1, timestamp: '10:42:01', message: 'Session initialized', type: 'info' },
        { id: 2, timestamp: '10:42:05', message: 'User authenticated', type: 'success' },
        { id: 3, timestamp: '10:42:06', message: 'Mounting virtual volumes...', type: 'warning' },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const actions = [
                'Heartbeat received', 'Syncing filesystem...', 'Memory garbage collection', 'Checking integrity'
            ];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            const newLog = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'}),
                message: randomAction,
                type: 'info' as const
            };
            setLogs(prev => [...prev.slice(-4), newLog]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-sm border border-white/5 bg-black p-4 font-mono text-xs h-40 overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-500 border-b border-l border-zinc-800">
                tail -f session.log
            </div>
            <div className="space-y-1 mt-4">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-2 text-zinc-500">
                        <span className="opacity-50">[{log.timestamp}]</span>
                        <span className={log.type === 'success' ? 'text-green-500' : log.type === 'warning' ? 'text-yellow-500' : 'text-zinc-400'}>
                            {log.type === 'success' ? '&gt;' : log.type === 'warning' ? '!' : '-'} {log.message}
                        </span>
                    </div>
                ))}
                <div className="animate-pulse text-green-500">_</div>
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---

export const Dashboard = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate('/auth');
            return;
        }

        const fetchSnippets = async () => {
            let fetchedSnippets: Snippet[] = [];
            
            // 1. Try fetching real data
            if (!config.enableMockAuth) {
                try {
                    const { data, error } = await supabase
                        .from('snippets')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(8);

                    if (!error && data) {
                        fetchedSnippets = data.map(s => ({
                            ...s,
                            date: new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                            // Mock extra data for the table look
                            size: Math.floor(Math.random() * 10) + 'kb',
                            permissions: '-rw-r--r--'
                        }));
                    }
                } catch (err) {
                    console.error("Error fetching snippets:", err);
                }
            }

            // 2. Fallback to mock data if empty
            if (fetchedSnippets.length === 0) {
                 fetchedSnippets = [
                    { id: 1, name: 'scheduler.c', type: 'C', date: 'Today', language: 'c', size: '4kb', permissions: '-rw-r--r--' },
                    { id: 2, name: 'memory_leak.py', type: 'Python', date: 'Yesterday', language: 'python', size: '2kb', permissions: '-rw-rw-r--' },
                    { id: 3, name: 'kernel_panic.log', type: 'Log', date: 'Mon', language: 'text', size: '12kb', permissions: '-r--r--r--' },
                    { id: 4, name: 'boot_seq.asm', type: 'ASM', date: 'Oct 24', language: 'assembly', size: '1kb', permissions: '-rwx------' },
                ];
            }

            setSnippets(fetchedSnippets);
            setLoading(false);
        };

        fetchSnippets();
    }, [user, authLoading, navigate]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-mono text-zinc-500">
                &gt; loading_system...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-green-500/30 selection:text-green-200">
            <Navbar />
            
            {/* Main Content Area - Styled to look like a separate OS window or container */}
            <main className="max-w-7xl mx-auto w-full pt-20 px-4 pb-20 animate-in">
                
                {/* The Dashboard "Window" */}
                <div className="border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden relative min-h-[800px] flex flex-col">
                    
                    {/* 1. Global HUD */}
                    <GlobalHUD user={user} handleLogout={signOut} />

                    {/* 2. Content Grid */}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                        
                        {/* Left Zone (Interactive) */}
                        <div className="lg:col-span-2 flex flex-col space-y-6">
                            {/* Hero */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex-none h-[280px]"
                            >
                                <ShellPromptHero />
                            </motion.div>

                            {/* Files */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="flex-1 min-h-[300px]"
                            >
                                <FileSystemTable snippets={snippets} navigate={navigate} />
                            </motion.div>
                        </div>

                        {/* Right Zone (Telemetry) */}
                        <div className="flex flex-col space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <TelemetryPanel />
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                            >
                                <ToolBelt />
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.4 }}
                                className="flex-1"
                            >
                                <SessionLog />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
