import React from 'react';

export const WikiScheduler = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
            {/* Header Section */}
            <div className="border-b border-zinc-800 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-mono rounded-full border border-yellow-500/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    CS 401: CPU SCHEDULING
                </div>
                <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
                    Processor Scheduling Theory
                </h1>
                <p className="text-xl text-zinc-400 leading-relaxed font-light">
                    A rigorous examination of CPU-I/O burst cycles, scheduling criteria formulas, canonical algorithm evaluation (FCFS, SJF, RR), and Multi-Level Feedback Queues.
                </p>
            </div>

            {/* Section 1: Basic Concepts */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. Basic Concepts & The CPU-I/O Burst Cycle</h2>

                <p className="text-lg text-zinc-400 leading-relaxed">
                    The objective of multiprogramming is to have some process running at all times to maximize CPU utilization. In a uniprocessor system, only one process can run at a time; any others must wait until the CPU is free.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(234,179,8,0.03)]">
                        <h3 className="text-xl font-bold text-yellow-500 mb-4 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Burst Cycle Observation</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Process execution consists of a cycle of CPU execution and I/O wait. Processes alternate between these two states. Execution always begins with a <strong>CPU burst</strong>, followed by an <strong>I/O burst</strong>, which is followed by another CPU burst, and so on.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            An empirical histogram of CPU-burst durations reveals an exponential/hyper-exponential decay. There is a very large number of extremely short CPU bursts, and a small number of long CPU bursts.
                        </p>
                    </div>

                    <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(168,85,247,0.03)]">
                        <h3 className="text-xl font-bold text-purple-400 mb-4 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">The Short-Term Scheduler</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            Whenever the CPU becomes idle, the operating system must select one of the processes in the <em>ready queue</em> to be executed. The selection process is carried out by the short-term scheduler (or CPU scheduler).
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            The records in the queues are generally process control blocks (PCBs) of the processes. The scheduler selects a PCB from the ready queue via a specific linked-list algorithm (FIFO, Priority Tree, etc.) and allocates the CPU to it via the <strong>Dispatcher</strong>.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 2: Scheduling Criteria Formulas */}
            <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">2. Scheduling Criteria & Optimization</h2>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl">
                    Different scheduling algorithms have different properties. To formally evaluate an algorithm, we define five core performance criteria.
                </p>

                <div className="grid grid-cols-1 gap-6 mt-6">
                    <div className="flex flex-col md:flex-row gap-6 p-6 border border-zinc-800 bg-zinc-950 rounded-lg">
                        <div className="w-full md:w-1/4">
                            <h4 className="text-lg font-bold text-blue-400 font-mono tracking-widest">CPU Utilization</h4>
                        </div>
                        <div className="w-full md:w-3/4">
                            <p className="text-zinc-400 text-sm">Keep the CPU as busy as possible. Ranging from 0% to 100%. In a real system, it should range from 40% (light load) to 90% (heavy load).</p>
                            <div className="mt-2 text-blue-300 font-mono text-xs italic">Maximize Goal</div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 p-6 border border-zinc-800 bg-zinc-950 rounded-lg">
                        <div className="w-full md:w-1/4">
                            <h4 className="text-lg font-bold text-green-400 font-mono tracking-widest">Throughput</h4>
                        </div>
                        <div className="w-full md:w-3/4">
                            <p className="text-zinc-400 text-sm">If the CPU is busy, work is being done. One measure of work is the number of processes completed per time unit.</p>
                            <div className="mt-2 text-green-300 font-mono text-xs bg-black p-2 border border-zinc-800 rounded inline-block">
                                <span className="text-zinc-500">T = </span> <span className="text-white">ProcessesCompleted / TimeInterval</span>
                            </div>
                            <div className="mt-2 text-green-300 font-mono text-xs italic block">Maximize Goal</div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 p-6 border border-zinc-800 bg-zinc-950 rounded-lg">
                        <div className="w-full md:w-1/4">
                            <h4 className="text-lg font-bold text-red-500 font-mono tracking-widest">Turnaround Time</h4>
                        </div>
                        <div className="w-full md:w-3/4">
                            <p className="text-zinc-400 text-sm">From the point of view of a particular process, the important criterion is how long it takes to execute that process. Time from submission to completion.</p>
                            <div className="mt-2 text-red-400 font-mono text-xs bg-black p-2 border border-zinc-800 rounded inline-block">
                                <span className="text-zinc-500">T_turnaround = </span> <span className="text-white">CompletionTime - ArrivalTime</span>
                            </div>
                            <div className="mt-2 text-red-400 font-mono text-xs italic block">Minimize Goal</div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 p-6 border border-zinc-800 bg-zinc-950 rounded-lg">
                        <div className="w-full md:w-1/4">
                            <h4 className="text-lg font-bold text-orange-400 font-mono tracking-widest">Waiting Time</h4>
                        </div>
                        <div className="w-full md:w-3/4">
                            <p className="text-zinc-400 text-sm">The scheduling algorithm does not affect the amount of time during which a process executes or does I/O. It affects only the amount of time that a process spends waiting in the ready queue.</p>
                            <div className="mt-2 text-orange-300 font-mono text-xs bg-black p-2 border border-zinc-800 rounded inline-block">
                                <span className="text-zinc-500">T_wait = </span> <span className="text-white">TurnaroundTime - BurstTime</span>
                            </div>
                            <div className="mt-2 text-orange-400 font-mono text-xs italic block">Minimize Goal</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Algorithms */}
            <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">3. Algorithm Evaluation</h2>
                <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                    A comparative analysis of historical and modern scheduling algorithms based on the formal criteria previously defined.
                </p>

                {/* FCFS */}
                <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800">
                    <h3 className="text-2xl font-bold text-zinc-200 mb-2">3.1 First-Come, First-Served (FCFS)</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                        By far the simplest scheduling algorithm. The process that requests the CPU first is allocated the CPU first. Implementation is easily managed with a FIFO queue.
                    </p>

                    <div className="bg-black p-6 rounded border border-red-500/30">
                        <h4 className="text-red-400 font-bold mb-2">The Convoy Effect (Fatal Flaw)</h4>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Because FCFS is <em>nonpreemptive</em> (a process keeps the CPU until it voluntarily yields it), severe degradation occurs if a massive CPU-bound process arrives just before several short I/O-bound processes. This results in all I/O devices sitting idle while the entire system waits for the CPU-bound process to finish a burst, drastically lowering average CPU and device utilization.
                        </p>
                    </div>
                </div>

                {/* SJF */}
                <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800">
                    <h3 className="text-2xl font-bold text-zinc-200 mb-2">3.2 Shortest-Job-First (SJF)</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                        Associates with each process the length of the process's next CPU burst. When the CPU is available, it is assigned to the process that has the smallest next CPU burst.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black p-6 rounded border border-green-500/30">
                            <strong className="text-green-400 block mb-1">Provably Optimal</strong>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                SJF scheduling algorithm is provably optimal regarding minimum average waiting time for a given set of processes. Moving a short process before a long one decreases the waiting time of the short process more than it increases the waiting time of the long process.
                            </p>
                        </div>
                        <div className="bg-black p-6 rounded border border-orange-500/30">
                            <strong className="text-orange-400 block mb-1">Prediction Impossibility</strong>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                The real difficulty is knowing the length of the next CPU burst. For long-term (job) scheduling in a batch system, we can use the time limit submitted by the user. For short-term scheduling, there is no way to know the length of the next CPU burst. It is frequently approximated using exponentially weighted moving averages of previous bursts.
                            </p>
                        </div>
                    </div>
                </div>

                {/* MLFQ */}
                <div className="bg-blue-500/5 p-8 rounded-xl border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-blue-500/10 font-bold text-9xl leading-none">MLFQ</div>
                    <h3 className="text-2xl font-bold text-blue-400 mb-2 relative z-10">3.3 Multilevel Feedback Queue (MLFQ)</h3>
                    <span className="text-xs font-mono text-zinc-500 border border-zinc-700 bg-black px-2 py-1 rounded mb-6 inline-block relative z-10">THE INDUSTRY STANDARD (UNIX/WINDOWS)</span>

                    <p className="text-zinc-300 text-sm leading-relaxed mb-4 relative z-10">
                        The MLFQ algorithm allows a process to move between multiple priority queues. The idea is to separate processes according to the characteristics of their CPU bursts. If a process uses too much CPU time, it will be moved to a lower-priority queue. This mechanism naturally leaves I/O-bound and interactive processes in the higher-priority queues.
                    </p>

                    <div className="bg-black/80 border border-zinc-800 p-6 rounded-lg mt-6 relative z-10 font-mono text-sm">
                        <h4 className="text-zinc-100 border-b border-zinc-800 pb-2 mb-4 uppercase tracking-widest">Formal Definition Parameters</h4>
                        <ul className="space-y-2 text-zinc-400">
                            <li><span className="text-blue-400">1.</span> The number of queues.</li>
                            <li><span className="text-blue-400">2.</span> The scheduling algorithm for each queue (e.g., RR quantum = 8ms for Queue 0, RR quantum = 16ms for Queue 1, FCFS for lowest Queue).</li>
                            <li><span className="text-blue-400">3.</span> The mathematical threshold determining when to upgrade a process to a higher-priority queue (to prevent starvation).</li>
                            <li><span className="text-blue-400">4.</span> The mathematical threshold determining when to demote a process to a lower-priority queue.</li>
                            <li><span className="text-blue-400">5.</span> The method used to determine which queue a process will enter when it initially needs service.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Study Questions */}
            <section className="space-y-6 pt-16 border-t border-zinc-900 mt-12">
                <h2 className="text-2xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4 uppercase tracking-widest text-center">Chapter Review & Study Questions</h2>

                <div className="bg-black border border-zinc-800 p-8 rounded-xl space-y-6 text-sm">
                    <div>
                        <strong className="text-blue-400 block mb-1">Q1: Explain the fundamental difference between preemptive and nonpreemptive scheduling. Provide an example wherein nonpreemptive scheduling leads to system failure.</strong>
                        <p className="text-zinc-500 pl-4 border-l-2 border-zinc-800 mt-2">
                            Under <em>nonpreemptive</em> scheduling, once the CPU has been allocated to a process, the process keeps the CPU until it releases it either by terminating or by switching to the waiting state. In <em>preemptive</em> scheduling, the OS can interrupt an executing process via a hardware timer and force a context switch. If a nonpreemptive system encounters a process with an infinite loop (e.g., <code>while(true);</code>), the process will never yield, the OS will never regain control, and the entire machine will hang permanently.
                        </p>
                    </div>

                    <div>
                        <strong className="text-blue-400 block mb-1">Q2: Calculate the average waiting time for three processes (P1, P2, P3) with burst times (24ms, 3ms, 3ms) arriving at time 0 in FCFS order (P1, P2, P3). Compare this to the SJF ordering.</strong>
                        <div className="text-zinc-500 pl-4 border-l-2 border-zinc-800 mt-2 space-y-2 font-mono">
                            <p><strong>FCFS:</strong></p>
                            <ul className="list-disc list-inside pl-4">
                                <li>P1 waits 0ms. (Executes 0-24)</li>
                                <li>P2 waits 24ms. (Executes 24-27)</li>
                                <li>P3 waits 27ms. (Executes 27-30)</li>
                            </ul>
                            <p className="bg-zinc-900 inline-block px-2">Average Wait: (0 + 24 + 27) / 3 = 17 milliseconds.</p>

                            <p className="mt-4"><strong>SJF (Order: P2, P3, P1):</strong></p>
                            <ul className="list-disc list-inside pl-4">
                                <li>P2 waits 0ms. (Executes 0-3)</li>
                                <li>P3 waits 3ms. (Executes 3-6)</li>
                                <li>P1 waits 6ms. (Executes 6-30)</li>
                            </ul>
                            <p className="bg-zinc-900 inline-block px-2 text-green-400">Average Wait: (0 + 3 + 6) / 3 = 3 milliseconds.</p>
                            <p className="text-xs text-zinc-600 italic">This mathematically demonstrates the Convoy Effect and SJF optimality.</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};
