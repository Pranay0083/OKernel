import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronRight, Home } from 'lucide-react'; // Removed unused imports
import { DOCS_NAVIGATION } from './DocsConfig';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const DocsLayout = () => {
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
        for (const section of DOCS_NAVIGATION) {
            for (const item of section.items) {
                if (item.title.toLowerCase().includes(query.toLowerCase()) ||
                    item.description?.toLowerCase().includes(query.toLowerCase())) {
                    results.push(item);
                }
            }
        }
        setSearchResults(results);
    };

    // Naive TOC generator based on current path
    const getTableOfContents = () => {
        const path = location.pathname;

        // Introduction
        if (path === '/docs' || path === '/docs/intro') {
            return [
                { id: 'features', label: 'Core Features' },
                { id: 'how-it-works', label: 'How It Works' }
            ];
        }

        // Quick Start
        if (path.includes('quickstart')) {
            return [
                { id: 'prerequisites', label: 'Prerequisites' },
                { id: 'clone-repo', label: '1. Clone Repo' },
                { id: 'install-deps', label: '2. Install Deps' },
                { id: 'configure-env', label: '3. Env Config' },
                { id: 'run-server', label: '4. Run Server' },
            ];
        }

        // Architecture - Trace Engine
        if (path.includes('architecture/tracing')) {
            return [
                { id: 'challenge', label: 'The Challenge' },
                { id: 'solution', label: 'The Solution' },
                { id: 'pipeline', label: 'Pipeline Stages' },
            ];
        }

        // Architecture - Overview
        if (path.includes('architecture') && !path.includes('sympathy')) {
            return [
                { id: 'data-flow', label: 'Data Flow Pipeline' },
                { id: 'core-components', label: 'Core Components' }
            ];
        }

        // Architecture - Sympathy
        if (path.includes('architecture/sympathy')) {
            return [
                { id: 'concept', label: 'Machine Sympathy' },
                { id: 'alu-table', label: 'ALU Operations' },
                { id: 'comparison', label: 'Comparison Mode' },
            ];
        }

        // Modules - Scheduler
        if (path.includes('modules/scheduler')) {
            return [
                { id: 'overview', label: 'Overview' },
                { id: 'algorithms', label: 'Algorithms' },
                { id: 'metrics', label: 'Key Metrics' },
            ];
        }

        // Modules - Shell Maker
        if (path.includes('modules/shell')) {
            return [
                { id: 'features', label: 'Features' },
                { id: 'building', label: 'Building Shells' },
                { id: 'integration', label: 'SysCore Integration' },
            ];
        }

        // API - Persistence
        if (path.includes('api/persistence')) {
            return [
                { id: 'architecture', label: 'Architecture' },
                { id: 'schema', label: 'Data Schema' },
                { id: 'auth', label: 'Authentication' },
            ];
        }

        // API - SysCore
        if (path.includes('api')) {
            return [
                { id: 'shell-commands', label: 'Shell Commands' },
                { id: 'system-calls', label: 'System Calls' }
            ];
        }

        // Aether Docs
        if (path.includes('aether')) {
            return [
                { id: 'architecture', label: 'Hybrid Architecture' },
                { id: 'rendering', label: 'Metal Pipeline' },
                { id: 'configuration', label: 'Configuration' },
                { id: 'shortcuts', label: 'Keybindings' }
            ];
        }

        return [];
    };

    const toc = getTableOfContents();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-purple-500/30 flex flex-col">
            <Navbar /> {/* Standard Main Navbar */}

            <div className="flex-1 flex pt-24 relative max-w-screen-2xl mx-auto w-full">

                {/* Mobile Sidebar Toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-green-600 text-black rounded-full shadow-lg"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Sidebar Navigation */}
                <aside className={`
                    fixed md:sticky top-24 left-0 h-[calc(100vh-6rem)] w-72 bg-[#050505] border-r border-white/5 
                    transform transition-transform duration-300 z-40 overflow-y-auto custom-scrollbar
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div className="p-6 space-y-8">
                        {/* Search Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search size={14} className="text-zinc-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search docs..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-green-500/50 transition-colors"
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
                            {DOCS_NAVIGATION.map((section) => (
                                <div key={section.title} className="space-y-3">
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-3">
                                        {section.title}
                                    </h3>
                                    <ul className="space-y-0.5">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {section.items.map((item: any) => ( // Added type 'any' to item as per instruction's intent to fix types
                                            <li key={item.path}>
                                                <NavLink
                                                    to={item.path}
                                                    end={item.path === '/docs'} // Only exact match for root
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={({ isActive }) => `
                                                        flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group relative
                                                        ${isActive
                                                            ? 'text-green-400 bg-green-500/5 font-medium'
                                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                                                        }
                                                    `}
                                                >
                                                    <span className={`transition-colors ${location.pathname === item.path ? 'text-green-500' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                                                        {item.icon}
                                                    </span>
                                                    {item.title}
                                                    {location.pathname === item.path && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-green-500 rounded-r-full" />
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
                        <span>Docs</span>
                        <ChevronRight size={12} />
                        <span className="text-green-500">
                            {DOCS_NAVIGATION.flatMap(s => s.items).find(i => i.path === location.pathname)?.title || 'Page'}
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
                                <li className="pl-4 text-zinc-600 italic">No subsections</li>
                            )}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};
