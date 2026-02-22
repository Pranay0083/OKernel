import React from 'react';

export const WikiThreads = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
            {/* Header Section */}
            <div className="border-b border-zinc-800 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-mono rounded-full border border-yellow-500/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    CS 401: CONCURRENCY
                </div>
                <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
                    Multithreaded Programming
                </h1>
                <p className="text-xl text-zinc-400 leading-relaxed font-light">
                    A comprehensive analysis of multi-core parallelism, Threading Models (Many-to-One vs. One-to-One), Amdahl's Law, and the POSIX Pthreads API.
                </p>
            </div>

            {/* Section 1: Formal Definition */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. The Thread Concept</h2>

                <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                    A <strong>Thread</strong> is a basic unit of CPU utilization; it comprises a thread ID, a program counter (PC), a register set, and a stack. It shares with other threads belonging to the same process its code section, data section, and other operating-system resources, such as open files and signals.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(234,179,8,0.03)]">
                        <h3 className="text-xl font-bold text-yellow-500 mb-4 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Single-Threaded Process</h3>
                        <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
                            <li>Contains exactly one Program Counter (PC).</li>
                            <li>Can only execute one sequence of instructions at a time.</li>
                            <li>If a blocking system call is made (e.g., waiting for network I/O), the entire process sleeps, wasting CPU cycles.</li>
                        </ul>
                    </div>

                    <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(59,130,246,0.03)]">
                        <h3 className="text-xl font-bold text-blue-400 mb-4 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Multi-Threaded Process</h3>
                        <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
                            <li>Contains multiple Program Counters (PCs).</li>
                            <li>Provides <span className="text-blue-300 font-bold">Concurrency</span>: multiple threads making progress over time (interleaving).</li>
                            <li>Provides <span className="text-green-300 font-bold">Parallelism</span>: multiple threads executing simultaneously on separate physical CPU cores.</li>
                        </ul>
                    </div>
                </div>

                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl mt-8">
                    <h4 className="font-bold text-red-400 mb-2">Why use threads instead of multiple processes?</h4>
                    <p className="text-sm text-zinc-400">
                        Process creation via <code>fork()</code> is "heavyweight" because it requires cloning the entire memory address space (text, data, heap, and stack segments) and allocating a new PCB. Thread creation is "lightweight"; creating a new thread within an existing process only requires allocating a new stack and register set. Context-switching between threads is mathematically faster because the MMU cache (TLB) does not need to be flushed.
                    </p>
                </div>
            </section>

            {/* Section 2: Multithreading Models */}
            <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">2. Multithreading Models</h2>

                <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                    User threads are managed by user-level thread libraries without kernel support. Kernel threads are supported and managed directly by the operating system. There must exist a relationship between user threads and kernel threads.
                </p>

                <div className="space-y-8">
                    {/* Many-to-One */}
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                        <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">U</div>
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">U</div>
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">U</div>
                            </div>
                            <div className="text-zinc-500 font-bold">↓↓↓</div>
                            <div className="w-12 h-12 rounded bg-red-500 flex items-center justify-center text-sm font-bold text-white">K</div>
                        </div>
                        <div className="w-full md:w-2/3">
                            <h4 className="text-xl font-bold text-blue-400 mb-2">The Many-to-One Model</h4>
                            <p className="text-sm text-zinc-400 mb-2">Maps many user-level threads to a single kernel thread.</p>
                            <p className="text-sm text-zinc-500 p-3 bg-black border border-zinc-800 rounded">
                                <strong className="text-zinc-300">Fatal Flaw:</strong> Because the kernel recognizes only one execution context, if ANY user thread makes a blocking system call (e.g., waiting for I/O), the entire process blocks. Furthermore, it completely fails to utilize multi-core architectures because the single kernel thread can only run on one core. (Common in early Java distributions).
                            </p>
                        </div>
                    </div>

                    {/* One-to-One */}
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-zinc-950 p-6 rounded-xl border border-zinc-800 border-l-[4px] border-l-green-500">
                        <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                            <div className="flex gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">U</div>
                                    <div className="text-zinc-500 font-bold">↓</div>
                                    <div className="w-12 h-12 rounded bg-red-500 flex items-center justify-center text-sm font-bold text-white">K</div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">U</div>
                                    <div className="text-zinc-500 font-bold">↓</div>
                                    <div className="w-12 h-12 rounded bg-red-500 flex items-center justify-center text-sm font-bold text-white">K</div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">U</div>
                                    <div className="text-zinc-500 font-bold">↓</div>
                                    <div className="w-12 h-12 rounded bg-red-500 flex items-center justify-center text-sm font-bold text-white">K</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-2/3">
                            <h4 className="text-xl font-bold text-green-400 mb-2">The One-to-One Model (Industry Standard)</h4>
                            <p className="text-sm text-zinc-400 mb-2">Maps each user thread strictly to a kernel thread.</p>
                            <p className="text-sm text-zinc-500 p-3 bg-black border border-zinc-800 rounded">
                                <strong className="text-green-300">Modern Architecture:</strong> Provides superior concurrency. If one thread blocks on I/O, other threads continue executing. Threads can be placed on independent CPU cores for true parallelism. The only drawback is the overhead of allocating a kernel struct for every user thread created. Used by Linux and Windows.
                            </p>
                        </div>
                    </div>

                    {/* Many-to-Many */}
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                        <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">U</div>
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">U</div>
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">U</div>
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">U</div>
                            </div>
                            <div className="text-zinc-500 text-xs text-center border-y border-zinc-800 w-full py-1">MULTIPLEXOR LOGIC</div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded bg-red-500 flex items-center justify-center text-sm font-bold text-white">K</div>
                                <div className="w-12 h-12 rounded bg-red-500 flex items-center justify-center text-sm font-bold text-white">K</div>
                            </div>
                        </div>
                        <div className="w-full md:w-2/3">
                            <h4 className="text-xl font-bold text-purple-400 mb-2">The Many-to-Many Model</h4>
                            <p className="text-sm text-zinc-400 mb-2">Multiplexes many user-level threads to a smaller or equal number of kernel threads.</p>
                            <p className="text-sm text-zinc-500 p-3 bg-black border border-zinc-800 rounded">
                                <strong className="text-purple-300">Complex Abstraction:</strong> Developers can create as many user threads as required, and the corresponding kernel threads can run in parallel on a multiprocessor. The OS scheduler dynamically binds and unbinds user threads to available kernel threads. Exceptionally difficult to implement efficiently in the OS kernel.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Pthreads API in C */}
            <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">3. The POSIX Pthreads API</h2>

                <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                    Pthreads refers to the POSIX standard (IEEE 1003.1c) defining an API for thread creation and synchronization. It is a <em>specification</em> for thread behavior, not an implementation (though most Linux/UNIX systems use the NPTL implementation).
                </p>

                <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
                    <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
                        <span>pthred_demo.c</span>
                        <span>C Programming Language</span>
                    </div>
                    <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed">
                        <pre className="text-zinc-300">
                            <span className="text-pink-400">#include</span> <span className="text-green-300">&lt;pthread.h&gt;</span><br />
                            <span className="text-pink-400">#include</span> <span className="text-green-300">&lt;stdio.h&gt;</span><br />
                            <span className="text-pink-400">#include</span> <span className="text-green-300">&lt;stdlib.h&gt;</span><br />
                            <br />
                            <span className="text-blue-400">int</span> sum; <span className="text-zinc-500">{"/* This global data is shared by the thread(s) */"}</span><br />
                            <br />
                            <span className="text-zinc-500">{"/* The physical thread execution routine */"}</span><br />
                            <span className="text-blue-400">void</span> *<span className="text-yellow-300">runner</span>(<span className="text-blue-400">void</span> *param) {"{"}<br />
                            <span className="text-blue-400 pl-4">int</span> i, upper = <span className="text-yellow-300">atoi</span>(param);<br />
                            <span className="pl-4">sum = <span className="text-orange-400">0</span>;</span><br />
                            <span className="text-pink-400 pl-4">for</span> (i = <span className="text-orange-400">1</span>; i {`<=`} upper; i++)<br />
                            <span className="pl-8">sum += i;</span><br />
                            <span className="text-yellow-300 pl-4">pthread_exit</span>(<span className="text-orange-400">0</span>);<br />
                            {"}"}<br />
                            <br />
                            <span className="text-blue-400">int</span> <span className="text-yellow-300">main</span>(<span className="text-blue-400">int</span> argc, <span className="text-blue-400">char</span> *argv[]) {"{"}<br />
                            <span className="text-blue-400 pl-4">pthread_t</span> tid; <span className="text-zinc-500">{"/* The thread's unique logical identifier */"}</span><br />
                            <span className="text-blue-400 pl-4">pthread_attr_t</span> attr; <span className="text-zinc-500">{"/* Security and scheduling attributes */"}</span><br />
                            <br />
                            <span className="text-zinc-500 pl-4">{"/* Allocate default attributes */"}</span><br />
                            <span className="pl-4"><span className="text-yellow-300">pthread_attr_init</span>(&attr);</span><br />
                            <br />
                            <span className="text-zinc-500 pl-4">{"/* Create the physical thread context and begin execution */"}</span><br />
                            <span className="pl-4"><span className="text-yellow-300">pthread_create</span>(&tid, &attr, runner, argv[<span className="text-orange-400">1</span>]);</span><br />
                            <br />
                            <span className="text-zinc-500 pl-4">{"/* The parent process waits for the specified thread to terminate */"}</span><br />
                            <span className="pl-4"><span className="text-yellow-300">pthread_join</span>(tid, <span className="text-blue-400">NULL</span>);</span><br />
                            <br />
                            <span className="pl-4"><span className="text-yellow-300">printf</span>(<span className="text-green-300">"sum = %d\\n"</span>, sum);</span><br />
                            <span className="text-pink-400 pl-4">return</span> <span className="text-orange-400">0</span>;<br />
                            {"}"}
                        </pre>
                    </div>
                </div>
            </section>

            {/* Section 4: Amdahl's Law */}
            <section className="space-y-8 pt-16 border-t border-zinc-900 mt-12">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4 uppercase tracking-widest text-center">4. Mathematical Bounds of Parallelism</h2>

                <div className="bg-zinc-900/40 border border-zinc-800 p-10 rounded-xl max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-20 -top-20 opacity-5">
                        <span className="text-[20rem] font-serif font-black">&Sigma;</span>
                    </div>

                    <h3 className="text-4xl font-bold text-blue-400 mb-6 relative z-10 text-center">Amdahl's Law</h3>

                    <p className="text-zinc-400 leading-relaxed mb-8 text-center text-lg max-w-2xl mx-auto relative z-10">
                        Amdahl's Law dictates that the amount of performance gain achieved by adding more processing cores to an application is fundamentally limited by the proportion of the application that must be executed sequentially (serially).
                    </p>

                    <div className="bg-black/50 p-8 border border-zinc-800 rounded-xl flex items-center justify-center font-serif text-3xl italic relative z-10">
                        <div className="text-zinc-300">Speedup &le; </div>
                        <div className="flex flex-col items-center justify-center text-zinc-100 ml-4">
                            <span className="border-b-2 border-zinc-300 pb-2 px-6">1</span>
                            <span className="pt-2 px-2">S + <span className="text-zinc-500">(</span><span className="text-blue-400">1 - S</span><span className="text-zinc-500">) / </span><span className="text-green-400">N</span></span>
                        </div>
                    </div>

                    <ul className="text-sm text-zinc-500 space-y-4 mt-8 max-w-2xl mx-auto list-disc list-inside relative z-10">
                        <li><strong><span className="text-zinc-300">S</span></strong> = the proportion of execution time spent executing the serial (non-parallelizable) portion.</li>
                        <li><strong><span className="text-zinc-300">(1 - S)</span></strong> = the proportion of execution time spent executing the parallel portion.</li>
                        <li><strong><span className="text-green-400">N</span></strong> = the number of processing cores available.</li>
                    </ul>

                    <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-lg mt-8 text-sm font-mono text-blue-300 relative z-10 shadow-inner">
                        <strong>Theoretical Example:</strong> If an application is 75% parallel (<span className="text-blue-400">1 - S</span>) and 25% inherently sequential (<span className="text-zinc-300">S</span> = 0.25). Even if we apply <strong>infinity cores</strong> (<span className="text-green-400">N</span> &rarr; &infin;), the maximum speedup achievable is bounded by <code>1 / 0.25 = 4</code>. <br /><br />
                        <span className="text-zinc-400">Adding 10,000 CPU cores will never make this application run more than 4 times faster than a single core.</span>
                    </div>
                </div>
            </section>

        </div>
    );
};
