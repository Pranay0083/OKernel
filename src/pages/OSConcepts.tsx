import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const OSConcepts = () => {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="space-y-4 text-center">
                        <h1 className="text-4xl font-bold tracking-tight">Kernel Knowledge Base</h1>
                        <p className="text-muted-foreground font-mono">/var/lib/knowledge</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900/50 border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                            <h3 className="text-xl font-bold text-primary mb-2">Process Control Block (PCB)</h3>
                            <p className="text-zinc-400 text-sm">
                                A data structure in the operating system kernel containing the information needed to manage a particular process. It includes the process ID, state, program counter, and register values.
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                            <h3 className="text-xl font-bold text-primary mb-2">Context Switching</h3>
                            <p className="text-zinc-400 text-sm">
                                The process of storing the state of a process or thread, so that it can be restored and resume execution later. This allows multiple processes to share a single CPU.
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                            <h3 className="text-xl font-bold text-primary mb-2">Preemption</h3>
                            <p className="text-zinc-400 text-sm">
                                The act of temporarily interrupting a task being carried out by a computer system, without requiring its cooperation, and with the intention of resuming the task later.
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                            <h3 className="text-xl font-bold text-primary mb-2">Throughput</h3>
                            <p className="text-zinc-400 text-sm">
                                A measure of the number of processes that are completed per time unit. High throughput is a key goal of batch processing systems.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
