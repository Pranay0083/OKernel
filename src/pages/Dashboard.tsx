import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { config } from '../config';

interface Snippet {
    id: number | string;
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
            let fetchedSnippets: Snippet[] = [];
            
            // 1. Try fetching real data
            if (!config.enableMockAuth) {
                try {
                    const { data, error } = await supabase
                        .from('snippets')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(5);

                    if (!error && data) {
                        fetchedSnippets = data.map(s => ({
                            ...s,
                            date: new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        }));
                    }
                } catch (err) {
                    console.error("Error fetching snippets:", err);
                }
            }

            // 2. Fallback to mock data if empty (so UI isn't empty)
            if (fetchedSnippets.length === 0) {
                 fetchedSnippets = [
                    { id: 1, name: 'scheduler_test.c', type: 'C', date: 'Example', language: 'c' },
                    { id: 2, name: 'memory_leak.py', type: 'Python', date: 'Example', language: 'python' },
                ];
            }

            setSnippets(fetchedSnippets);
            setLoading(false);
        };

        fetchSnippets();
    }, [user, authLoading, navigate]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center font-sans text-zinc-500">
                Loading...
            </div>
        );
    }

    const username = user?.email?.split('@')[0] || 'User';

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-5xl mx-auto w-full pt-32 px-6 pb-20">
                
                {/* Header */}
                <header className="mb-12 border-b border-zinc-800 pb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-zinc-500">Welcome back, <span className="text-zinc-300">{username}</span>.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                    {/* Left Column: Tools */}
                    <div className="md:col-span-2 space-y-12">
                        
                        {/* Modules Section */}
                        <section>
                            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6">System Tools</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ToolCard 
                                    name="Process Scheduler" 
                                    desc="Simulate FCFS, RR, and SJF algorithms."
                                    path="/scheduler"
                                />
                                <ToolCard 
                                    name="CPU Visualizer" 
                                    desc="Inspect memory maps and opcode execution."
                                    path="/platform/cpu"
                                />
                                <ToolCard 
                                    name="Shell Environment" 
                                    desc="Write and execute kernel-level C code."
                                    path="/shell"
                                />
                                <ToolCard 
                                    name="Benchmarks" 
                                    desc="Compare algorithm performance metrics."
                                    path="/platform/compare"
                                />
                            </div>
                        </section>

                        {/* Recent Files Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Recent Files</h2>
                                <Link to="/shell" className="text-sm text-green-500 hover:text-green-400">
                                    New File
                                </Link>
                            </div>
                            
                            <div className="border border-zinc-800 rounded bg-zinc-900/50">
                                {snippets.length > 0 ? (
                                    <div className="divide-y divide-zinc-800">
                                        {snippets.map((snippet) => (
                                            <div 
                                                key={snippet.id}
                                                onClick={() => navigate(`/shell?id=${snippet.id}`)}
                                                className="flex items-center justify-between p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-zinc-200 font-medium">{snippet.name || 'Untitled'}</span>
                                                    <span className="text-xs text-zinc-500 font-mono mt-0.5">{(snippet.language || 'text').toUpperCase()}</span>
                                                </div>
                                                <span className="text-xs text-zinc-600">{snippet.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-zinc-600">
                                        No recent files found.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar */}
                    <aside className="space-y-8">
                        {/* Quick Stats (Simplified) */}
                        <section className="bg-zinc-900/30 border border-zinc-800 rounded p-6">
                            <h3 className="text-zinc-200 font-bold mb-4">Session Status</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Connection</span>
                                    <span className="text-green-500">● Stable</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Version</span>
                                    <span className="text-zinc-400">v1.1.0</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-500">Environment</span>
                                    <span className="text-zinc-400">Production</span>
                                </div>
                            </div>
                        </section>

                        {/* Activity Feed */}
                        <section>
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Activity Log</h3>
                            <div className="space-y-4 border-l border-zinc-800 pl-4">
                                <ActivityItem 
                                    text="Session Started" 
                                    time={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                                />
                                {user?.last_sign_in_at && (
                                    <ActivityItem 
                                        text="Last Login" 
                                        time={new Date(user.last_sign_in_at).toLocaleDateString()} 
                                    />
                                )}
                                {user?.created_at && (
                                    <ActivityItem 
                                        text="Account Created" 
                                        time={new Date(user.created_at).toLocaleDateString()} 
                                    />
                                )}
                                <Link to="/changelog" className="block text-xs text-zinc-500 hover:text-zinc-300 pt-2">
                                    View system changelog &rarr;
                                </Link>
                            </div>
                        </section>
                    </aside>

                </div>
            </div>
            <Footer />
        </div>
    );
};

const ToolCard = ({ name, desc, path }: { name: string, desc: string, path: string }) => (
    <Link to={path} className="block p-5 border border-zinc-800 rounded bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all">
        <h3 className="text-zinc-200 font-bold mb-1">{name}</h3>
        <p className="text-sm text-zinc-500">{desc}</p>
    </Link>
);

const ActivityItem = ({ text, time }: { text: string, time: string }) => (
    <div>
        <p className="text-zinc-400 text-sm">{text}</p>
        <p className="text-xs text-zinc-600 mt-0.5">{time}</p>
    </div>
);
