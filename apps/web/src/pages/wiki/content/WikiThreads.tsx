
import React from 'react';

export const WikiThreads = () => {
    return (
        <div className="max-w-4xl space-y-12 animate-fade-in">
            {/* Header */}
            <div className="border-b border-zinc-800 pb-8">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-400 text-xs font-mono rounded-full border border-pink-500/20 mb-4">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    EXECUTION UNITS
                </div>
                <h1 className="text-4xl font-bold text-white mb-6">Processes & Threads</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    A Process is a program in execution. A Thread is the basic unit of CPU utilization. 
                    Understanding the distinction and interaction between them is key to modern OS design.
                </p>
            </div>

            {/* Process Structure */}
            <section id="process" className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">The Process Control Block (PCB)</h2>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        The OS maintains a data structure for every single process called the <strong>PCB</strong>. 
                        It acts as the "manifest" for that process, containing everything the OS needs to know to run it.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                        <div className="p-3 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Process ID (PID)</div>
                        <div className="p-3 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Process State</div>
                        <div className="p-3 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Program Counter</div>
                        <div className="p-3 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">CPU Registers</div>
                        <div className="p-3 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Memory Limits</div>
                        <div className="p-3 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Open Files</div>
                        <div className="col-span-2 p-3 bg-zinc-800/50 border border-dashed border-zinc-700 text-zinc-500">...and more</div>
                    </div>
                </div>
            </section>

             {/* Threads Intro */}
             <section id="threads" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Threads: Lightweight Processes</h2>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        A traditional process has a single thread of control. If a process has multiple threads of control, it can perform more than one task at a time.
                        Threads share the process resources but maintain their own execution state.
                    </p>

                    {/* Visual Comparison */}
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center p-6 bg-black/40 rounded border border-zinc-800/50">
                        
                        {/* Single Threaded */}
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">Single-Threaded Process</span>
                            <div className="w-32 border border-zinc-700 bg-zinc-800 rounded-lg overflow-hidden flex flex-col">
                                <div className="h-8 bg-blue-900/20 flex items-center justify-center text-[10px] text-blue-300 border-b border-zinc-700">Code</div>
                                <div className="h-8 bg-blue-900/20 flex items-center justify-center text-[10px] text-blue-300 border-b border-zinc-700">Data</div>
                                <div className="h-8 bg-blue-900/20 flex items-center justify-center text-[10px] text-blue-300 border-b border-zinc-700">Files</div>
                                <div className="p-2 bg-zinc-900 flex flex-col gap-1">
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded px-1 py-2 text-[9px] text-amber-300 text-center">
                                        Registers<br/>Stack
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="text-zinc-600 font-mono text-xs">vs</div>

                         {/* Multi Threaded */}
                         <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">Multi-Threaded Process</span>
                            <div className="w-48 border border-zinc-700 bg-zinc-800 rounded-lg overflow-hidden flex flex-col relative">
                                {/* Shared Resources */}
                                <div className="absolute top-0 left-0 right-0 h-full border-2 border-dashed border-green-500/10 pointer-events-none rounded-lg"></div>
                                <div className="flex w-full">
                                    <div className="flex-1 h-8 bg-green-900/20 flex items-center justify-center text-[10px] text-green-300 border-b border-r border-zinc-700">Code</div>
                                    <div className="flex-1 h-8 bg-green-900/20 flex items-center justify-center text-[10px] text-green-300 border-b border-r border-zinc-700">Data</div>
                                    <div className="flex-1 h-8 bg-green-900/20 flex items-center justify-center text-[10px] text-green-300 border-b border-zinc-700">Files</div>
                                </div>
                                
                                <div className="p-2 bg-zinc-900 flex gap-2 justify-center">
                                    <div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded px-1 py-2 text-[9px] text-amber-300 text-center">
                                        Reg<br/>Stack
                                    </div>
                                    <div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded px-1 py-2 text-[9px] text-amber-300 text-center">
                                        Reg<br/>Stack
                                    </div>
                                    <div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded px-1 py-2 text-[9px] text-amber-300 text-center">
                                        Reg<br/>Stack
                                    </div>
                                </div>
                                <div className="text-[9px] text-center text-zinc-500 py-1">Shared Memory Space</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Models */}
            <section id="models" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Multithreading Models</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 flex flex-col items-center text-center">
                        <h3 className="font-bold text-white mb-2">Many-to-One</h3>
                        <p className="text-xs text-zinc-500 mb-4">Many user threads map to a single kernel thread.</p>
                        <div className="mt-auto p-2 bg-black rounded w-full border border-zinc-800">
                            <div className="flex justify-center gap-1 mb-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500"/>
                                <div className="w-2 h-2 rounded-full bg-blue-500"/>
                                <div className="w-2 h-2 rounded-full bg-blue-500"/>
                            </div>
                            <span className="text-zinc-600 text-xs">↓</span>
                             <div className="w-2 h-2 rounded-full bg-red-500 mx-auto mt-1"/>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 flex flex-col items-center text-center">
                        <h3 className="font-bold text-white mb-2">One-to-One</h3>
                        <p className="text-xs text-zinc-500 mb-4">Each user thread maps to a kernel thread (Linux/Windows).</p>
                         <div className="mt-auto p-2 bg-black rounded w-full border border-zinc-800">
                            <div className="flex justify-center gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mb-1"/>
                                    <div className="h-2 w-px bg-zinc-700 mb-1"/>
                                    <div className="w-2 h-2 rounded-full bg-red-500"/>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mb-1"/>
                                    <div className="h-2 w-px bg-zinc-700 mb-1"/>
                                    <div className="w-2 h-2 rounded-full bg-red-500"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 flex flex-col items-center text-center">
                        <h3 className="font-bold text-white mb-2">Many-to-Many</h3>
                        <p className="text-xs text-zinc-500 mb-4">Multiplexes many user threads to smaller/equal number of kernel threads.</p>
                         <div className="mt-auto p-2 bg-black rounded w-full border border-zinc-800">
                             <div className="flex justify-center gap-1 mb-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500"/>
                                <div className="w-2 h-2 rounded-full bg-blue-500"/>
                                <div className="w-2 h-2 rounded-full bg-blue-500"/>
                            </div>
                            <div className="flex justify-center text-zinc-700 text-[8px] my-0.5">XX</div>
                            <div className="flex justify-center gap-1 mt-1">
                                <div className="w-2 h-2 rounded-full bg-red-500"/>
                                <div className="w-2 h-2 rounded-full bg-red-500"/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
