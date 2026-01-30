import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const Changelog = () => {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="space-y-4 text-center">
                        <h1 className="text-4xl font-bold tracking-tight">System Changelog</h1>
                        <p className="text-muted-foreground font-mono">
                            /var/log/syscore/versions.log
                        </p>
                    </div>

                    <div className="space-y-8">

                        {/* v0.3.0 */}
                        <div className="bg-zinc-900/50 border border-border rounded-lg p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-primary/10"></div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded font-mono text-sm font-bold">
                                    v0.3.0
                                </div>
                                <span className="text-zinc-500 text-sm">January 30, 2026</span>
                                <span className="ml-auto px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded border border-green-800">
                                    LATEST
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">SysCore Engine Integration</h3>
                                    <p className="text-sm text-zinc-400">
                                        Major architectural overhaul introducing the <strong>SysCore Engine</strong>.
                                        Separated core kernel logic from UI components for better modularity and extensibility.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">New Features</h4>
                                        <ul className="text-sm space-y-2 text-zinc-300">
                                            <li className="flex gap-2">
                                                <span className="text-primary">•</span>
                                                Modular <code className="text-xs bg-black px-1 rounded">syscore/cpu</code> architecture
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-primary">•</span>
                                                Interactive CLI with sub-module exploration
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-primary">•</span>
                                                Expanded Terminal commands (syscore.ver, syscore.algos)
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-primary">•</span>
                                                Updated Routing System (/dev/*)
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Improvements</h4>
                                        <ul className="text-sm space-y-2 text-zinc-300">
                                            <li className="flex gap-2">
                                                <span className="text-zinc-500">•</span>
                                                Standardized Algorithm interfaces
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-zinc-500">•</span>
                                                Enhanced UI Polish & Transitions
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-zinc-500">•</span>
                                                Fixed process preemption logic
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* v0.2.0 */}
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6 opacity-75 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="px-3 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded font-mono text-sm font-bold">
                                    v0.2.0
                                </div>
                                <span className="text-zinc-500 text-sm">January 20, 2026</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Visualizer Core</h3>
                            <ul className="text-sm space-y-1 text-zinc-400 list-disc list-inside">
                                <li>Implemented core CPU Scheduling Visualizer</li>
                                <li>Added support for FCFS, SJF, and Round Robin</li>
                                <li>Real-time Gantt Chart rendering</li>
                            </ul>
                        </div>

                        {/* v0.1.0 */}
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6 opacity-50 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="px-3 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded font-mono text-sm font-bold">
                                    v0.1.0
                                </div>
                                <span className="text-zinc-500 text-sm">January 10, 2026</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Initial Release</h3>
                            <p className="text-sm text-zinc-400">
                                Project initialization with basic shell and architecture planning.
                            </p>
                        </div>

                    </div>

                    <div className="pt-8 border-t border-zinc-800 text-center">
                        <p className="text-zinc-500 text-sm">
                            Full version history available on <a href="https://github.com/Vaiditya2207/OKernel" target="_blank" rel="noreferrer" className="text-primary hover:underline">GitHub</a>.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
