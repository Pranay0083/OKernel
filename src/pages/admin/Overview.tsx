
import React, { useEffect, useState } from 'react';
import { Activity, Server, Database, Clock } from 'lucide-react';

export const Overview = () => {
    const [logs, setLogs] = useState<string[]>([]);

    // Simulate live logs
    useEffect(() => {
        const interval = setInterval(() => {
            const actions = ['heap_alloc', 'gc_collect', 'packet_in', 'db_sync', 'render_frame'];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const log = `[${new Date().toISOString()}] KERNEL::${action} -> OK`;
            setLogs(prev => [log, ...prev].slice(0, 10));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white mb-6">SYSTEM_OVERVIEW</h1>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded hover:border-green-500/50 transition-colors">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                        <Activity size={16} />
                        <span className="text-xs font-mono">CPU_LOAD</span>
                    </div>
                    <div className="text-2xl font-mono text-green-400">12%</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded hover:border-blue-500/50 transition-colors">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                        <Server size={16} />
                        <span className="text-xs font-mono">MEMORY</span>
                    </div>
                    <div className="text-2xl font-mono text-blue-400">4.2GB</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded hover:border-yellow-500/50 transition-colors">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                        <Database size={16} />
                        <span className="text-xs font-mono">DB_CONN</span>
                    </div>
                    <div className="text-2xl font-mono text-yellow-400">ACTIVE</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded hover:border-purple-500/50 transition-colors">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                        <Clock size={16} />
                        <span className="text-xs font-mono">UPTIME</span>
                    </div>
                    <div className="text-2xl font-mono text-purple-400">2d 4h</div>
                </div>
            </div>

            {/* Live Logs */}
            <div className="bg-black border border-zinc-800 rounded p-4 font-mono text-xs h-64 overflow-hidden relative">
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-zinc-500">LIVE_STREAM</span>
                </div>
                <div className="space-y-1 mt-6">
                    {logs.map((log, i) => (
                        <div key={i} className={`opacity-${Math.max(20, 100 - i * 10)} text-green-500/90`}>
                            {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
