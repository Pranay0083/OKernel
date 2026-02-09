
import React from 'react';

export const WikiMemory = () => {
    return (
        <div className="max-w-4xl space-y-12 animate-fade-in">
            {/* Header */}
            <div className="border-b border-zinc-800 pb-8">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-mono rounded-full border border-blue-500/20 mb-4">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    MEMORY MANAGEMENT
                </div>
                <h1 className="text-4xl font-bold text-white mb-6">Virtual Memory & Paging</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    Processes believe they have access to a vast, contiguous block of memory. 
                    In reality, their data is scattered across physical RAM in small chunks called frames.
                </p>
            </div>

            {/* Virtual Memory Intro */}
            <section id="virtual-memory" className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">The Illusion of Contiguity</h2>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        <strong>Virtual Memory</strong> decouples the user's logical view of memory from the actual physical memory. 
                        This allows programs to be larger than physical RAM and prevents processes from stomping on each other's data.
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 border border-zinc-700 bg-zinc-800/50 rounded flex flex-col items-center">
                            <span className="text-xs font-mono text-zinc-500 mb-2">CPU sees</span>
                            <span className="text-white font-bold">Logical Address</span>
                        </div>
                        <div className="flex items-center justify-center text-zinc-500">
                            →
                            <div className="mx-2 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs">MMU</div>
                            →
                        </div>
                        <div className="p-4 border border-green-900/50 bg-green-900/10 rounded flex flex-col items-center">
                            <span className="text-xs font-mono text-green-500 mb-2">RAM sees</span>
                            <span className="text-green-100 font-bold">Physical Address</span>
                        </div>
                    </div>
                </div>
            </section>

             {/* Paging */}
             <section id="paging" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Paging</h2>
                    <span className="text-xs font-mono border border-zinc-700 bg-zinc-900 rounded px-2 py-1 text-zinc-500">Memory Scheme</span>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        Physical memory is broken into fixed-sized blocks called <strong>Frames</strong>. 
                        Logical memory is broken into blocks of the same size called <strong>Pages</strong>.
                    </p>

                    {/* Diagram */}
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center p-6 bg-black/40 rounded border border-zinc-800/50">
                        {/* Logical Memory */}
                        <div className="w-32">
                            <div className="text-center text-xs text-zinc-500 mb-2">Process A (Logical)</div>
                            <div className="border border-zinc-700 rounded overflow-hidden text-xs font-mono text-center">
                                <div className="bg-blue-900/20 py-2 border-b border-zinc-800">Page 0</div>
                                <div className="bg-blue-900/20 py-2 border-b border-zinc-800">Page 1</div>
                                <div className="bg-blue-900/20 py-2 border-b border-zinc-800">Page 2</div>
                                <div className="bg-blue-900/20 py-2">Page 3</div>
                            </div>
                        </div>

                         {/* Page Table */}
                         <div className="w-24">
                            <div className="text-center text-xs text-zinc-500 mb-2">Page Table</div>
                            <div className="border border-zinc-700 rounded overflow-hidden text-[10px] font-mono">
                                <div className="flex justify-between px-2 py-1 bg-zinc-800 border-b border-zinc-700"><span>0</span> <span className="text-green-400">→ 5</span></div>
                                <div className="flex justify-between px-2 py-1 bg-zinc-800 border-b border-zinc-700"><span>1</span> <span className="text-green-400">→ 1</span></div>
                                <div className="flex justify-between px-2 py-1 bg-zinc-800 border-b border-zinc-700"><span>2</span> <span className="text-green-400">→ 8</span></div>
                                <div className="flex justify-between px-2 py-1 bg-zinc-800"><span>3</span> <span className="text-green-400">→ 2</span></div>
                            </div>
                        </div>

                        {/* Physical Memory */}
                        <div className="w-32">
                            <div className="text-center text-xs text-zinc-500 mb-2">Physical RAM</div>
                            <div className="border border-green-900/30 rounded overflow-hidden text-xs font-mono text-center relative h-40 bg-green-900/5">
                                {/* Frames scattered */}
                                <div className="absolute top-4 left-0 right-0 bg-blue-500/20 h-6 border-y border-blue-500/30 flex items-center justify-center text-[10px] text-blue-300">Frame 1 (Pg 1)</div>
                                <div className="absolute top-12 left-0 right-0 bg-blue-500/20 h-6 border-y border-blue-500/30 flex items-center justify-center text-[10px] text-blue-300">Frame 2 (Pg 3)</div>
                                <div className="absolute top-24 left-0 right-0 bg-blue-500/20 h-6 border-y border-blue-500/30 flex items-center justify-center text-[10px] text-blue-300">Frame 5 (Pg 0)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* TLB */}
             <section id="tlb" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Translation Lookaside Buffer (TLB)</h2>
                    <span className="text-xs font-mono border border-orange-900 bg-orange-900/10 rounded px-2 py-1 text-orange-400">Hardware Cache</span>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-6">
                        Looking up the Page Table in memory for every instruction is slow (it doubles memory access time). 
                        The <strong>TLB</strong> is a small, ultra-fast hardware cache inside the MMU that stores recent translations.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-900/10 border border-green-900/30 p-4 rounded">
                            <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-2">
                                TLB Hit
                            </div>
                            <p className="text-xs text-zinc-400">
                                The translation is found in the TLB. No need to access the main memory page table. Extremely fast.
                            </p>
                        </div>
                        <div className="bg-red-900/10 border border-red-900/30 p-4 rounded">
                             <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                                TLB Miss
                            </div>
                            <p className="text-xs text-zinc-400">
                                The translation is NOT in the TLB. The MMU must consult the page table in RAM (slow), then update the TLB.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
