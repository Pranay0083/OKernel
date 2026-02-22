import React from 'react';

export const WikiMassStorage = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
      {/* Header Section */}
      <div className="border-b border-zinc-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-mono rounded-full border border-cyan-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          CS 401: MASS-STORAGE STRUCTURE
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
          Disk Architecture & RAID
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed font-light">
          A technical examination of Hard Disk Drive (HDD) internal geometry, seek-time optimization algorithms (SSTF, SCAN, C-SCAN), and RAID data redundancy implementations.
        </p>
      </div>

      {/* Section 1: HDD Geometry */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. Magnetic Disk Geometry</h2>

        <p className="text-lg text-zinc-400 leading-relaxed">
          Traditional magnetic disks provide the bulk of secondary storage. Understanding their physical geometry is crucial mathematically because their mechanical nature makes them the absolute slowest component in an entire computer system.
        </p>

        <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-cyan-400 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Physical Topology</h3>
            <ul className="text-sm text-zinc-400 space-y-4">
              <li><strong className="text-zinc-200">Platters:</strong> The disks themselves, arranged in a stack on a spindle.</li>
              <li><strong className="text-zinc-200">Tracks:</strong> The surface of a platter is logically divided into circular tracks.</li>
              <li><strong className="text-zinc-200">Sectors:</strong> Each track is further subdivided into sectors. A sector is the smallest unit of data that can be read or written (traditionally 512 bytes, natively 4KB today).</li>
              <li><strong className="text-zinc-200">Cylinders:</strong> The set of tracks that are at one arm position make up a cylinder. (e.g., Track 5 on Platter 1 + Track 5 on Platter 2, etc.)</li>
            </ul>
          </div>

          <div className="bg-black border border-zinc-800 p-6 rounded-lg text-sm flex flex-col justify-center">
            <h4 className="font-bold text-red-500 mb-2 border-b border-zinc-800 pb-2">The Performance Bottleneck</h4>
            <p className="text-zinc-400 mb-3">
              When the OS requests data, the disk must physically move the read-write head. The time this mechanical operation takes dictates disk performance:
            </p>
            <ul className="text-zinc-500 space-y-2 list-disc list-inside bg-zinc-900 p-3 rounded font-mono text-xs">
              <li><strong className="text-zinc-300">Seek Time:</strong> Time to move the disk arm to the desired cylinder. (By far the slowest, ~5-15ms).</li>
              <li><strong className="text-zinc-300">Rotational Latency:</strong> Time waiting for the desired sector to rotate under the disk head.</li>
              <li><strong className="text-zinc-300">Transfer Rate:</strong> Time to read the magnetic data into the controller's buffer.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Disk Scheduling */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">2. Disk Scheduling Algorithms</h2>

        <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
          Because seek time dominates disk performance, the OS must schedule disk I/O requests intelligently. If process A requests track 10, process B requests track 90, and process C requests track 11, doing it in order (FCFS) wastes massive amounts of time moving the arm back and forth.
        </p>

        <div className="grid grid-cols-1 gap-6 mt-8">
          {/* SSTF */}
          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-1/4">
              <h4 className="text-xl font-bold text-green-400 font-mono tracking-widest text-center">SSTF</h4>
              <p className="text-xs text-center text-zinc-500 mt-1">Shortest-Seek-Time-First</p>
            </div>
            <div className="w-full md:w-3/4 text-sm text-zinc-400 space-y-2">
              <p>Selects the request with the minimum seek time from the current head position. It chooses the "closest" pending request.</p>
              <p className="text-orange-400 italic">Critical Flaw: It may cause starvation. If a continuous stream of requests arrives for tracks near the current head position, requests for very distant tracks will be deferred indefinitely.</p>
            </div>
          </div>

          {/* SCAN */}
          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 flex flex-col md:flex-row gap-6 items-center border-l-4 border-l-blue-500">
            <div className="w-full md:w-1/4">
              <h4 className="text-xl font-bold text-blue-400 font-mono tracking-widest text-center">SCAN</h4>
              <p className="text-xs text-center text-zinc-500 mt-1">"The Elevator Algorithm"</p>
            </div>
            <div className="w-full md:w-3/4 text-sm text-zinc-400 space-y-2">
              <p>The disk arm starts at one end of the disk and moves toward the other end, servicing requests as it reaches each cylinder. At the other end, the direction of head movement is reversed, and servicing continues.</p>
              <p className="text-blue-300/70">Think of an elevator: it goes all the way up, stopping at requested floors, then goes all the way down. It never changes direction midway.</p>
            </div>
          </div>

          {/* C-SCAN */}
          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 flex flex-col md:flex-row gap-6 items-center border-l-4 border-l-purple-500">
            <div className="w-full md:w-1/4">
              <h4 className="text-xl font-bold text-purple-400 font-mono tracking-widest text-center">C-SCAN</h4>
              <p className="text-xs text-center text-zinc-500 mt-1">Circular SCAN</p>
            </div>
            <div className="w-full md:w-3/4 text-sm text-zinc-400 space-y-2">
              <p>Like SCAN, the head moves from one end of the disk to the other, servicing requests along the way. However, when the head reaches the other end, it immediately returns to the beginning of the disk <strong>without servicing any requests on the return trip</strong>.</p>
              <p className="text-purple-300/70">This mathematically provides a much more uniform wait time. In standard SCAN, after the head reverses at track 0, the items near track 0 are over-served compared to items at track 100.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: RAID */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <h2 className="text-3xl font-bold text-zinc-100">3. RAID Architectures</h2>
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded font-mono text-xs">DATA REDUNDANCY</span>
        </div>

        <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
          Disk drives have steadily dropped in price. This led to RAID (Redundant Arrays of Independent Disks), a variety of disk-organization techniques that manage multiple disk drives as a single logical unit to improve reliability, calculate parity, and increase throughput via data striping.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* RAID 0 */}
          <div className="bg-black border border-zinc-800 p-6 rounded-xl flex flex-col h-full shadow-[0_0_20px_rgba(255,255,255,0.02)]">
            <div className="text-center mb-6">
              <div className="text-4xl font-black text-zinc-200 mb-1 border-b border-zinc-800 pb-2">RAID 0</div>
              <div className="text-xs font-mono text-zinc-500">Block-Level Striping</div>
            </div>
            <div className="flex-1 space-y-4 text-sm text-zinc-400">
              <p>Files are broken down into blocks and spread across multiple disks. Two drives can be read/written simultaneously, effectively doubling performance.</p>
              <p className="text-red-400 border-l-2 border-red-500 pl-2 bg-red-500/10 py-1">Zero Redundancy. If one disk fails, the entire volume is permanently destroyed.</p>
            </div>
          </div>

          {/* RAID 1 */}
          <div className="bg-black border border-zinc-800 p-6 rounded-xl flex flex-col h-full shadow-[0_0_20px_rgba(255,255,255,0.02)]">
            <div className="text-center mb-6">
              <div className="text-4xl font-black text-cyan-400 mb-1 border-b border-cyan-500/20 pb-2">RAID 1</div>
              <div className="text-xs font-mono text-zinc-500">Mirroring</div>
            </div>
            <div className="flex-1 space-y-4 text-sm text-zinc-400">
              <p>An exact bit-for-bit clone of the primary disk is simultaneously written to a secondary disk. Provides absolute data redundancy.</p>
              <p className="text-orange-400 border-l-2 border-orange-500 pl-2 bg-orange-500/10 py-1">Expensive. Halves the total available storage capacity (e.g., two 1TB drives yield only 1TB of usable space).</p>
            </div>
          </div>

          {/* RAID 5 */}
          <div className="bg-black border border-zinc-800 p-6 rounded-xl flex flex-col h-full shadow-[0_0_20px_rgba(255,255,255,0.02)]">
            <div className="text-center mb-6">
              <div className="text-4xl font-black text-green-400 mb-1 border-b border-green-500/20 pb-2">RAID 5</div>
              <div className="text-xs font-mono text-zinc-500">Striping w/ Parity</div>
            </div>
            <div className="flex-1 space-y-4 text-sm text-zinc-400">
              <p>Data is striped across all drives (like RAID 0), but an algorithmic <strong>Parity Bit (using XOR)</strong> is calculated and also distributed across the drives.</p>
              <p className="text-green-300 border-l-2 border-green-500 pl-2 bg-green-500/10 py-1">Requires min 3 drives. If ONE drive fails, the hardware controller uses calculus on the Parity blocks of the remaining drives to algorithmically reconstruct the lost data on the fly.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
