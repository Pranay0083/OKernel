import React from 'react';

export const WikiIO = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
      {/* Header Section */}
      <div className="border-b border-zinc-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-mono rounded-full border border-violet-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          CS 401: I/O MANAGEMENT
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
          I/O Hardware & DMA
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed font-light">
          The control of computer peripherals. Understanding the performance tradeoffs between Polling vs. Interrupt-Driven I/O, and the absolute necessity of Direct Memory Access (DMA) for bulk transfers.
        </p>
      </div>

      {/* Section 1: Polling vs Interrupts */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. Device Communication Hooks</h2>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          How does the processor interact with a device? The basic hardware mechanism is a set of registers (Data-in, Data-out, Status, Control) mapped into the CPU's memory space.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(139,92,246,0.03)] flex flex-col h-full">
            <h3 className="text-xl font-bold text-violet-400 mb-2 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Method 1: Polling</h3>
            <div className="text-sm text-zinc-400 space-y-4 flex-1">
              <p>
                The host CPU continuously reads the device's status register over and over again in a tight <code>while</code> loop until the `busy` bit is cleared.
              </p>
              <div className="bg-black p-3 rounded border border-zinc-800 font-mono text-xs text-zinc-500">
                <span className="text-pink-400">while</span> (device_status == <span className="text-orange-400">BUSY</span>);<br />
                <span className="text-zinc-600">/* CPU is burned doing nothing */</span><br />
                <span className="text-blue-400">write_register</span>(data);
              </div>
              <p>
                <strong className="text-zinc-200 block mb-1">When to use it:</strong> Only when the device is insanely fast. If the controller is ready in 2 CPU cycles, polling is faster than the overhead of setting up an interrupt.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(139,92,246,0.03)] flex flex-col h-full">
            <h3 className="text-xl font-bold text-fuchsia-400 mb-2 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Method 2: Interrupts</h3>
            <div className="text-sm text-zinc-400 space-y-4 flex-1">
              <p>
                The hardware controller raises a physical electrical signal on the CPU's <strong>Interrupt Request Line (IRQ)</strong>. The CPU immediately stops what it's doing, saves its state, and jumps to an Interrupt Service Routine (ISR) to handle the device.
              </p>
              <p>
                <strong className="text-zinc-200 block mb-1">When to use it:</strong> For vast majority of I/O. Keyboard presses, disk responses, network packets. It allows the CPU to execute other processes asynchronously while waiting for the slow mechanical/network I/O to finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Direct Memory Access (DMA) */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <h2 className="text-3xl font-bold text-zinc-100">2. Direct Memory Access (DMA)</h2>
          <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 rounded font-mono text-xs">HARDWARE ACCELERATION</span>
        </div>

        <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
          For devices that do large bulk transfers, such as disk drives, Programmed I/O (where the CPU executes a `load` and `store` instruction for *every single byte*) is catastrophically inefficient. The solution is to add a dedicated, special-purpose processor to the motherboard called a DMA Controller.
        </p>

        <div className="bg-zinc-950 p-8 rounded-xl border border-zinc-800 flex flex-col items-center">

          {/* Architectural Diagram */}
          <div className="w-full max-w-3xl mb-8">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <div className="w-32 text-center bg-blue-500/10 border border-blue-500/30 text-blue-400 p-4 rounded shadow-lg shadow-blue-500/5">CPU</div>
              <div className="flex-1 border-b-2 border-dashed border-zinc-700 mx-4 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-zinc-500">System Bus</div>
              </div>
              <div className="w-32 text-center bg-violet-500/10 border border-violet-500/30 text-violet-400 p-4 rounded shadow-lg shadow-violet-500/5">DMA Controller</div>
            </div>

            <div className="flex justify-between items-center">
              <div className="w-32 h-16 border-r-2 border-dashed border-zinc-700 ml-16"></div>
              <div className="w-32 h-16 border-l-2 border-dashed border-zinc-700 mr-16"></div>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <div className="w-32 text-center bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded shadow-lg shadow-green-500/5">Main Memory</div>
              <div className="flex-1 border-b-2 border-dashed border-zinc-700 mx-4 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-zinc-500 font-bold bg-black px-2">Direct Bulk Transfer</div>
              </div>
              <div className="w-32 text-center bg-orange-500/10 border border-orange-500/30 text-orange-400 p-4 rounded shadow-lg shadow-orange-500/5">Disk Drive</div>
            </div>
          </div>

          {/* Step by Step Protocol */}
          <div className="w-full bg-black border border-zinc-800 rounded-lg p-6">
            <h4 className="font-bold text-violet-400 mb-4 border-b border-zinc-800 pb-2">The Six-Step DMA Protocol</h4>
            <ol className="text-sm text-zinc-400 space-y-3 list-decimal list-outside pl-4 max-w-3xl mx-auto">
              <li><strong className="text-zinc-200">CPU setup:</strong> The CPU writes three values to the DMA's registers: Source Address (Disk), Destination Address (RAM base address), and Byte Count (e.g., 4096 bytes).</li>
              <li><strong className="text-zinc-200">CPU delegates:</strong> The CPU issues a "Start" command to the DMA and immediately goes to do other work, placing the requesting process in the Waiting State.</li>
              <li><strong className="text-yellow-400">DMA takes over:</strong> The DMA controller assumes mastery of the system bus.</li>
              <li><strong className="text-yellow-400">Direct transfer:</strong> The DMA commands the Disk controller to read data and send it directly over the bus into Main Memory, entirely bypassing the CPU cache.</li>
              <li><strong className="text-yellow-400">Decrement:</strong> The DMA decrements its byte count register until it hits 0.</li>
              <li><strong className="text-green-400">Final Interrupt:</strong> The DMA controller raises exactly ONE interrupt to the CPU to signal "transfer complete". The CPU wakes up the requesting process.</li>
            </ol>
          </div>

        </div>

        <div className="p-4 bg-violet-500/5 border-l-4 border-l-violet-500 border border-violet-500/20 rounded mt-8 text-sm text-zinc-400 flex gap-4 items-center max-w-4xl">
          <div className="text-4xl">⚡</div>
          <div>
            <strong className="text-violet-400 block mb-1">Cycle Stealing vs Burst Mode</strong>
            Without DMA, a 4KB disk read requires 4096 interrupts (one for every byte!). With DMA, it requires exactly 1 interrupt. When the DMA controller monopolizes the bus to transfer the entire block at once, it's called <em>Burst Mode</em>. If it transfers one word, yields the bus to the CPU, then transfers another, it's called <em>Cycle Stealing</em>.
          </div>
        </div>

      </section>

    </div>
  );
};
