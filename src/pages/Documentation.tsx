import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const Documentation = () => {
    return (
        <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="space-y-4 text-center">
                        <h1 className="text-4xl font-bold tracking-tight">SysCore Manual</h1>
                        <p className="text-muted-foreground font-mono">/usr/share/doc/syscore</p>
                    </div>

                    <div className="space-y-8">
                        {/* Section 1 */}
                        <div className="bg-zinc-900/50 border border-border rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-white mb-4">1. The Terminal Interface</h2>
                            <p className="text-zinc-400 mb-4">
                                The Console is your primary gateway to the SysCore Kernel. It mimics a standard Unix-like shell environment.
                            </p>
                            <ul className="text-sm space-y-2 text-zinc-300 list-disc list-inside">
                                <li>Use <code className="bg-black px-1 rounded text-green-400">help</code> to list available commands.</li>
                                <li>Use <code className="bg-black px-1 rounded text-primary">syscore</code> to explore the kernel API.</li>
                                <li>Use <code className="bg-black px-1 rounded text-yellow-400">Tab</code> for auto-completion.</li>
                                <li>Use Up/Down arrows to cycle through command history.</li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div className="bg-zinc-900/50 border border-border rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-white mb-4">2. CPU Visualizer</h2>
                            <p className="text-zinc-400 mb-4">
                                The Visualizer enables real-time observation of process scheduling algorithms.
                            </p>
                            <ul className="text-sm space-y-2 text-zinc-300 list-disc list-inside">
                                <li><strong>Controls:</strong> Play, Pause, and Reset the simulation clock.</li>
                                <li><strong>Algorithms:</strong> Switch between RR, SJF, FCFS, SRTF dynamically.</li>
                                <li><strong>Process Creation:</strong> Add custom processes with defined Arrival and Burst times.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};
