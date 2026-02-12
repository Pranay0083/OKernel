
import React from 'react';

export const WikiSysCalls = () => {
    return (
        <div className="max-w-4xl space-y-12 animate-fade-in">
            {/* Header */}
            <div className="border-b border-zinc-800 pb-8">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-mono rounded-full border border-amber-500/20 mb-4">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    KERNEL INTERFACE
                </div>
                <h1 className="text-4xl font-bold text-white mb-6">System Calls</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    The System Call is the fundamental interface between an application and the Linux Kernel. 
                    It is the only legal way for user programs to request services from the operating system.
                </p>
            </div>

            {/* User vs Kernel Mode */}
            <section id="modes" className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">The Dual-Mode Operation</h2>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        Modern CPUs operate in at least two modes: <strong>User Mode</strong> (restricted access) and <strong>Kernel Mode</strong> (privileged access). 
                        System calls trigger a transition from User Mode to Kernel Mode via a software interrupt (Trap).
                    </p>

                    {/* Visual Diagram */}
                    <div className="relative p-8 bg-black/40 rounded border border-zinc-800/50 flex flex-col gap-4">
                        
                        {/* User Space */}
                        <div className="flex items-center justify-between p-4 bg-blue-900/10 border border-blue-500/20 rounded">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-blue-400">User Mode</span>
                                <span className="text-xs text-blue-300/60">Application Logic</span>
                            </div>
                            <div className="font-mono text-xs text-zinc-400">printf("Hello");</div>
                        </div>

                        {/* Transition Arrows */}
                        <div className="flex justify-center gap-12 relative h-16">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-zinc-500 mb-1">TRAP (Int 0x80)</span>
                                <span className="text-zinc-600">↓</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-zinc-600">↑</span>
                                <span className="text-[10px] text-zinc-500 mt-1">Return from Syscall</span>
                            </div>
                            
                             <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-700 border-t border-dashed border-zinc-800"></div>
                             <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 px-2 text-[10px] text-zinc-500 font-mono">Protection Boundary</span>
                        </div>

                        {/* Kernel Space */}
                         <div className="flex items-center justify-between p-4 bg-red-900/10 border border-red-500/20 rounded">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-red-400">Kernel Mode</span>
                                <span className="text-xs text-red-300/60">Privileged Execution</span>
                            </div>
                             <div className="font-mono text-xs text-zinc-400">sys_write() → Video Driver</div>
                        </div>

                    </div>
                </div>
            </section>

             {/* Workflow */}
             <section id="workflow" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Anatomy of a Syscall</h2>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <ol className="relative border-l border-zinc-800 space-y-8 ml-3 my-4">
                        <li className="ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-zinc-800 rounded-full -left-3 ring-4 ring-zinc-900">
                                <div className="w-2 h-2 rounded-full bg-zinc-500" />
                            </span>
                            <h3 className="flex items-center mb-1 text-lg font-semibold text-white">1. The Request</h3>
                            <p className="text-sm text-zinc-400">Program calls a wrapper function like <code className="text-purple-400">open()</code> in the standard C library (glibc).</p>
                        </li>
                        <li className="ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-zinc-800 rounded-full -left-3 ring-4 ring-zinc-900">
                                <div className="w-2 h-2 rounded-full bg-zinc-500" />
                            </span>
                            <h3 className="mb-1 text-lg font-semibold text-white">2. The Registers</h3>
                            <p className="text-sm text-zinc-400">The library puts the System Call Number (ID) into a CPU register (e.g., EAX) and arguments into others.</p>
                        </li>
                        <li className="ml-6">
                             <span className="absolute flex items-center justify-center w-6 h-6 bg-amber-900/50 rounded-full -left-3 ring-4 ring-zinc-900">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                            </span>
                            <h3 className="mb-1 text-lg font-semibold text-white">3. The Trap</h3>
                            <p className="text-sm text-zinc-400">The CPU switches to Kernel Mode. The <strong>Syscall Handler</strong> reads the ID from the register and executes the corresponding kernel function.</p>
                        </li>
                    </ol>
                </div>
            </section>

            {/* Types */}
            <section id="types" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Common System Calls</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-zinc-800/20 border border-zinc-800">
                        <div className="text-sm font-bold text-white mb-2">Process Control</div>
                        <ul className="space-y-1 font-mono text-xs text-zinc-400">
                            <li><span className="text-purple-400">fork()</span> - Create new process</li>
                            <li><span className="text-purple-400">exit()</span> - Terminate process</li>
                            <li><span className="text-purple-400">wait()</span> - Wait for child to stop</li>
                        </ul>
                    </div>
                     <div className="p-4 rounded-lg bg-zinc-800/20 border border-zinc-800">
                        <div className="text-sm font-bold text-white mb-2">File Management</div>
                        <ul className="space-y-1 font-mono text-xs text-zinc-400">
                            <li><span className="text-purple-400">open()</span> - Open/Create file</li>
                            <li><span className="text-purple-400">read()</span> - Read data into buffer</li>
                            <li><span className="text-purple-400">write()</span> - Write data from buffer</li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
};
