import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Cpu, FileCode, Play, Terminal, Zap, ExternalLink, GitCommit, Map, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { config } from '../config';

interface Snippet {
    id: number;
    name: string;
    type?: string;
    date: string;
    language?: string;
    created_at?: string;
}

export const Dashboard = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [snippets, setSnippets] = useState<Snippet[]>([]);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate('/auth');
            return;
        }

        const fetchSnippets = async () => {
            // Check for mock mode
            if (config.enableMockAuth) {
                setSnippets([
                    { id: 1, name: 'scheduler_test.c', type: 'C', date: '2 hours ago', language: 'c' },
                    { id: 2, name: 'memory_leak.py', type: 'Python', date: '1 day ago', language: 'python' },
                ]);
                setLoading(false);
                return;
            }

            // Real fetch
            try {
                const { data, error } = await supabase
                    .from('snippets')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) throw error;

                if (data) {
                    setSnippets(data.map(s => ({
                        ...s,
                        date: new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    })));
                }
            } catch (err) {
                console.error("Error fetching snippets:", err);
            }

            setLoading(false);
        };

        fetchSnippets();
    }, [user, authLoading, navigate]);

    if (authLoading || loading) return null; // Or a loading spinner


    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-purple-500/30 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto w-full pt-32 px-6 lg:px-8 pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 text-xs font-mono rounded-full border border-green-500/20 mb-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            System Online
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Operator'}
                            </span>
                        </h1>
                        <p className="text-zinc-500 text-sm font-mono flex items-center gap-2">
                            <User size={14} /> {user.email}
                            <span className="w-1 h-1 bg-zinc-700 rounded-full mx-2" />
                            Last login: Today
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <StatCard label="Executions" value="1,204" icon={<Activity size={16} className="text-blue-400" />} />
                        <StatCard label="Avg Latency" value="42ms" icon={<Zap size={16} className="text-yellow-400" />} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content: Launchpad */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Terminal size={20} className="text-zinc-500" /> Command Center
                        </h2>

                        {/* Quick Launch Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <LaunchCard
                                title="CPU Scheduler"
                                desc="Simulate Process Scheduling Algorithms (FCFS, RR, SJF)"
                                icon={<Cpu size={24} className="text-blue-400" />}
                                path="/scheduler"
                                color="blue"
                            />
                            <LaunchCard
                                title="SysCore Visualizer"
                                desc="Inspect Python/C Opcode Execution & Memory"
                                icon={<Activity size={24} className="text-green-400" />}
                                path="/platform/cpu"
                                color="green"
                            />
                            <LaunchCard
                                title="Benchmark Studio"
                                desc="Compare two algorithm implementations side-by-side"
                                icon={<Zap size={24} className="text-purple-400" />}
                                path="/platform/compare"
                                color="purple"
                            />
                            <LaunchCard
                                title="Shell Maker"
                                desc="Build and test custom C-shell implementations"
                                icon={<Terminal size={24} className="text-orange-400" />}
                                path="/shell"
                                color="orange"
                            />
                        </div>

                        {/* Recent Activity */}
                        <div className="pt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileCode size={20} className="text-zinc-500" /> Recent Snippets
                                </h2>
                                <Link to="/shell">
                                    <button className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-zinc-300 hover:text-white transition-colors flex items-center gap-2">
                                        <Play size={12} /> New Snippet
                                    </button>
                                </Link>
                            </div>

                            <div className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden">
                                {snippets.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {snippets.map((snippet) => (
                                            <div
                                                key={snippet.id}
                                                onClick={() => navigate(`/shell?id=${snippet.id}`)}
                                                className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded bg-zinc-800 ${(snippet.language || snippet.type) === 'python' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                                        <FileCode size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white">{snippet.name || 'Untitled Snippet'}</h3>
                                                        <p className="text-xs text-zinc-500">{(snippet.language || snippet.type || 'Text')} • {snippet.date}</p>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-zinc-500 hover:text-green-400 transition-colors">
                                                    <Play size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-zinc-500 text-sm">
                                        No recent snippets found.
                                        <br />
                                        <Link to="/shell" className="text-blue-400 hover:underline mt-2 inline-block">Create your first snippet</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Status & Feed */}
                    <div className="space-y-6">

                        {/* Feed */}
                        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">System Updates</h3>
                            <div className="space-y-6">
                                <FeedItem
                                    icon={<GitCommit size={14} />}
                                    title="v2.4.0 Released"
                                    date="Yesterday"
                                    desc="Added Support for C++ in Sympathy Engine."
                                />
                                <FeedItem
                                    icon={<Map size={14} />}
                                    title="Roadmap Update"
                                    date="3 days ago"
                                    desc="Started work on Filesystem Visualization."
                                />
                                <FeedItem
                                    icon={<Zap size={14} />}
                                    title="Performance Fix"
                                    date="1 week ago"
                                    desc="Reduced cold-start latency by 40%."
                                />
                            </div>
                            <Link to="/changelog" className="block mt-6 text-center text-xs text-zinc-500 hover:text-white transition-colors border-t border-white/5 pt-4">
                                View Full Changelog
                            </Link>
                        </div>

                        {/* Pro Tip */}
                        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
                            <h3 className="text-purple-400 font-bold text-sm mb-2 flex items-center gap-2">
                                <Zap size={14} /> Pro Tip
                            </h3>
                            <p className="text-zinc-400 text-xs leading-relaxed">
                                Use <code className="text-purple-300 bg-purple-900/30 px-1 rounded">sys.settrace</code> in your Python scripts to manually hook into the kernel debugger from the console.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

interface StatCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
}

const StatCard = ({ label, value, icon }: StatCardProps) => (
    <div className="bg-zinc-900/50 border border-white/5 px-4 py-3 rounded-lg min-w-[140px]">
        <div className="flex items-center gap-2 text-zinc-500 mb-1 text-xs font-mono uppercase">
            {icon} {label}
        </div>
        <div className="text-2xl font-bold text-white font-mono">{value}</div>
    </div>
);

interface LaunchCardProps {
    title: string;
    desc: string;
    icon: React.ReactNode;
    path: string;
    color: string;
}

const LaunchCard = ({ title, desc, icon, path, color }: LaunchCardProps) => {
    const colorClasses: Record<string, string> = {
        blue: "group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
        green: "group-hover:border-green-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
        purple: "group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(147,13,234,0.3)]",
        orange: "group-hover:border-orange-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]",
    };

    return (
        <Link to={path} className={`
            block p-6 bg-zinc-900/40 border border-white/5 rounded-xl transition-all duration-300 group relative overflow-hidden
            ${colorClasses[color] || ''}
        `}>
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                <ExternalLink size={16} className="text-zinc-500" />
            </div>
            <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-950 rounded-lg border border-white/5 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-zinc-200 group-hover:text-white transition-colors">{title}</h3>
                    <p className="text-sm text-zinc-500 mt-1 leading-snug group-hover:text-zinc-400">{desc}</p>
                </div>
            </div>
        </Link>
    );
};

interface FeedItemProps {
    icon: React.ReactNode;
    title: string;
    date: string;
    desc: string;
}

const FeedItem = ({ icon, title, date, desc }: FeedItemProps) => (
    <div className="flex gap-3">
        <div className="mt-1 text-zinc-600">{icon}</div>
        <div>
            <div className="flex items-center justify-between mb-0.5">
                <h4 className="text-sm font-bold text-zinc-300">{title}</h4>
                <span className="text-[10px] text-zinc-600">{date}</span>
            </div>
            <p className="text-xs text-zinc-500 leading-snug">{desc}</p>
        </div>
    </div>
);
