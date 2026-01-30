import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const AlgoWiki = () => {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="space-y-4 text-center">
                        <h1 className="text-4xl font-bold tracking-tight">Algorithm Registry</h1>
                        <p className="text-muted-foreground font-mono">/sys/class/algos</p>
                    </div>

                    <div className="space-y-6">
                        {/* FCFS */}
                        <div className="bg-zinc-900/50 border border-border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-green-400">First-Come, First-Served (FCFS)</h3>
                                <span className="text-xs border border-zinc-700 rounded px-2 py-1 text-zinc-500">Non-Preemptive</span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-4">
                                The simplest scheduling algorithm. Processes are executed in the exact order they arrive in the ready queue.
                            </p>
                            <div className="bg-black/50 p-3 rounded font-mono text-xs text-zinc-500">
                                Trade-off: Simple to implement but suffers from the "Convoy Effect" where short processes wait behind long ones.
                            </div>
                        </div>

                        {/* SJF */}
                        <div className="bg-zinc-900/50 border border-border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-green-400">Shortest Job First (SJF)</h3>
                                <span className="text-xs border border-zinc-700 rounded px-2 py-1 text-zinc-500">Non-Preemptive</span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-4">
                                Selects the waiting process with the smallest execution time to execute next.
                            </p>
                            <div className="bg-black/50 p-3 rounded font-mono text-xs text-zinc-500">
                                Trade-off: Optimal for average waiting time, but requires knowing burst time in advance and can cause starvation.
                            </div>
                        </div>

                        {/* RR */}
                        <div className="bg-zinc-900/50 border border-border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-green-400">Round Robin (RR)</h3>
                                <span className="text-xs border border-blue-900 rounded px-2 py-1 text-blue-400">Preemptive</span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-4">
                                Each process is assigned a fixed time slot (quantum). If it doesn't finish, it's preempted and moved to the back of the queue.
                            </p>
                            <div className="bg-black/50 p-3 rounded font-mono text-xs text-zinc-500">
                                Trade-off: Fair and responsive, but performance depends heavily on the time quantum size.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
