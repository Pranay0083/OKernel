import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, History, Settings, Plus, Play } from 'lucide-react';
import { Persistence, UserSession } from '../../../services/persistence';

export const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [session, setSession] = useState<UserSession | null>(() => Persistence.getSession());

    useEffect(() => {
        // Listen for storage events to update UI across tabs (or if updated elsewhere)
        const handleStorage = () => setSession(Persistence.getSession());
        window.addEventListener('storage', handleStorage);
        // Custom event for internal updates
        window.addEventListener('okernel-session-update', handleStorage);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('okernel-session-update', handleStorage);
        };
    }, []);

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + ':');

    return (
        <div className="h-screen w-screen bg-[#050505] text-zinc-300 flex overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Sidebar Shell */}
            <div className="w-64 flex flex-col border-r border-white/5 bg-[#0a0a0a]">
                {/* OS Header */}
                <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 select-none">
                    <div
                        onClick={() => navigate(-1)}
                        className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50 cursor-pointer hover:bg-red-500 hover:shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all"
                        title="Close Window"
                    ></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    <span className="ml-2 font-mono text-xs font-bold text-zinc-500 tracking-widest">OKERNEL OS</span>
                </div>

                {/* Primary Nav */}
                <div className="p-2 gap-1 flex flex-col border-b border-white/5">
                    <NavItem
                        icon={<Plus size={14} />}
                        label="New Experiment"
                        active={isActive('/platform/execution') && !location.pathname.includes('compare')}
                        onClick={() => navigate('/platform/execution')}
                    />
                    <NavItem
                        icon={<Layout size={14} />}
                        label="Comparison View"
                        active={isActive('/platform/compare')}
                        badge="v2.0"
                        onClick={() => navigate('/platform/compare')}
                    />
                </div>

                {/* Recent Jobs History */}
                <div className="flex-1 overflow-y-auto flex flex-col p-2">
                    <div className="px-2 py-1 text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-1 flex items-center gap-2">
                        <History size={10} />
                        <span>Recent Activity</span>
                    </div>

                    {session?.recentJobs.length === 0 && (
                        <div className="p-4 text-center text-xs text-zinc-600 italic">
                            No experiments yet.
                        </div>
                    )}

                    {session?.recentJobs.map((job) => (
                        <div
                            key={job.id}
                            className="group flex flex-col gap-1 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5"
                            onClick={() => {
                                navigate(`/platform/execution?loadJob=${job.id}`);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-mono px-1 rounded ${job.language === 'python' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                    {job.language}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] ${job.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                        {job.status === 'success' ? 'PASS' : 'FAIL'}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/platform/execution?loadJob=${job.id}&autoRun=true`);
                                        }}
                                        className="p-1 rounded bg-white/5 hover:bg-green-500/20 hover:text-green-400 transition-colors"
                                        title="Replay"
                                    >
                                        <Play size={10} fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono truncate">
                                {new Date(job.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* User Footer */}
                <div className="h-12 border-t border-white/5 flex items-center px-4 gap-3 bg-zinc-900/10">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-purple-900/20">
                        {session?.userId.substr(5, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-bold text-zinc-300">User Session</span>
                        <span className="text-[9px] text-zinc-600 font-mono">{session?.userId}</span>
                    </div>
                    <Settings size={14} className="ml-auto text-zinc-600 hover:text-zinc-400 cursor-pointer" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
                <Outlet context={{ session }} />
            </div>
        </div>
    );
};

interface NavItemProps {
    icon: React.ReactElement;
    label: string;
    active: boolean;
    onClick: () => void;
    badge?: string;
}

const NavItem = ({ icon, label, active, onClick, badge }: NavItemProps) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all group ${active
            ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/5'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
    >
        {React.cloneElement(icon, { size: 16, className: active ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-400' } as React.Attributes)}
        <span className="text-xs font-medium">{label}</span>
        {badge && (
            <span className="ml-auto text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-mono">
                {badge}
            </span>
        )}
    </button>
);

export default AppLayout;
