
import React from 'react';
import { Link } from 'react-router-dom';

export const WikiIntro = () => {
    return (
        <div className="max-w-4xl space-y-12 animate-fade-in">
            {/* Title Section */}
            <div className="border-b border-zinc-800 pb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-mono rounded-full border border-blue-500/20 mb-4">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    OS THEORY ENCYCLOPEDIA
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-white mb-6">Operating System Fundamentals</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    An interactive guide to the core algorithms that power modern computing. 
                    From the CPU scheduler to the Virtual Memory manager, we break down complex hardware abstractions into visual, executable concepts.
                </p>
            </div>

            {/* Core Concepts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <h3 className="text-lg font-bold text-white mb-2">Process Management</h3>
                    <p className="text-sm text-zinc-400 mb-4">
                        How the OS shares a single CPU among multiple running programs using Time Slicing and Context Switching.
                    </p>
                    <Link to="/algo-wiki/scheduling" className="text-xs font-mono text-green-500 hover:underline flex items-center gap-1">
                        Explore Scheduling →
                    </Link>
                </div>

                <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <h3 className="text-lg font-bold text-white mb-2">Memory Virtualization</h3>
                    <p className="text-sm text-zinc-400 mb-4">
                        The illusion of infinite memory. Paging, Segmentation, and how the kernel prevents programs from crashing each other.
                    </p>
                    <Link to="/algo-wiki/memory" className="text-xs font-mono text-purple-500 hover:underline flex items-center gap-1">
                        Explore Memory →
                    </Link>
                </div>
            </div>

            {/* The Von Neumann Architecture */}
            <div id="architecture" className="space-y-6">
                <h2 className="text-3xl font-bold text-white">The Von Neumann Architecture</h2>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 relative overflow-hidden">
                    
                    <p className="text-zinc-400 leading-relaxed mb-6 relative z-10">
                        Modern computers follow a design proposed by John von Neumann in 1945. The key idea is the <strong>Stored-Program Concept</strong>: instructions and data are both stored in the same memory.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-sm relative z-10">
                        <div className="p-4 bg-zinc-900 border border-zinc-700 rounded text-center">
                            <div className="text-yellow-500 font-bold mb-1">CPU</div>
                            <div className="text-zinc-500 text-xs">Control Unit + ALU</div>
                        </div>
                        <div className="flex items-center justify-center text-zinc-600">
                            <span className="tracking-[0.5em]">↔ BUS ↔</span>
                        </div>
                        <div className="p-4 bg-zinc-900 border border-zinc-700 rounded text-center">
                            <div className="text-blue-500 font-bold mb-1">MEMORY</div>
                            <div className="text-zinc-500 text-xs">RAM (Code + Data)</div>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-black/50 rounded border-l-2 border-yellow-500 text-sm text-zinc-400">
                        <strong>The Fetch-Decode-Execute Cycle:</strong>
                        <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                            <li><strong>Fetch:</strong> Get instruction from RAM address stored in PC (Program Counter).</li>
                            <li><strong>Decode:</strong> Figure out what the instruction does (Add? Jump? Load?).</li>
                            <li><strong>Execute:</strong> Perform the operation.</li>
                        </ol>
                    </div>
                </div>
            </div>

             {/* User Mode vs Kernel Mode */}
             <div id="kernel-mode" className="space-y-6 pt-8">
                <h2 className="text-3xl font-bold text-white">Kernel Mode vs. User Mode</h2>
                <p className="text-zinc-400 leading-relaxed">
                    To prevent a single program from crashing the entire computer, the CPU operates in two distinct modes. This protection is enforced by hardware.
                </p>

                <div className="relative mt-8">
                    {/* Visual Divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-dashed border-l border-zinc-700 border-dashed transform -translate-x-1/2 hidden md:block"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* User Mode */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-white">User Mode (Ring 3)</h3>
                            </div>
                            <ul className="space-y-2 text-zinc-400 text-sm list-disc list-inside">
                                <li>Restricted access to hardware.</li>
                                <li>Cannot manipulate memory directly.</li>
                                <li><strong>Example:</strong> Chrome, Spotify, Python Scripts.</li>
                                <li>If it crashes, only the app dies.</li>
                            </ul>
                        </div>

                        {/* Kernel Mode */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold text-white">Kernel Mode (Ring 0)</h3>
                            </div>
                            <ul className="space-y-2 text-zinc-400 text-sm list-disc list-inside">
                                <li>Unrestricted access to all instructions.</li>
                                <li>Manages Memory, Disk, and Network.</li>
                                <li><strong>Example:</strong> Linux Kernel, Windows NT, OKernel.</li>
                                <li>If it crashes, the whole system halts (BSOD).</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
                    <p className="text-sm text-zinc-300">
                        <strong className="text-white">System Calls (syscalls)</strong> are the bridge. When a user program needs to write to a file or open a socket, it asks the Kernel via a system call. The CPU temporarily switches to Ring 0, performs the action, and switches back to Ring 3.
                    </p>
                </div>
            </div>
        </div>
    );
};
