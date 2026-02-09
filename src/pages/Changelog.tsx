
import React from 'react';
import { Layout } from '../components/layout/Layout';
import { GitCommit, Tag, Calendar, ArrowRight, Cpu, Shield, Zap, Layout as LayoutIcon } from 'lucide-react';
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

                    {/* v1.1.0 (New Latest) */}
                    <div className="relative pl-8 border-l border-zinc-800">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-white">v1.1.0</h2>
                            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 text-xs font-mono border border-purple-500/20">RELEASE</span>
                        </div>
                        <div className="text-sm text-zinc-500 font-mono mb-6 flex items-center gap-2">
                            <Calendar size={12} /> 2026-02-08
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <Shield size={16} className="text-purple-500" />
                                    Hard Technical Upgrade
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    A massive overhaul of the system's core interface and security layers. 
                                    We have shifted to a strict Google Auth-only flow and redesigned the entire landing experience to match our "Hard Technical" aesthetic.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800">
                                    <h4 className="text-white text-sm font-bold mb-3">Core & Security</h4>
                                    <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Google Auth Only</strong>: Streamlined authentication flow for better security.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Cycle-Accurate Tracer</strong>: New Python execution tracer for SysCore.</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800">
                                    <h4 className="text-white text-sm font-bold mb-3">UI & Experience</h4>
                                    <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Landing Overhaul</strong>: Complete redesign of Home and Auth pages.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Product Navbar</strong>: Focused navigation for distinct product areas.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>Documentation</strong>: Expanded Architecture docs with Sandbox details.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* v1.0.1 */}
                    <div className="relative pl-8 border-l border-zinc-800 opacity-75">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-zinc-700"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-zinc-400">v1.0.1</h2>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-xs font-mono border border-blue-500/20">PATCH</span>
                        </div>
                        <div className="text-sm text-zinc-500 font-mono mb-6 flex items-center gap-2">
                            <Calendar size={12} /> 2026-02-05
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
                    <div className="relative pl-8 border-l border-zinc-800 opacity-50">
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
                                            <span><strong>Virtual Machine</strong>: Recursive C code, memory allocation.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ArrowRight size={12} className="text-green-500 mt-0.5" />
                                            <span><strong>RAM Inspector</strong>: Live 1MB Heap Heatmap.</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-zinc-900/50 rounded border border-zinc-800">
                                    <h4 className="text-white text-sm font-bold mb-3">Core Improvements</h4>
                                    <ul className="space-y-2 text-xs text-zinc-400 font-mono">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            <span><strong>Transpiler v2</strong>: <code>sprintf</code>, <code>void</code> support.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500">•</span>
                                            <span><strong>Reliability</strong>: Fixed formatted IO panics.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* v0.4.2 */}
                    <div className="relative pl-8 border-l border-zinc-800 opacity-50">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-zinc-700"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-zinc-400">v0.4.2</h2>
                        </div>
                        <div className="text-sm text-zinc-500 font-mono mb-6 flex items-center gap-2">
                            <Calendar size={12} /> 2026-01-20
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <GitCommit size={16} className="text-purple-500" />
                                    Admin Overhaul
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Complete rewrite of the Admin Console. Introduced a dedicated, immersive terminal environment for system administrators.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* v0.3.0 */}
                    <div className="relative pl-8 border-l border-zinc-800 opacity-25">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-zinc-700"></div>
                        <h2 className="text-xl font-bold text-zinc-400 mb-2">v0.3.0</h2>
                        <div className="text-sm text-zinc-600 font-mono mb-4">January 2026</div>
                        <ul className="list-disc list-inside text-sm text-zinc-500 space-y-1">
                            <li>New Inbox Module with Split View</li>
                            <li>Database Explorer (Read-Only)</li>
                            <li>Initial Admin Layout implementation</li>
                        </ul>
                    </div>

                </div>
            </div>
        </Layout >
    );
};
