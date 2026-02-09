
import React from 'react';
import { Shield, Ban, Activity } from 'lucide-react';

export const WikiDeadlocks = () => {
    return (
        <div className="max-w-4xl space-y-12 animate-fade-in">
            {/* Header */}
            <div className="border-b border-zinc-800 pb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 text-xs font-mono rounded-full border border-red-500/20 mb-4">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    SYSTEM FAILURE
                </div>
                <h1 className="text-4xl font-bold text-white mb-6">Deadlocks</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    A deadlock is a situation where a set of processes are blocked because each process is holding a resource
                    and waiting for another resource acquired by some other process.
                </p>
            </div>

            {/* The Conditions */}
            <section id="conditions" className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">The Coffman Conditions</h2>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        For a deadlock to occur, these four conditions must hold simultaneously:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded">
                            <h3 className="font-bold text-red-400 mb-1">1. Mutual Exclusion</h3>
                            <p className="text-xs text-zinc-400">At least one resource must be held in a non-sharable mode.</p>
                        </div>
                        <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded">
                            <h3 className="font-bold text-red-400 mb-1">2. Hold and Wait</h3>
                            <p className="text-xs text-zinc-400">A process holds at least one resource and is waiting for others.</p>
                        </div>
                        <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded">
                            <h3 className="font-bold text-red-400 mb-1">3. No Preemption</h3>
                            <p className="text-xs text-zinc-400">Resources cannot be preempted (taken away) from a process involuntarily.</p>
                        </div>
                        <div className="p-4 bg-zinc-800/20 border border-zinc-800 rounded">
                            <h3 className="font-bold text-red-400 mb-1">4. Circular Wait</h3>
                            <p className="text-xs text-zinc-400">A set of processes &#123;P0, P1... Pn&#125; exists such that P0 waits for P1, P1 waits for P2... and Pn waits for P0.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Handling Deadlocks */}
            <section id="handling" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Handling Strategies</h2>
                </div>

                <div className="space-y-4">
                    {/* Ignorance */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex gap-4">
                        <div className="flex-shrink-0 pt-1">
                            <Ban className="text-zinc-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">The Ostrich Algorithm</h3>
                            <p className="text-sm text-zinc-400">
                                Just ignore the problem. Pretend it never happens.
                                Surprisingly, this is how most operating systems (including UNIX and Windows) handle deadlocks,
                                because deadlocks are rare and detection is expensive.
                            </p>
                        </div>
                    </div>

                    {/* Prevention */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex gap-4">
                        <div className="flex-shrink-0 pt-1">
                            <Shield className="text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Deadlock Prevention</h3>
                            <p className="text-sm text-zinc-400">
                                Ensure that at least one of the 4 conditions cannot hold.
                            </p>
                            <ul className="mt-2 space-y-1 text-xs text-zinc-500 list-disc list-inside">
                                <li><strong>No Circular Wait:</strong> Impose a total ordering of all resource types.</li>
                                <li><strong>No Hold and Wait:</strong> Require process to request all resources before starting.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Avoidance */}
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex gap-4">
                        <div className="flex-shrink-0 pt-1">
                            <Activity className="text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Deadlock Avoidance (Banker's Algorithm)</h3>
                            <p className="text-sm text-zinc-400">
                                The OS requires additional information about which resources a process will likely request.
                                Before granting a request, it simulates whether granting it will leave the system in a <strong>Safe State</strong>.
                            </p>
                            <div className="mt-4 p-3 bg-black/50 border border-zinc-800 rounded font-mono text-xs text-green-300">
                                if (is_safe_state(current_allocation + request)) &#123;<br />
                                &nbsp;&nbsp;grant_resources();<br />
                                &#125; else &#123;<br />
                                &nbsp;&nbsp;wait();<br />
                                &#125;
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
