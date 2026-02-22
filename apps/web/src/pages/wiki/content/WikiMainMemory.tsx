import React from 'react';

export const WikiMainMemory = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
      {/* Header Section */}
      <div className="border-b border-zinc-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-mono rounded-full border border-indigo-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          CS 401: MEMORY MANAGEMENT
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
          Main Memory Hardware
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed font-light">
          An architectural analysis of contiguous allocation, internal vs. external fragmentation, Paging hardware (MMU), and Translation Look-aside Buffers (TLB).
        </p>
      </div>

      {/* Section 1: Contiguous Allocation & Fragmentation */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. Contiguous Allocation & Fragmentation</h2>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          Historically, main memory must accommodate both the operating system and the various user processes. In early systems, each process was contained in a single contiguous section of memory.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(234,179,8,0.03)] flex flex-col h-full">
            <h3 className="text-xl font-bold text-orange-400 mb-2 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">External Fragmentation</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              As processes are loaded and removed from memory, the free memory space is broken into little pieces. <strong>External fragmentation</strong> exists when there is enough total memory space to satisfy a request, but the available spaces are not contiguous; storage is fragmented into a large number of small holes.
            </p>
            <div className="mt-auto p-4 bg-black border border-orange-500/30 rounded text-xs text-zinc-500">
              <strong>Note:</strong> Statistical analysis of first-fit allocation reveals the "50-percent rule": given $N$ allocated blocks, another $0.5 N$ blocks will be lost to fragmentation. That is, $1/3$ of memory may be unusable!
            </div>
          </div>

          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(234,179,8,0.03)] flex flex-col h-full">
            <h3 className="text-xl font-bold text-yellow-500 mb-2 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Internal Fragmentation</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              Memory is generally allocated in fixed-size blocks (e.g., 4KB blocks). If a process requires exactly 4097 bytes ({`$4\\text{KB} + 1\\text{byte}$`}), the OS must allocate two entire 4KB blocks ({`$8192\\text{bytes}$`}). The difference between these two numbers is <strong>Internal Fragmentation</strong>—memory that is internal to a partition but is not being used.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Paging Architecture */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <h2 className="text-3xl font-bold text-zinc-100">2. Paging Hardware (The MMU)</h2>
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded font-mono text-xs">HARDWARE ARCHITECTURE</span>
        </div>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          Paging is a memory-management scheme that permits the physical address space of a process to be noncontiguous. This completely solves the problem of external fragmentation.
        </p>

        <div className="flex flex-col lg:flex-row gap-8 items-center bg-zinc-950 p-8 rounded-xl border border-zinc-800">
          {/* Logic Diagram */}
          <div className="w-full lg:w-1/2 flex flex-col font-mono text-sm">
            <div className="flex gap-4 items-center">
              <div className="w-24 text-center">
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 p-2 rounded mb-1">CPU</div>
                <div className="text-xs text-zinc-500">Logical Addr</div>
              </div>
              <div className="text-zinc-500">→</div>
              <div className="flex-1 border border-zinc-700 bg-black rounded p-2 flex">
                <div className="w-1/2 border-r border-zinc-700 text-center text-teal-400">p</div>
                <div className="w-1/2 text-center text-yellow-400">d</div>
              </div>
            </div>

            <div className="flex ml-[8.5rem] my-2">
              <div className="w-1/2 border-l border-b border-zinc-700 h-16 rounded-bl flex flex-col justify-end text-zinc-500 pl-2 pb-1 text-xs">Page Table Look-up</div>
            </div>

            <div className="flex gap-4 items-center ml-12">
              <div className="bg-zinc-900 border border-zinc-700 p-4 rounded text-center w-32 shadow-xl relative z-10">
                <div className="text-xs text-zinc-500 mb-2 border-b border-zinc-800 pb-1">Page Table</div>
                <div className="flex justify-between text-xs my-1"><span className="text-teal-400">0</span> <span className="text-red-400">2</span></div>
                <div className="flex justify-between text-xs my-1 bg-zinc-800"><span className="text-teal-400">p</span> <span className="text-red-400">f</span></div>
                <div className="flex justify-between text-xs my-1"><span className="text-teal-400">...</span> <span className="text-red-400">...</span></div>
              </div>
              <div className="text-zinc-500">→</div>
              <div className="flex-1 border border-zinc-700 bg-black rounded p-2 flex">
                <div className="w-1/2 border-r border-zinc-700 text-center text-red-400">f</div>
                <div className="w-1/2 text-center text-yellow-400">d</div>
              </div>
              <div className="text-zinc-500">→</div>
              <div className="w-24 text-center">
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-2 rounded mb-1">RAM</div>
                <div className="text-xs text-zinc-500">Physical Addr</div>
              </div>
            </div>
          </div>

          {/* Explanations */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="bg-black/50 p-4 rounded border border-zinc-800">
              <strong className="text-teal-400 font-mono text-base block mb-1">p: Page Number</strong>
              <p className="text-zinc-400 text-sm">Every address generated by the CPU is divided into two parts. The page number is used as an index into a page table.</p>
            </div>
            <div className="bg-black/50 p-4 rounded border border-zinc-800">
              <strong className="text-yellow-400 font-mono text-base block mb-1">d: Page Offset</strong>
              <p className="text-zinc-400 text-sm">The offset is the byte location within the physical frame itself. This value is mathematically <strong>unaltered</strong> by the MMU unit. If page size is {`$4\\text{KB}$`}, the offset requires exactly {`$12\\text{bits}$`} ({`$2^{12} = 4096$`}).</p>
            </div>
            <div className="bg-black/50 p-4 rounded border border-zinc-800">
              <strong className="text-red-400 font-mono text-base block mb-1">f: Frame Number</strong>
              <p className="text-zinc-400 text-sm">The base physical address of the frame in RAM, returned by the page table mapping.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: TLB & Effective Access Time */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4 uppercase tracking-widest text-center">3. Translation Look-aside Buffers (TLB)</h2>

        <div className="bg-zinc-900/40 border border-zinc-800 p-10 rounded-xl max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <p className="text-zinc-300 leading-relaxed mb-8 text-center text-sm max-w-2xl mx-auto relative z-10">
            Because the Page Table is stored in Main Memory, translating a logical address to a physical address using standard paging requires <strong>two memory accesses</strong> (one for the page table, one for the actual byte). This would halve system performance. The solution is a specialized hardware cache called the TLB.
          </p>

          <h3 className="text-2xl font-bold text-indigo-400 mb-6 relative z-10 text-center border-b border-indigo-500/30 pb-4 inline-block mx-auto left-1/2 -translate-x-1/2">Effective Access Time (EAT)</h3>

          <div className="bg-black/50 p-8 border border-zinc-800 rounded-xl flex flex-col items-center justify-center font-serif text-2xl italic relative z-10 space-y-4">
            <div className="text-zinc-100">
              Effective Access Time = <span className="text-teal-400 font-bold">&alpha;</span>(TLB_hit) + <span className="text-red-400 font-bold">(1 - &alpha;)</span>(TLB_miss)
            </div>
          </div>

          <ul className="text-sm text-zinc-400 space-y-4 mt-8 max-w-2xl mx-auto list-disc list-inside relative z-10">
            <li><strong><span className="text-teal-400">&alpha; (Hit Ratio)</span></strong>: The percentage of times the CPU finds the page number in the TLB cache.</li>
            <li><strong><span className="text-red-400">(1 - &alpha;)</span></strong>: The Miss Ratio.</li>
            <li><strong>TLB_hit time</strong>: The time to search the TLB (e.g., {`$~1\\text{ns}$`}) + the time to access Main Memory (e.g., {`$100\\text{ns}$`}).</li>
            <li><strong>TLB_miss time</strong>: The time to search the TLB + time to access Page Table in Memory + time to access the actual byte in memory (e.g., {`$1\\text{ns} + 100\\text{ns} + 100\\text{ns} = 201\\text{ns}$`}).</li>
          </ul>

          <div className="bg-indigo-500/10 border border-indigo-500/30 p-6 rounded-lg mt-8 text-sm font-mono text-indigo-300 relative z-10 shadow-inner">
            <strong>Mathematical Proof:</strong> Assume memory access is {`$100\\text{ns}$`}, TLB lookup is {`$< 1\\text{ns}$`} (ignorable), and Hit Ratio is {`$80\\%$`}.<br /><br />
            <span className="text-zinc-300">
              EAT = {`$0.80 \\times (100\\text{ns}) + 0.20 \\times (200\\text{ns})$`}<br />
              EAT = {`$80\\text{ns} + 40\\text{ns}$`}<br />
              EAT = {`$120\\text{ns}$`}
            </span><br /><br />
            <span className="text-zinc-400 italic">With an 80% hit ratio, the system suffers only a 20% slowdown compared to unpaged memory, instead of a 100% slowdown. Modern TLBs reach 99% hit ratios.</span>
          </div>
        </div>
      </section>

    </div>
  );
};
