
import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ChevronRight, Home } from 'lucide-react';
import { WIKI_NAVIGATION } from './wiki/AlgoWikiConfig';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const AlgoWiki = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const location = useLocation();
    const navigate = useNavigate();

    // Search Logic
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        const results = [];
        for (const section of WIKI_NAVIGATION) {
            for (const item of section.items) {
                if (item.title.toLowerCase().includes(query.toLowerCase()) ||
                    item.description?.toLowerCase().includes(query.toLowerCase())) {
                    results.push(item);
                }
            }
        }
        setSearchResults(results);
    };

    // Scroll Helper
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Simple TOC for now - can be expanded later
    const getTableOfContents = () => {
        const path = location.pathname;

        if (path.includes('scheduling')) {
            return [
                { id: 'fcfs', label: 'FCFS' },
                { id: 'sjf', label: 'SJF' },
                { id: 'rr', label: 'Round Robin' },
            ];
        }

        if (path.includes('synchronization')) {
            return [
                { id: 'race-conditions', label: 'Race Conditions' },
                { id: 'mutex', label: 'Mutex Locks' },
                { id: 'semaphores', label: 'Semaphores' },
            ];
        }

        if (path.includes('memory')) {
            return [
                { id: 'virtual-memory', label: 'Virtual Memory' },
                { id: 'paging', label: 'Paging' },
                { id: 'tlb', label: 'TLB' },
            ];
        }

        if (path.includes('syscalls')) {
            return [
                { id: 'modes', label: 'Dual-Mode Operation' },
                { id: 'workflow', label: 'Syscall Workflow' },
                { id: 'types', label: 'Common Types' },
            ];
        }

        if (path.includes('threads')) {
            return [
                { id: 'process', label: 'The Process (PCB)' },
                { id: 'threads', label: 'Threads vs Processes' },
                { id: 'models', label: 'Threading Models' },
            ];
        }

        if (path.includes('deadlocks')) {
            return [
                { id: 'conditions', label: 'The 4 Conditions' },
                { id: 'handling', label: 'Prevention & Avoidance' },
            ];
        }

        return [];
    };

    const toc = getTableOfContents();

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-purple-500/30 flex flex-col">
            <Navbar />

            <div className="flex-1 flex pt-24 relative max-w-screen-2xl mx-auto w-full">

                {/* Mobile Sidebar Toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-purple-600 text-white rounded-full shadow-lg"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Sidebar Navigation */}
                <aside className={`
                    fixed md:sticky top-24 left-0 h-[calc(100vh-6rem)] w-72 bg-[#050505]/95 backdrop-blur border-r border-white/5 
                    transform transition-transform duration-300 z-40 overflow-y-auto custom-scrollbar
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div className="p-6 space-y-8">
                        {/* Header */}
                        <div className="px-3">
                            <div className="text-sm font-bold text-white mb-1">AlgoWiki</div>
                            <div className="text-xs text-zinc-500 font-mono">/sys/class/algos</div>
                        </div>

                        {/* Search Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search size={14} className="text-zinc-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search algorithms..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-purple-500/50 transition-colors"
                            />
                            {/* Search Results Dropdown */}
                            {searchQuery.length >= 2 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                                    {searchResults.length > 0 ? (
                                        <ul>
                                            {searchResults.map((result) => (
                                                <li key={result.path}>
                                                    <button
                                                        onClick={() => {
                                                            navigate(result.path);
                                                            setSearchQuery('');
                                                            setSidebarOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
                                                    >
                                                        <div className="text-sm font-bold text-white">{result.title}</div>
                                                        <div className="text-xs text-zinc-500 truncate">{result.description}</div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-xs text-zinc-500 text-center">No results found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Navigation Tree */}
                        <nav className="space-y-8">
                            {WIKI_NAVIGATION.map((section) => (
                                <div key={section.title} className="space-y-3">
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-3">
                                        {section.title}
                                    </h3>
                                    <ul className="space-y-0.5">
                                        {section.items.map((item) => (
                                            <li key={item.path}>
                                                <NavLink
                                                    to={item.path}
                                                    end={item.path === '/algo-wiki'}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={({ isActive }) => `
                                                        flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group relative
                                                        ${isActive
                                                            ? 'text-purple-400 bg-purple-500/5 font-medium'
                                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}
                                                    `}
                                                >
                                                    <span className={`transition-colors ${location.pathname === item.path ? 'text-purple-500' : 'text-zinc-600 group-hover:text-zinc-400'}`}>

                                                    </span>
                                                    {item.title}
                                                    {location.pathname === item.path && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-purple-500 rounded-r-full" />
                                                    )}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 py-10 px-6 md:px-12 lg:px-16 overflow-y-auto">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-8 font-mono">
                        <Home size={12} />
                        <ChevronRight size={12} />
                        <span>Wiki</span>
                        <ChevronRight size={12} />
                        <span className="text-purple-500">
                            {WIKI_NAVIGATION.flatMap(s => s.items).find(i => i.path === location.pathname)?.title || 'Page'}
                        </span>
                    </div>

                    <Outlet />

                    <div className="mt-20 pt-10 border-t border-white/5">
                        <Footer minimal />
                    </div>
                </main>

                {/* Right Sidebar (Table of Contents) */}
                <aside className="hidden xl:block w-64 pt-10 pr-8 pl-4">
                    <div className="sticky top-32">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">On this page</h4>
                        <ul className="space-y-2 text-sm text-zinc-500 border-l border-zinc-800">
                            {toc.length > 0 ? toc.map((item) => (
                                <li key={item.id}
                                    className="pl-4 hover:text-zinc-300 hover:border-zinc-600 cursor-pointer transition-colors"
                                    onClick={() => scrollToSection(item.id)}
                                >
                                    {item.label}
                                </li>
                            )) : (
                                <li className="pl-4 text-zinc-600 italic">Overview</li>
                            )}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};
