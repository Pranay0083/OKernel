
import React from 'react';
import { Link } from 'react-router-dom';

export const WikiConcurrency = () => {
    return (
        <div className="max-w-4xl space-y-12 animate-fade-in">
            {/* Header */}
            <div className="border-b border-zinc-800 pb-8">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-mono rounded-full border border-purple-500/20 mb-4">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    CONCURRENCY
                </div>
                <h1 className="text-4xl font-bold text-white mb-6">Synchronization</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    When multiple processes or threads access shared data simultaneously, chaos can ensue. 
                    Synchronization primitives are the tools we use to maintain order.
                </p>
            </div>

            {/* The Problem: Race Conditions */}
            <section id="race-conditions" className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">The Race Condition</h2>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        A <strong>Race Condition</strong> occurs when two or more threads attempt to change shared data at the same time. 
                        Because the thread scheduling algorithm can swap between threads at any time, you don't know the order in which the threads will attempt to access the shared data.
                    </p>

                    {/* Visual Diagram */}
                    <div className="mb-6 p-4 bg-black/50 rounded border border-zinc-800/50">
                        <div className="text-xs font-mono text-zinc-500 mb-4 text-center">Shared Variable: <span className="text-white">counter = 5</span></div>
                        
                        <div className="flex justify-between items-center gap-8 px-8">
                            {/* Thread A */}
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-sm font-bold text-blue-400">Thread A</span>
                                <div className="p-2 border border-blue-500/30 bg-blue-900/10 rounded text-xs font-mono text-blue-200">
                                    1. Read counter (5)<br/>
                                    2. Increment (6)
                                </div>
                            </div>

                            <div className="h-px bg-red-500/50 flex-1 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-2 text-red-500 text-xs font-bold uppercase">
                                    Context Switch!
                                </div>
                            </div>

                            {/* Thread B */}
                             <div className="flex flex-col items-center gap-2">
                                <span className="text-sm font-bold text-orange-400">Thread B</span>
                                <div className="p-2 border border-orange-500/30 bg-orange-900/10 rounded text-xs font-mono text-orange-200">
                                    1. Read counter (5)<br/>
                                    2. Increment (6)<br/>
                                    3. Write (6)
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-center text-xs text-zinc-500">
                             Result: Thread A writes 6, Thread B writes 6. <strong className="text-red-400">Final value is 6, should be 7!</strong>
                        </div>
                    </div>
                </div>
            </section>

             {/* Mutex Locks */}
             <section id="mutex" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Mutex (Mutual Exclusion)</h2>
                    <span className="text-xs font-mono border border-zinc-700 bg-zinc-900 rounded px-2 py-1 text-zinc-500">Locking Mechanism</span>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        A Mutex is a locking mechanism used to synchronize access to a resource. Only one task (can be a thread or process) can acquire the mutex. 
                        It means "Mutual Exclusion".
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black/40 border border-zinc-800 rounded-lg p-4 font-mono text-xs">
                            <div className="text-zinc-500 mb-2">// How it works</div>
                            <div className="text-purple-400">mutex.lock()</div>
                            <div className="text-zinc-300 pl-4 py-1 border-l-2 border-zinc-700 my-1">
                                // Critical Section<br/>
                                // Safe to modify shared data
                            </div>
                            <div className="text-purple-400">mutex.unlock()</div>
                        </div>

                         <div className="flex items-center justify-center p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                            <div className="text-center">
                                <p className="text-sm text-zinc-400">Think of it as a key to a restroom.<br/>Only one person can have the key at a time.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* Semaphores */}
             <section id="semaphores" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Semaphores</h2>
                    <span className="text-xs font-mono border border-blue-900 bg-blue-900/10 rounded px-2 py-1 text-blue-400">Signaling Mechanism</span>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        A generic signaling mechanism. A semaphore is an integer variable that, apart from initialization, is accessed only through two standard atomic operations: <strong>wait()</strong> and <strong>signal()</strong>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-zinc-800/20 p-4 rounded border border-zinc-800">
                            <h3 className="text-white font-bold mb-2">Binary Semaphore</h3>
                            <p className="text-sm text-zinc-400">Value ranges between 0 and 1. Same as a Mutex lock.</p>
                        </div>
                        <div className="bg-zinc-800/20 p-4 rounded border border-zinc-800">
                            <h3 className="text-white font-bold mb-2">Counting Semaphore</h3>
                            <p className="text-sm text-zinc-400">Value can range over an unrestricted domain. Used to control access to a resource with multiple instances.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Read More */}
            <section className="pt-8 border-t border-zinc-800">
                <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-white">What happens if synchronization fails?</h3>
                        <p className="text-sm text-zinc-400">Learn about Deadlocks and how to prevent them.</p>
                    </div>
                    <Link to="/algo-wiki/deadlocks" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded transition-colors">
                        Go to Deadlocks →
                    </Link>
                </div>
            </section>
        </div>
    );
};
