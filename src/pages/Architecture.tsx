
import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Cpu, Database, Layout as LayoutIcon, Code, Terminal, Server, ArrowRight, Zap, Shield, GitBranch } from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';

export const Architecture = () => {
    const { config } = useSystemConfig();

    return (
        <Layout>
            <div className="bg-zinc-950 min-h-screen text-zinc-300 font-sans selection:bg-green-500/30">
                {/* Header Section */}
                <div className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-16 z-20">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex items-center gap-3 text-green-500 font-mono text-sm mb-2">
                            <Terminal size={14} />
                            <span>SYSCORE_ENGINE_BLUEPRINT_{config.version}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                            System <span className="text-zinc-500">Architecture</span>
                        </h1>
                        <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">
                            A breakdown of the OKernel ecosystem. How we simulate hardware interrupts,
                            manage process states, and visualize execution flow in real-time.
                        </p>
                    </div>
                </div>

                {/* Core Diagram Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                            {/* Frontend Layer */}
                            <div className="space-y-6">
                                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-green-500/30 transition-colors group">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                        <LayoutIcon className="text-blue-500" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Presentation Layer</h3>
                                    <p className="text-zinc-500 text-sm mb-4">React 18 + TypeScript + Vite</p>
                                    <ul className="space-y-2 text-sm text-zinc-400 font-mono">
                                        <li className="flex items-center gap-2"><ArrowRight size={12} className="text-blue-500" /> Custom UI Component Library</li>
                                        <li className="flex items-center gap-2"><ArrowRight size={12} className="text-blue-500" /> Tailwind Architecture</li>
                                        <li className="flex items-center gap-2"><ArrowRight size={12} className="text-blue-500" /> Client-Side Routing</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Middle Layer (Engine) */}
                            <div className="space-y-6 lg:mt-12">
                                <div className="p-8 rounded-2xl bg-zinc-900 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                                        <Cpu className="text-green-500" size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">SysCore™ Engine</h3>
                                    <p className="text-zinc-400 mb-6">
                                        The heart of the simulation. A purely functional, cycle-accurate scheduler implementation.
                                    </p>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-black/50 rounded border border-zinc-800 font-mono text-xs text-green-400">
                                            src/syscore/cpu/scheduler.ts
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-mono rounded border border-green-500/20">FCFS</span>
                                            <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-mono rounded border border-green-500/20">SJF</span>
                                            <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-mono rounded border border-green-500/20">RR</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center text-zinc-600">
                                    <GitBranch size={24} className="animate-pulse" />
                                </div>
                            </div>

                            {/* Backend Layer */}
                            <div className="space-y-6">
                                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-yellow-500/30 transition-colors group">
                                    <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-colors">
                                        <Database className="text-yellow-500" size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Data Persistence</h3>
                                    <p className="text-zinc-500 text-sm mb-4">Supabase (PostgreSQL)</p>
                                    <ul className="space-y-2 text-sm text-zinc-400 font-mono">
                                        <li className="flex items-center gap-2"><ArrowRight size={12} className="text-yellow-500" /> Row Level Security (RLS)</li>
                                        <li className="flex items-center gap-2"><ArrowRight size={12} className="text-yellow-500" /> Real-time Subscriptions</li>
                                        <li className="flex items-center gap-2"><ArrowRight size={12} className="text-yellow-500" /> Secured Admin RPCs</li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* detailed Specs */}
                <section className="py-20 bg-zinc-900/30 border-t border-zinc-800">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Code size={24} className="text-purple-500" />
                                    Tech Stack Details
                                </h3>
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-white font-bold mb-2">Frontend Framework</h4>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            Built on <strong className="text-white">React 18</strong> with strictly typed <strong className="text-white">TypeScript</strong> interfaces.
                                            We use <strong className="text-white">Vite</strong> for HMR and bundled production builds.
                                            State management is handled via React Context and Hooks for localized simulation state.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-2">Styling Engine</h4>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            Styled exclusively with <strong className="text-white">Tailwind CSS</strong>.
                                            We implement a "Glassmorphism" + "Terminal" aesthetic using custom utility classes
                                            for backdrops, blurs, and CRT scanline effects.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Shield size={24} className="text-green-500" />
                                    Security & Data
                                </h3>
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="text-white font-bold mb-2">Admin Isolation</h4>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            The <code className="text-green-500 bg-zinc-900 px-1 rounded">/admin</code> routes are completely isolated from the public layout.
                                            They feature their own layout wrapper, rendering engine, and strict auth guards.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-2">SQL Injection Protection</h4>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            Although we expose partial raw SQL capabilities to admins, all queries are sanitized and run through a
                                            secure PostgreSQL RPC function (<code className="text-yellow-500 bg-zinc-900 px-1 rounded">exec_sql</code>) that
                                            explicitly validates admin privileges before execution.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};
