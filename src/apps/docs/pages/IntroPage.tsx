import React from 'react';
import { ArrowRight, Terminal, Cpu, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const IntroPage = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-12 max-w-4xl animate-fade-in">
            {/* Header */}
            <div className="space-y-6 border-b border-zinc-800 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 text-xs font-mono rounded-full border border-green-500/20">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    v2.4.0 Stable
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-white">Introduction to OKernel</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    OKernel is a browser-based operating system simulation platform designed to visualize complex OS concepts like process scheduling, memory management, and concurrency.
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/docs/quickstart')}
                        className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors flex items-center gap-2"
                    >
                        Get Started <ArrowRight size={16} />
                    </button>
                    <button 
                        onClick={() => navigate('/platform/sympathy')}
                        className="px-6 py-3 bg-zinc-800 text-white font-bold rounded hover:bg-zinc-700 transition-colors border border-zinc-700"
                    >
                        Open Visualizer
                    </button>
                </div>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="features">
                <div className="space-y-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                    <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 text-green-500">
                        <Terminal size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Interactive Shell</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        A fully functional terminal environment that supports standard commands, piping, and custom script execution.
                    </p>
                </div>
                
                <div className="space-y-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                    <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 text-blue-500">
                        <Cpu size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Cycle-Accurate</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Every visualization is backed by a deterministic execution engine that tracks state at the opcode level.
                    </p>
                </div>

                <div className="space-y-4 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                    <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 text-purple-500">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Sandboxed</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        User code runs in ephemeral Docker containers (SysCore), ensuring security while allowing low-level access.
                    </p>
                </div>
            </div>

            {/* Code Example */}
            <div className="space-y-4" id="how-it-works">
                <h2 className="text-2xl font-bold text-white">How it works</h2>
                <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="flex items-center px-4 py-3 bg-zinc-900 border-b border-zinc-800 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                        <span className="ml-2 text-xs font-mono text-zinc-500">example_trace.py</span>
                    </div>
                    <div className="p-6 font-mono text-sm text-zinc-300 overflow-x-auto">
                        <span className="text-purple-400">import</span> sys<br/>
                        <span className="text-purple-400">from</span> okernel <span className="text-purple-400">import</span> trace<br/><br/>
                        <span className="text-zinc-500"># The engine intercepts every line execution</span><br/>
                        <span className="text-blue-400">@trace</span><br/>
                        <span className="text-purple-400">def</span> <span className="text-yellow-400">main</span>():<br/>
                        &nbsp;&nbsp;x = [1, 2, 3]<br/>
                        &nbsp;&nbsp;                        <span className="text-zinc-500"># Heap state captured here -&gt; ID: 0x7F...</span><br/>
                        &nbsp;&nbsp;y = x<br/>
                        &nbsp;&nbsp;<span className="text-zinc-500"># Reference count updated</span><br/>
                    </div>
                </div>
            </div>
        </div>
    );
};
