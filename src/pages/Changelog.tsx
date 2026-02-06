
import React from 'react';
import { Layout } from '../components/layout/Layout';
import { GitCommit, Tag, Calendar, ArrowRight, Cpu } from 'lucide-react';
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

                    {/* v1.0.1 (Current) */}
                    <div className="relative pl-8 border-l border-zinc-800">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-white">v1.0.1</h2>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-xs font-mono border border-blue-500/20">PATCH</span>
                        </div>
                        <div className="text-sm text-zinc-500 font-mono mb-6 flex items-center gap-2">
                            <Calendar size={12} /> {new Date().toLocaleDateString()}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <GitCommit size={16} className="text-blue-500" />
                                    Test Suite & Quality Assurance
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Major testing infrastructure update. Comprehensive unit tests for the syscore module
                                    enabling safer development and easier contributions.
                                </p>
                            </div>

                            <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800">
                                <h4 className="text-white text-sm font-bold mb-3">New Test Coverage</h4>
                                <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                    <li className="flex items-start gap-2">
                                        <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                        <span><strong>CPU Algorithms</strong>: Unit tests for FCFS, SJF, SRTF, Priority, and Round Robin.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                        <span><strong>VM Memory</strong>: Tests for 8/32-bit operations, string handling, and malloc.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                        <span><strong>FileSystem</strong>: VFS list/create operations coverage.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span><strong>140 tests</strong> across 16 test files (up from ~70).</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* v1.0.0 */}
                    <div className="relative pl-8 border-l border-zinc-800 opacity-75">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-zinc-700"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-zinc-400">v1.0.0</h2>
                            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-xs font-mono border border-green-500/20">MAJOR</span>
                        </div>
                        <div className="text-sm text-zinc-500 font-mono mb-6 flex items-center gap-2">
                            <Calendar size={12} /> February 2026
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <Cpu size={16} className="text-purple-500" />
                                    The Simulation Update (SysCore Engine 2)
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    OKernel v1.0.0 introduces a fundamental shift in how we visualize Operating Systems.
                                    We have moved from "Static UI" to "Live Emulation".
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800">
                                    <h4 className="text-white text-sm font-bold mb-3">SysCore Engine 2</h4>
                                    <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Virtual Machine</strong>: Users can now write recursive C code, allocate memory, and crash the kernel safely.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Physical RAM Inspector</strong>: A live 1MB Heatmap of the system memory. See your variables physically!</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Shell Maker v0.0.0</strong>: Build your own shell with <code>int main()</code> access.</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800">
                                    <h4 className="text-white text-sm font-bold mb-3">Core Improvements</h4>
                                    <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            <span><strong>Transpiler v2</strong>: Support for <code>sprintf</code>, <code>void functions</code>, and pointer arithmetic.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            <span><strong>Reliability</strong>: Fixed Regex collisions causing Kernel Panics in formatted IO.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* v0.4.2 */}
                    <div className="relative pl-8 border-l border-zinc-800 opacity-75">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-zinc-700"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-zinc-400">v1.0.0</h2>
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
        </Layout >
    );
};
