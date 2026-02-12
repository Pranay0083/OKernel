
import React from 'react';

export const WikiScheduler = () => {
    return (
        <div className="max-w-4xl space-y-12 animate-fade-in">
            {/* Header */}
            <div className="border-b border-zinc-800 pb-8">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-mono rounded-full border border-green-500/20 mb-4">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    CPU SCHEDULING
                </div>
                <h1 className="text-4xl font-bold text-white mb-6">Process Scheduling Algorithms</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    The CPU Scheduler is the component of the OS that decides which process runs next. 
                    Its goal is to maximize CPU utilization and minimize waiting time.
                </p>
            </div>

            {/* FCFS */}
            <section id="fcfs" className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">First-Come, First-Served (FCFS)</h2>
                    <span className="text-xs font-mono border border-zinc-700 bg-zinc-900 rounded px-2 py-1 text-zinc-500">Non-Preemptive</span>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        The simplest scheduling algorithm. Processes are executed in the exact order they arrive in the ready queue. 
                        It functions exactly like a queue at a grocery store.
                    </p>

                    {/* Visual Diagram */}
                    <div className="mb-6 p-4 bg-black/50 rounded border border-zinc-800/50">
                        <div className="text-xs font-mono text-zinc-500 mb-2">Ready Queue:</div>
                        <div className="flex gap-2">
                            <div className="h-12 w-24 bg-blue-900/50 border border-blue-500/30 rounded flex items-center justify-center text-blue-300 text-sm font-mono">P1 (10ms)</div>
                            <div className="h-12 w-16 bg-blue-900/50 border border-blue-500/30 rounded flex items-center justify-center text-blue-300 text-sm font-mono opacity-80">P2 (5ms)</div>
                            <div className="h-12 w-8 bg-blue-900/50 border border-blue-500/30 rounded flex items-center justify-center text-blue-300 text-sm font-mono opacity-60">P3 (2ms)</div>
                        </div>
                        <div className="mt-2 text-xs text-zinc-600">
                             ↑ CPU executes P1 first, then P2, then P3.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-900/10 border border-green-900/30 p-4 rounded">
                            <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-2">
                                Pros
                            </div>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Simple to understand and implement.</li>
                                <li>Fair in the sense of arrival order.</li>
                            </ul>
                        </div>
                        <div className="bg-red-900/10 border border-red-900/30 p-4 rounded">
                             <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                                Cons
                            </div>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li><strong>Convoy Effect:</strong> Short processes stuck behind long ones.</li>
                                <li>Poor response time for interactive systems.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

             {/* SJF */}
             <section id="sjf" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Shortest Job First (SJF)</h2>
                    <span className="text-xs font-mono border border-zinc-700 bg-zinc-900 rounded px-2 py-1 text-zinc-500">Non-Preemptive</span>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        The scheduler selects the waiting process with the <strong>smallest execution time</strong> to execute next.
                        This is provably optimal for minimizing average waiting time.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-900/10 border border-green-900/30 p-4 rounded">
                            <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-2">
                                Pros
                            </div>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Minimum average waiting time.</li>
                                <li>High throughput for batch systems.</li>
                            </ul>
                        </div>
                        <div className="bg-red-900/10 border border-red-900/30 p-4 rounded">
                             <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                                Cons
                            </div>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li><strong>Impossible to know</strong> burst time in advance (in real systems).</li>
                                <li><strong>Starvation:</strong> Long processes may never run if short ones keep arriving.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

             {/* Round Robin */}
             <section id="rr" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Round Robin (RR)</h2>
                    <span className="text-xs font-mono border border-blue-900 bg-blue-900/10 rounded px-2 py-1 text-blue-400">Preemptive</span>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        Designed for time-sharing systems. Each process is assigned a fixed time unit called a <strong>Quantum</strong>. 
                        If the process doesn't finish within the quantum, it is preempted (paused) and moved to the back of the queue.
                    </p>

                    {/* Visual Diagram */}
                    <div className="mb-6 p-4 bg-black/50 rounded border border-zinc-800/50">
                        <div className="text-xs font-mono text-zinc-500 mb-2">Time Quantum = 2 units</div>
                        <div className="flex items-center gap-1 font-mono text-xs overflow-x-auto">
                            <div className="px-3 py-2 bg-purple-900/50 border border-purple-500/30 text-purple-300 rounded">P1</div>
                            <span className="text-zinc-600">→</span>
                            <div className="px-3 py-2 bg-blue-900/50 border border-blue-500/30 text-blue-300 rounded">P2</div>
                            <span className="text-zinc-600">→</span>
                            <div className="px-3 py-2 bg-orange-900/50 border border-orange-500/30 text-orange-300 rounded">P3</div>
                            <span className="text-zinc-600">→</span>
                             <div className="px-3 py-2 bg-purple-900/50 border border-purple-500/30 text-purple-300 rounded">P1</div>
                             <span className="text-zinc-600">...</span>
                        </div>
                        <div className="mt-2 text-xs text-zinc-600">
                             CPU switches rapidly, giving the illusion of parallelism.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-900/10 border border-green-900/30 p-4 rounded">
                            <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-2">
                                Pros
                            </div>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Fair execution (everyone gets a turn).</li>
                                <li>Best for interactive/desktop systems.</li>
                            </ul>
                        </div>
                        <div className="bg-red-900/10 border border-red-900/30 p-4 rounded">
                             <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                                Cons
                            </div>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>High overhead from frequent Context Switching.</li>
                                <li>If Quantum is too large → degrades to FCFS.</li>
                                <li>If Quantum is too small → CPU spends all time switching.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
