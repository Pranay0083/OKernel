import React from 'react';

export const WikiConcurrency = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
            {/* Header Section */}
            <div className="border-b border-zinc-800 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 text-xs font-mono rounded-full border border-red-500/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    CS 401: PROCESS SYNCHRONIZATION
                </div>
                <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
                    The Critical-Section Problem
                </h1>
                <p className="text-xl text-zinc-400 leading-relaxed font-light">
                    A formal analysis of concurrent execution, data inconsistency, Peterson's software solution, and hardware-level atomic synchronization primitives (TAS/CAS).
                </p>
            </div>

            {/* Section 1: Formal Definition */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. Background & The Race Condition</h2>

                <p className="text-lg text-zinc-400 leading-relaxed">
                    Concurrent access to shared data may result in data inconsistency. Maintaining data consistency requires mechanisms to ensure the orderly execution of cooperating processes.
                </p>

                <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 mt-6">
                    <h3 className="text-xl font-bold text-red-400 mb-4 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">The Race Condition</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                        A race condition occurs when several processes access and manipulate the same data concurrently and the outcome of the execution depends on the particular order in which the access takes place.
                    </p>

                    <div className="bg-black border border-zinc-800 p-6 rounded-lg font-mono text-sm space-y-2">
                        <p className="text-zinc-500">Consider a standard integer increment: <code>counter++</code>. While this seems like a single operation in C, the compiler translates it into three primitive machine instructions:</p>
                        <div className="pl-4 border-l-2 border-red-500 text-zinc-300 py-2">
                            1. <span className="text-blue-400">register1</span> = counter<br />
                            2. <span className="text-blue-400">register1</span> = <span className="text-blue-400">register1</span> + 1<br />
                            3. counter = <span className="text-blue-400">register1</span>
                        </div>
                        <p className="text-red-400 italic text-xs mt-2">If a context switch occurs between an arbitrary pair of these instructions across two threads, the final value of 'counter' will be mathematically incorrect.</p>
                    </div>
                </div>

                <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 mt-6">
                    <h3 className="text-xl font-bold text-zinc-200 mb-4 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">The Critical-Section Requirements</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                        A critical section is a segment of code in which the process may be changing common variables, updating a table, writing a file, etc. A solution to the critical-section problem must satisfy the following three requirements:
                    </p>
                    <ul className="space-y-4 text-sm text-zinc-400">
                        <li><strong className="text-zinc-200 block">1. Mutual Exclusion:</strong> If process P is executing in its critical section, then no other processes can be executing in their critical sections.</li>
                        <li><strong className="text-zinc-200 block">2. Progress:</strong> If no process is executing in its critical section and some processes wish to enter their critical sections, then only those processes that are not executing in their remainder sections can participate in deciding which will enter its critical section next, and this selection cannot be postponed indefinitely.</li>
                        <li><strong className="text-zinc-200 block">3. Bounded Waiting:</strong> There exists a bound, or limit, on the number of times that other processes are allowed to enter their critical sections after a process has made a request to enter its critical section and before that request is granted.</li>
                    </ul>
                </div>
            </section>

            {/* Section 2: Peterson's Solution */}
            <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <h2 className="text-3xl font-bold text-zinc-100">2. Software Synchronization: Peterson's Solution</h2>
                    <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded font-mono text-xs">CLASSICAL THEOREM</span>
                </div>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
                    Peterson's solution is a classic software-based solution to the critical-section problem. It is restricted to two processes that alternate execution between their critical sections and remainder sections.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* Algorithm Overview */}
                    <div className="space-y-4 text-zinc-400 text-sm">
                        <p>Peterson's solution requires two shared data items:</p>
                        <div className="bg-black p-4 border border-zinc-800 rounded font-mono">
                            <span className="text-blue-400">int</span> turn;<br />
                            <span className="text-blue-400">boolean</span> flag[<span className="text-orange-400">2</span>];
                        </div>
                        <ul className="list-disc list-inside space-y-2 mt-4 ml-2">
                            <li>The variable <code>turn</code> indicates whose turn it is to enter the critical section.</li>
                            <li>The <code>flag</code> array is used to indicate if a process is ready to enter the critical section. <code>flag[i] = true</code> implies that process $P_i$ is ready!</li>
                        </ul>
                        <div className="mt-6 p-4 border-l-4 border-l-orange-500 bg-orange-500/5 text-orange-200">
                            <strong>Modern Architecture Warning:</strong> Peterson's solution is not guaranteed to work on modern computer architectures because modern compilers and processors reorder instructions (out-of-order execution) to improve performance, violating the strict sequential assumptions of the algorithm.
                        </div>
                    </div>

                    {/* Concept Code Example */}
                    <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl h-full">
                        <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
                            <span>petersons_algo.c</span>
                            <span>Algorithm Structure</span>
                        </div>
                        <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed h-full">
                            <pre className="text-zinc-300">
                                <span className="text-zinc-500">{"/* Code for Process Pi (where j is the other process) */"}</span><br />
                                <br />
                                <span className="text-pink-400">while</span> (<span className="text-orange-400">true</span>) {"{"}<br />
                                <br />
                                <span className="text-zinc-500 pl-4">{"/* Declare intent to enter */"}</span><br />
                                <span className="pl-4">flag[i] = <span className="text-orange-400">true</span>;</span><br />
                                <br />
                                <span className="text-zinc-500 pl-4">{"/* Give away priority to the other process */"}</span><br />
                                <span className="pl-4">turn = j;</span><br />
                                <br />
                                <span className="text-zinc-500 pl-4">{"/* Spinlock / Busy Wait until condition clears */"}</span><br />
                                <span className="text-pink-400 pl-4">while</span> (flag[j] && turn == j)<br />
                                <span className="pl-8 text-zinc-500">; /* do nothing */</span><br />
                                <br />
                                <span className="text-green-400 pl-4">{"/* --- CRITICAL SECTION --- */"}</span><br />
                                <br />
                                <span className="text-zinc-500 pl-4">{"/* Exit Section: Release lock */"}</span><br />
                                <span className="pl-4">flag[i] = <span className="text-orange-400">false</span>;</span><br />
                                <br />
                                <span className="text-blue-400 pl-4">{"/* --- REMAINDER SECTION --- */"}</span><br />
                                <br />
                                {"}"}
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Hardware Synchronization */}
            <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">3. Synchronization Hardware Atomicity</h2>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
                    Because software solutions like Peterson's are insufficient on modern multi-core processors, we rely on hardware support. Hardware provides special <strong>atomic</strong> instructions. An atomic instruction executes as a single, uninterruptible unit. Even if two threads issue the instruction at the exact same clock cycle across two separate cores, the hardware arbiter forces them to execute sequentially.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* test_and_set */}
                    <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(59,130,246,0.03)] flex flex-col h-full">
                        <h3 className="text-xl font-bold text-blue-400 mb-2 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">test_and_set()</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            This instruction atomically returns the original value of a passed boolean variable, AND sets the new value of that variable to true.
                        </p>

                        <div className="bg-black p-4 border border-zinc-800 rounded font-mono text-xs text-zinc-300 mt-auto">
                            <span className="text-blue-400">boolean</span> <span className="text-yellow-300">test_and_set</span>(<span className="text-blue-400">boolean</span> *target) {"{"}<br />
                            <span className="text-blue-400 pl-4">boolean</span> rv = *target;<br />
                            <span className="pl-4">*target = <span className="text-orange-400">true</span>;</span><br />
                            <span className="text-pink-400 pl-4">return</span> rv;<br />
                            {"}"}<br />
                            <br />
                            <span className="text-zinc-500">/* Usage to protect a critical section */</span><br />
                            <span className="text-pink-400">while</span> (<span className="text-yellow-300">test_and_set</span>(&lock))<br />
                            <span className="text-zinc-500 pl-4">; /* do nothing */</span><br />
                            <span className="text-green-400">/* CRITICAL SECTION */</span><br />
                            lock = <span className="text-orange-400">false</span>;<br />
                        </div>
                    </div>

                    {/* compare_and_swap */}
                    <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(168,85,247,0.03)] flex flex-col h-full">
                        <h3 className="text-xl font-bold text-purple-400 mb-2 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">compare_and_swap()</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            CAS operates on three operands. The operand <code>value</code> is set to <code>new_value</code> ONLY IF the expression <code>(*value == expected)</code> evaluates to true. It always returns the original value.
                        </p>

                        <div className="bg-black p-4 border border-zinc-800 rounded font-mono text-xs text-zinc-300 mt-auto">
                            <span className="text-blue-400">int</span> <span className="text-yellow-300">compare_and_swap</span>(<span className="text-blue-400">int</span> *value, <span className="text-blue-400">int</span> expected, <span className="text-blue-400">int</span> new_value) {"{"}<br />
                            <span className="text-blue-400 pl-4">int</span> temp = *value;<br />
                            <span className="text-pink-400 pl-4">if</span> (*value == expected)<br />
                            <span className="pl-8">*value = new_value;</span><br />
                            <span className="text-pink-400 pl-4">return</span> temp;<br />
                            {"}"}<br />
                            <br />
                            <span className="text-zinc-500">/* Usage to protect a critical section */</span><br />
                            <span className="text-pink-400">while</span> (<span className="text-yellow-300">compare_and_swap</span>(&lock, <span className="text-orange-400">0</span>, <span className="text-orange-400">1</span>) != <span className="text-orange-400">0</span>)<br />
                            <span className="text-zinc-500 pl-4">; /* do nothing */</span><br />
                            <span className="text-green-400">/* CRITICAL SECTION */</span><br />
                            lock = <span className="text-orange-400">0</span>;<br />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl mt-8">
                    <h4 className="font-bold text-blue-400 mb-2">Mutex Locks (Software abstraction of hardware primitives)</h4>
                    <p className="text-sm text-zinc-400">
                        Operating system designers build higher-level software tools (like Mutexes) on top of TAS and CAS instructions to solve the critical-section problem for application programmers. A Mutex (mutual exclusion) object provides <code>acquire()</code> and <code>release()</code> functions. Calls to <code>acquire()</code> must be executed atomically, meaning Mutexes are internally implemented using these hardware operations.
                    </p>
                </div>
            </section>
        </div>
    );
};
