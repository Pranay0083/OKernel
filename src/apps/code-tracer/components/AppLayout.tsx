import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, History, Settings, Plus, Play, X, Lock, Unlock, Type, Zap, FileCode } from 'lucide-react';
import { Persistence, UserSession, EditorConfig } from '../../../services/persistence';
import { supabase } from '../../../lib/supabase';

export const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [session, setSession] = useState<UserSession | null>(() => Persistence.getSession());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [realUser, setRealUser] = useState<{ email?: string, id?: string } | null>(null);

    useEffect(() => {
        // Listen for storage events to update UI across tabs (or if updated elsewhere)
        const handleStorage = () => setSession(Persistence.getSession());
        window.addEventListener('storage', handleStorage);
        // Custom event for internal updates
        window.addEventListener('okernel-session-update', handleStorage);

        // Fetch Real User
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setRealUser({ email: user.email, id: user.id });
                // Update session object with real ID if different (optional, just for display consistency)
                setSession(prev => prev ? { ...prev, userId: user.id, email: user.email } : null);
            }
        });

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('okernel-session-update', handleStorage);
        };
    }, []);

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + ':');

    const toggleSetting = (key: keyof EditorConfig) => {
        if (!session) return;
        Persistence.updateEditorConfig({ [key]: !session.editorConfig[key] });
    };

    const userDisplay = realUser ? realUser.email : session?.userId;
    const userInitials = userDisplay ? userDisplay.substring(0, 2).toUpperCase() : 'GU';

    return (
        <div className="h-screen w-screen bg-[#050505] text-zinc-300 flex overflow-hidden font-sans selection:bg-purple-500/30 relative">
            {/* Settings Modal Overlay */}
            {isSettingsOpen && session && (
                <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <Settings size={16} />
                                EDITOR SETTINGS
                            </h2>
                            <button 
                                onClick={() => setIsSettingsOpen(false)}
                                className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-2">
                            <div className="space-y-1">
                                <SettingItem 
                                    label="Autocomplete (IntelliSense)" 
                                    desc="Show suggestions while typing"
                                    icon={<Zap size={16} className="text-yellow-400" />}
                                    active={session.editorConfig.autoComplete}
                                    onClick={() => toggleSetting('autoComplete')}
                                />
                                <SettingItem 
                                    label="Read-Only Mode" 
                                    desc="Lock editor to prevent changes"
                                    icon={session.editorConfig.readOnly ? <Lock size={16} className="text-red-400" /> : <Unlock size={16} className="text-green-400" />}
                                    active={session.editorConfig.readOnly}
                                    onClick={() => toggleSetting('readOnly')}
                                />
                                <SettingItem 
                                    label="Minimap" 
                                    desc="Show code overview on the right"
                                    icon={<FileCode size={16} className="text-blue-400" />}
                                    active={session.editorConfig.minimap}
                                    onClick={() => toggleSetting('minimap')}
                                />
                                <SettingItem 
                                    label="Word Wrap" 
                                    desc="Wrap long lines automatically"
                                    icon={<Type size={16} className="text-purple-400" />}
                                    active={session.editorConfig.wordWrap}
                                    onClick={() => toggleSetting('wordWrap')}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-zinc-950/50 border-t border-white/5 text-xs text-zinc-500 text-center">
                             Settings are automatically saved to your session.
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Toggle Button (Visible when closed) */}
            {!isSidebarOpen && (
                <div className="absolute top-3 left-3 z-50">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors shadow-lg"
                        title="Open Sidebar"
                    >
                        <Layout size={16} />
                    </button>
                </div>
            )}

            {/* Sidebar Shell */}
            <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} flex flex-col border-r border-white/5 bg-[#0a0a0a] transition-all duration-300 overflow-hidden relative`}>
                
                {/* Close Sidebar Button (Inside) */}
                <button
                     onClick={() => setIsSidebarOpen(false)}
                     className="absolute top-3 right-3 p-1 rounded hover:bg-white/5 text-zinc-600 hover:text-zinc-400 z-50"
                     title="Collapse Sidebar"
                >
                    <Layout size={14} />
                </button>

                {/* OS Header */}
                <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 select-none shrink-0">
                    <div
                        onClick={() => navigate('/dashboard')}
                        className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50 cursor-pointer hover:bg-red-500 hover:shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all"
                        title="Close Window (Exit to Dashboard)"
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
                        active={isActive('/code-tracer/execution') && !location.pathname.includes('compare')}
                        onClick={() => navigate('/code-tracer/execution')}
                    />
                    <NavItem
                        icon={<Layout size={14} />}
                        label="Comparison View"
                        active={isActive('/code-tracer/compare')}
                        badge="v2.0"
                        onClick={() => navigate('/code-tracer/compare')}
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
                                navigate(`/code-tracer/execution?loadJob=${job.id}`);
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
                                            navigate(`/code-tracer/execution?loadJob=${job.id}&autoRun=true`);
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
                        {userInitials}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-bold text-zinc-300 truncate">
                            {realUser ? 'Logged In' : 'Guest Session'}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-mono truncate max-w-[120px]" title={userDisplay}>
                            {userDisplay}
                        </span>
                    </div>
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="ml-auto p-1.5 rounded hover:bg-white/10 text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors"
                    >
                        <Settings size={14} />
                    </button>
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

interface SettingItemProps {
    label: string;
    desc: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
}

const SettingItem = ({ label, desc, icon, active, onClick }: SettingItemProps) => (
    <div 
        onClick={onClick}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors select-none"
    >
        <div className="w-8 h-8 rounded bg-black/50 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-white/10">
            {icon}
        </div>
        <div className="flex-1 flex flex-col">
            <span className="text-xs font-bold text-zinc-300 group-hover:text-white">{label}</span>
            <span className="text-[10px] text-zinc-500">{desc}</span>
        </div>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-green-500/20' : 'bg-zinc-800'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${active ? 'left-4 bg-green-500' : 'left-0.5 bg-zinc-600'}`} />
        </div>
    </div>
);

export default AppLayout;
