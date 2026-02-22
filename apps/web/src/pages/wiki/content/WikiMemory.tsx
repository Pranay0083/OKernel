import React from 'react';

export const WikiVirtualMemory = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
            {/* Header Section */}
            <div className="border-b border-zinc-800 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-400 text-xs font-mono rounded-full border border-pink-500/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    CS 401: VIRTUAL MEMORY
                </div>
                <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
                    Virtual Memory Theory
                </h1>
                <p className="text-xl text-zinc-400 leading-relaxed font-light">
                    An advanced exploration of Demand Paging, Page Fault Handling, Replacement Algorithms (FIFO vs LRU), Belady's Anomaly, and Thrashing mathematics.
                </p>
            </div>

            {/* Section 1: Demand Paging */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. Demand Paging & Page Faults</h2>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl">
                    Virtual memory involves the separation of logical memory as perceived by users from physical memory. This separation allows an extremely large virtual memory to be provided for programmers when only a smaller physical memory is available.
                </p>

                <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 mt-6">
                    <h3 className="text-xl font-bold text-zinc-200 mb-4 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Hardware Support: The Valid-Invalid Bit</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                        A demand-paging system is similar to a paging system with swapping where processes reside in secondary memory (usually a disk). When we want to execute a process, we swap it into memory. Rather than swapping the entire process into memory, however, a lazy swapper (`pager`) brings in only the pages it needs.
                    </p>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                        To distinguish between pages that are in memory and those that are strictly on the disk, the MMU requires an extra bit in each page table entry: the valid-invalid bit.
                    </p>

                    {/* Diagram */}
                    <div className="flex justify-center gap-12 font-mono text-xs text-zinc-400">
                        {/* Logical Memory */}
                        <div className="w-32">
                            <div className="text-center mb-2 font-bold text-zinc-100">Logical Memory</div>
                            <div className="border border-zinc-700 bg-black flex flex-col items-center">
                                <div className="w-full border-b border-zinc-800 p-2 text-center text-blue-400">Page 0 (A)</div>
                                <div className="w-full border-b border-zinc-800 p-2 text-center text-blue-400">Page 1 (B)</div>
                                <div className="w-full border-b border-zinc-800 p-2 text-center text-blue-400">Page 2 (C)</div>
                                <div className="w-full border-b border-zinc-800 p-2 text-center text-blue-400">Page 3 (D)</div>
                                <div className="w-full border-b border-zinc-800 p-2 text-center text-blue-400">Page 4 (E)</div>
                                <div className="w-full p-2 text-center text-blue-400">Page 5 (F)</div>
                            </div>
                        </div>
                        {/* Page Table */}
                        <div className="w-48 relative top-12">
                            <div className="text-center mb-2 font-bold text-zinc-100">Page Table</div>
                            <div className="border border-zinc-700 bg-black flex flex-col w-full">
                                <div className="flex w-full border-b border-zinc-800">
                                    <div className="flex-1 p-2 text-center border-r border-zinc-800 text-green-400">4</div>
                                    <div className="flex-1 p-2 text-center text-teal-300 font-bold">v</div>
                                </div>
                                <div className="flex w-full border-b border-zinc-800 bg-red-500/10">
                                    <div className="flex-1 p-2 text-center border-r border-zinc-800 text-zinc-600">-</div>
                                    <div className="flex-1 p-2 text-center text-red-400 font-bold">i</div>
                                </div>
                                <div className="flex w-full border-b border-zinc-800 bg-red-500/10">
                                    <div className="flex-1 p-2 text-center border-r border-zinc-800 text-zinc-600">-</div>
                                    <div className="flex-1 p-2 text-center text-red-400 font-bold">i</div>
                                </div>
                                <div className="flex w-full border-b border-zinc-800">
                                    <div className="flex-1 p-2 text-center border-r border-zinc-800 text-green-400">7</div>
                                    <div className="flex-1 p-2 text-center text-teal-300 font-bold">v</div>
                                </div>
                                <div className="flex w-full border-b border-zinc-800 bg-red-500/10">
                                    <div className="flex-1 p-2 text-center border-r border-zinc-800 text-zinc-600">-</div>
                                    <div className="flex-1 p-2 text-center text-red-400 font-bold">i</div>
                                </div>
                                <div className="flex w-full">
                                    <div className="flex-1 p-2 text-center border-r border-zinc-800 text-green-400">9</div>
                                    <div className="flex-1 p-2 text-center text-teal-300 font-bold">v</div>
                                </div>
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-2 text-center italic">v = valid / i = invalid</div>
                        </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg mt-8 text-sm">
                        <h4 className="font-bold text-red-400 mb-2 border-b border-red-500/30 pb-2">The Page Fault Trap</h4>
                        <p className="text-zinc-400">
                            When the CPU attempts to access a page marked <code className="text-red-400 bg-black px-1 rounded">invalid</code>, the MMU triggers a hardware trap to the OS called a <strong>Page Fault</strong>. The OS suspends the process, allocates a free physical frame, issues a disk I/O request to read the missing page from the SSD, updates the page table (setting the bit to <code className="text-teal-300 bg-black px-1 rounded">valid</code>), and then re-executes the exact assembly instruction that caused the trap.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 2: Page Replacement Algos */}
            <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">2. Page Replacement Algorithms</h2>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
                    What happens if a process page faults, but the physical RAM is completely full (no free frames)? The OS must execute a Page Replacement Algorithm to select a <i>victim page</i>, write its contents back to disk, and free its frame for the newly requested page.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* FIFO / Belady's Anomaly */}
                    <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col h-full">
                        <div className="bg-[#161b22] px-4 py-3 border-b border-zinc-800">
                            <h4 className="text-pink-400 font-mono font-bold tracking-widest text-sm">FIFO (First-In, First-Out)</h4>
                        </div>
                        <div className="p-6 text-sm text-zinc-400 space-y-4 flex-1">
                            <p>
                                The simplest algorithm. A FIFO queue tracks all pages in memory. We replace the page at the head of the queue. While easy to implement, its performance is often poor because it may replace heavily utilized pages simply because they were loaded early during initialization.
                            </p>
                            <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded mt-4">
                                <h5 className="font-bold text-orange-400 mb-1">Belady's Anomaly</h5>
                                <p className="text-xs text-orange-200">
                                    Intuitively, giving a process more physical memory frames should decrease its page fault rate. In 1969, Laszlo Belady proved this is false for FIFO. For certain reference strings, adding more frames <strong>increases</strong> the number of page faults!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* LRU */}
                    <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col h-full">
                        <div className="bg-[#161b22] px-4 py-3 border-b border-zinc-800">
                            <h4 className="text-green-400 font-mono font-bold tracking-widest text-sm">LRU (Least Recently Used)</h4>
                        </div>
                        <div className="p-6 text-sm text-zinc-400 space-y-4 flex-1">
                            <p>
                                Uses the recent past as an approximation of the near future. This algorithm associates with each page the time of its last use. When a page must be replaced, LRU chooses the page that has not been used for the longest period of time.
                            </p>
                            <p>
                                LRU is the industry standard. It is part of a class called <em>Stack Algorithms</em>, which can be mathematically proven to never suffer from Belady's Anomaly.
                            </p>
                            <div className="bg-black border border-zinc-800 p-4 rounded mt-4">
                                <h5 className="font-bold text-zinc-300 mb-1 text-xs uppercase tracking-widest">Implementation Cost</h5>
                                <p className="text-xs text-zinc-500">
                                    LRU is extremely expensive to implement purely in software. It requires hardware assistance. Every page table entry requires a hardware "time-of-use" register or an internal hardware doubly-linked list stack.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Thrashing */}
            <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">3. Thrashing & Performance Decay</h2>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
                    If a process does not have "enough" physical frames, it will quickly page-fault. It will replace a page, but since all its pages are in active use, it must immediately fault again to retrieve the replaced page. This high-frequency paging activity is called <strong>thrashing</strong>.
                </p>

                <div className="flex flex-col lg:flex-row gap-8 items-center">
                    <div className="w-full lg:w-1/2 p-6 bg-zinc-900/40 rounded-xl border border-zinc-800">
                        <h4 className="text-xl font-bold text-red-500 mb-2">The Locality Model</h4>
                        <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                            To prevent thrashing, the OS must allocate sufficient frames. How do we determine "sufficient"? We use the Working-Set Model based on the concept of locality. As a process executes, it moves from locality to locality. A locality is a set of pages that are actively used together (e.g., executing an algorithm inside a loop covering an array).
                        </p>
                        <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside bg-black p-4 rounded border border-zinc-800 font-mono">
                            <li>{`$\\Sigma \\text{size}(\\text{locality}) > \\text{Total Memory} \\Rightarrow \\text{Thrashing}$`}</li>
                            <li>{`$\\Sigma \\text{size}(\\text{locality}) < \\text{Total Memory} \\Rightarrow \\text{Safe Execution}$`}</li>
                        </ul>
                    </div>

                    <div className="w-full lg:w-1/2 p-6 bg-blue-500/5 rounded-xl border border-blue-500/20 text-sm text-zinc-400">
                        <h4 className="text-blue-400 font-bold mb-2">System Catastrophe</h4>
                        <p className="mb-4">
                            When thrashing occurs, the CPU utilization drops dramatically because all processes are queued waiting for disk I/O.
                        </p>
                        <p className="font-bold text-red-400 border-l-2 border-red-500 pl-4 bg-red-500/10 py-2">
                            The OS scheduler sees low CPU utilization and incorrectly concludes the system is underloaded. The scheduler responds by initializing MORE processes from the ready queue, which require MORE frames, triggering a cascading total system failure.
                        </p>
                    </div>
                </div>

            </section>

        </div>
    );
};
