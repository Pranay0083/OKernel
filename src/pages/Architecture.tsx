import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Cpu, Database, LayoutTemplate, ArrowDown } from 'lucide-react';

export const Architecture = () => {
    return (
        <Layout>
            <div className="container mx-auto px-4 pt-32 pb-24 max-w-4xl">
                {/* Header */}
                <div className="mb-12 border-b border-zinc-800 pb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-400 text-xs font-mono rounded mb-4">
                        <span>$ cat architecture.json</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 font-mono">SYSTEM_ARCHITECTURE</h1>
                    <p className="text-zinc-500 font-mono text-sm">
                        &gt; High-level data flow and state management diagram.
                    </p>
                </div>

                {/* Diagram */}
                <div className="relative">
                    {/* Visual Data Flow Diagram */}
                    <div className="mb-16 p-8 border border-zinc-800 bg-black rounded-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 text-center items-center">

                            {/* Col 1 */}
                            <div className="space-y-4">
                                <div className="p-4 bg-zinc-900 border border-zinc-700 rounded text-green-500 font-mono text-sm">Initial State</div>
                                <ArrowDown className="mx-auto text-zinc-600" size={16} />
                                <div className="p-4 bg-zinc-900 border border-zinc-700 rounded text-white font-mono font-bold">Dispatcher</div>
                            </div>

                            {/* Col 2 */}
                            <div className="space-y-4 pt-12">
                                <div className="p-6 bg-zinc-950 border-2 border-dashed border-green-500/30 rounded-full w-40 h-40 mx-auto flex flex-col items-center justify-center">
                                    <div className="text-xs text-zinc-500 uppercase mb-1">Cycle</div>
                                    <Cpu size={32} className="text-green-500 mb-2" />
                                    <div className="text-lg font-bold text-white">Tick()</div>
                                </div>
                            </div>

                            {/* Col 3 */}
                            <div className="space-y-4">
                                <div className="p-4 bg-zinc-900 border border-zinc-700 rounded text-blue-500 font-mono text-sm">State Mutation</div>
                                <ArrowDown className="mx-auto text-zinc-600" size={16} />
                                <div className="p-4 bg-zinc-900 border border-zinc-700 rounded text-white font-mono font-bold">Re-Render</div>
                            </div>
                        </div>

                        {/* Connecting Lines (CSS) */}
                        <div className="absolute top-1/2 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-zinc-800 via-green-500/20 to-zinc-800 -z-10"></div>
                    </div>

                    {/* Vertical Connecting Line */}
                    <div className="absolute left-6 top-8 bottom-8 w-px bg-zinc-800 border-l border-dashed border-zinc-700"></div>

                    <div className="space-y-12">

                        {/* Layer 1: Core */}
                        <div className="relative pl-20 group">
                            <div className="absolute left-0 top-0 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-primary z-10">
                                <Database size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-white mb-2 font-mono">Global State (useScheduler)</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                                The simulation engine runs on a custom React Hook. It maintains the <span className="text-zinc-300 font-mono">Process Control Block (PCB)</span>,
                                Ready Queue, and Clock tick. State updates are batched to ensure 60fps performance during high-speed execution.
                            </p>
                        </div>

                        {/* Layer 2: Scheduler Logic */}
                        <div className="relative pl-20 group">
                            <div className="absolute left-0 top-0 p-3 bg-black border border-zinc-700 rounded-lg text-blue-500 z-10">
                                <Cpu size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-white mb-2 font-mono">Scheduler Dispatcher</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                                A pure function <span className="text-zinc-300 font-mono">nextTick(state)</span> determines the next state.
                                It implements the specific algorithms (FCFS, SJF, RR) to select processes from the Ready Queue and Context Switch the CPU.
                            </p>
                        </div>

                        {/* Layer 3: Presentation */}
                        <div className="relative pl-20 group">
                            <div className="absolute left-0 top-0 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-purple-500 z-10">
                                <LayoutTemplate size={20} />
                            </div>
                            <h3 className="font-bold text-lg text-white mb-2 font-mono">View Layer (Cockpit)</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                                The UI visualizes the state using three specialized components:
                                <span className="text-zinc-300 font-mono"> &lt;Cpu /&gt;</span> (Registers),
                                <span className="text-zinc-300 font-mono"> &lt;ReadyQueue /&gt;</span> (Memory), and
                                <span className="text-zinc-300 font-mono"> &lt;ProcessList /&gt;</span> (Job Pool).
                            </p>
                        </div>

                    </div>
                </div>

                {/* Footer Code Snippet */}
                <div className="mt-16 bg-black p-6 rounded-lg border border-zinc-800 font-mono text-xs overflow-hidden">
                    <div className="text-zinc-600 mb-2 border-b border-zinc-900 pb-2">src/core/scheduler.ts</div>
                    <pre className="text-zinc-400">
                        <span className="text-purple-400">export const</span> nextTick = (state: State): State =&gt; {'{'}<br />
                        &nbsp;&nbsp;<span className="text-zinc-500">// 1. Handle Process Arrival</span><br />
                        &nbsp;&nbsp;<span className="text-blue-400">const</span> newlyArrived = checkArrivals(state.time);<br />
                        &nbsp;&nbsp;<br />
                        &nbsp;&nbsp;<span className="text-zinc-500">// 2. Execute Algorithm Strategy</span><br />
                        &nbsp;&nbsp;<span className="text-blue-400">const</span> nextPid = strategies[state.algo](state.queue);<br />
                        &nbsp;&nbsp;<br />
                        &nbsp;&nbsp;<span className="text-purple-400">return</span> updateState(state, nextPid);<br />
                        {'}'}
                    </pre>
                </div>

            </div>
        </Layout>
    );
};
