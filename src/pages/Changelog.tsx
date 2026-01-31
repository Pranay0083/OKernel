
import React from 'react';
import { Layout } from '../components/layout/Layout';
import { GitCommit, Tag, Calendar, ArrowRight } from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';

export const Changelog = () => {
    const { config } = useSystemConfig();

    return (
        <Layout>
            <div className="container mx-auto px-4 pt-32 pb-24 max-w-3xl">
                <div className="mb-12 border-b border-zinc-800 pb-6">
                    <div className="text-xs font-mono text-zinc-500 mb-2">System Changelog</div>
                    <h1 className="text-4xl font-bold text-white font-mono">/var/log/syscore/versions.log</h1>
                </div>

                <div className="space-y-16">

                    {/* v0.4.2 (Current) */}
                    <div className="relative pl-8 border-l border-zinc-800">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-white">{config.version}</h2>
                            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-xs font-mono border border-green-500/20">LATEST</span>
                        </div>
                        <div className="text-sm text-zinc-500 font-mono mb-6 flex items-center gap-2">
                            <Calendar size={12} /> {new Date().toLocaleDateString()}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <GitCommit size={16} className="text-purple-500" />
                                    Admin Tools & UI Stability
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Major stability improvements for mobile devices and new administrative capabilities for system configuration.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800">
                                    <h4 className="text-white text-sm font-bold mb-3">System Config Manager</h4>
                                    <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Config UI</strong>: Modify App Version, MOTD, and Status directly from Admin Dashboard.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Smart Redirects</strong>: Fixed Admin Login "teleporting" issues using Intent-Based Auth Rescue.</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800">
                                    <h4 className="text-white text-sm font-bold mb-3">Visualizer Stability</h4>
                                    <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            <span><strong>Mobile Layout</strong>: Switched to <code>flex-col</code> stack for reliable mobile rendering.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            <span><strong>Grid Locking</strong>: Preserved complex grid layout for Desktop "Cockpit" mode.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* v0.4.0 */}
                    <div className="relative pl-8 border-l border-zinc-800 opacity-75">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-zinc-700"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-zinc-400">v0.4.0</h2>
                        </div>
                        <div className="text-sm text-zinc-500 font-mono mb-6 flex items-center gap-2">
                            <Calendar size={12} /> {new Date().toLocaleDateString()}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <GitCommit size={16} className="text-purple-500" />
                                    SysCore Root Terminal & Admin Overhaul
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Complete rewrite of the Admin Console. Introduced a dedicated, immersive terminal environment for system administrators.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800">
                                    <h4 className="text-white text-sm font-bold mb-3">New Features</h4>
                                    <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Dynamic Versioning</strong>: Global config sync via Supabase.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Drag-and-Drop Ranking</strong>: Manual ordering for Featured Reviews.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>SQL God Mode</strong>: Secure, specialized console for raw DB queries.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Command UX</strong>: Terminal-style input for confirm/delete actions.</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800">
                                    <h4 className="text-white text-sm font-bold mb-3">System Improvements</h4>
                                    <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            <span>Moved SQL migrations to <code>/sql</code> directory.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            <span>Redesigned Architecture Blueprint page.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            <span>Fixed "missing semicolon" build errors.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* v0.3.0 */}
                    <div className="relative pl-8 border-l border-zinc-800">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-zinc-700"></div>
                        <h2 className="text-xl font-bold text-zinc-400 mb-2">v0.3.0</h2>
                        <div className="text-sm text-zinc-600 font-mono mb-4">January 2026</div>
                        <ul className="list-disc list-inside text-sm text-zinc-500 space-y-1">
                            <li>New Inbox Module with Split View</li>
                            <li>Database Explorer (Read-Only)</li>
                            <li>Initial Admin Layout implementation</li>
                        </ul>
                    </div>

                    {/* v0.2.0 */}
                    <div className="relative pl-8 border-l border-zinc-800 opacity-50">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-zinc-700"></div>
                        <h2 className="text-xl font-bold text-zinc-400 mb-2">v0.2.0</h2>
                        <div className="text-sm text-zinc-600 font-mono mb-4">December 2025</div>
                        <p className="text-sm text-zinc-500">Initial SysCore Visualizer Engine launch.</p>
                    </div>

                </div>
            </div>
        </Layout>
    );
};
