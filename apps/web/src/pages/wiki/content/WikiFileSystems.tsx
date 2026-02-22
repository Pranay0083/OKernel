import React from 'react';

export const WikiFileSystems = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
      {/* Header Section */}
      <div className="border-b border-zinc-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-mono rounded-full border border-yellow-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          CS 401: FILE SYSTEM IMPLEMENTATION
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
          File System Architectures
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed font-light">
          A technical exploration of disk allocation methods (Contiguous vs. Linked), the FAT architecture, UNIX Inodes, and the Virtual File System (VFS) abstraction layer.
        </p>
      </div>

      {/* Section 1: Allocation Methods */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. Volume Allocation Methods</h2>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          The direct access nature of disks gives us flexibility in the implementation of files. The main problem is how to allocate space to these files so that disk space is utilized effectively and files can be accessed quickly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(234,179,8,0.03)] flex flex-col h-full">
            <h3 className="text-xl font-bold text-yellow-500 mb-2 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Contiguous Allocation</h3>
            <div className="text-sm text-zinc-400 space-y-4 flex-1">
              <p>
                Requires that each file occupy a set of contiguous blocks on the disk. Disk addresses define a linear ordering.
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs">
                <li><strong>Directory Entry:</strong> Needs only the starting block number and length.</li>
                <li><strong>Pros:</strong> Insanely fast sequential and random access. Minimal disk head movement.</li>
                <li><strong className="text-red-400 bg-red-500/10 px-1 rounded block mt-2">FATAL FLAW:</strong> Severe external fragmentation. Also, how much space do you allocate for a file that is actively growing? If it runs into another file's blocks, the OS must pause the process and copy the ENTIRE file to a new larger contiguous hole.</li>
              </ul>
            </div>
          </div>

          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(234,179,8,0.03)] flex flex-col h-full">
            <h3 className="text-xl font-bold text-yellow-500 mb-2 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Linked Allocation</h3>
            <div className="text-sm text-zinc-400 space-y-4 flex-1">
              <p>
                Solves all fragmentation problems. Each file is a linked list of disk blocks; the blocks may be scattered anywhere on the disk.
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs">
                <li><strong>Structure:</strong> The directory contains a pointer to the first and last block. Each underlying physical block contains a hidden pointer to the next block (e.g., 512 bytes = 508 bytes data + 4 bytes pointer).</li>
                <li><strong>Pros:</strong> No external fragmentation. Files can grow indefinitely.</li>
                <li><strong className="text-red-400 bg-red-500/10 px-1 rounded block mt-2">FATAL FLAW:</strong> Disastrous random access. To reach block 300, the OS must read block 1, then block 2, all the way to 300, incurring massive mechanical seek delays. Furthermore, reliability is awful—if one pointer is corrupted, the rest of the file is lost forever.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: File Allocation Table (FAT) */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <h2 className="text-3xl font-bold text-zinc-100">2. The FAT Architecture (MS-DOS)</h2>
          <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded font-mono text-xs">A LINKED ALLOCATION VARIANT</span>
        </div>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          An important variation of linked allocation is the use of a <strong>File Allocation Table (FAT)</strong>. This method was used by the MS-DOS and OS/2 operating systems.
        </p>

        <div className="flex flex-col lg:flex-row gap-8 items-center bg-zinc-950 p-8 rounded-xl border border-zinc-800">
          {/* Diagram */}
          <div className="w-full lg:w-1/2 flex justify-center text-xs font-mono">
            <div className="flex gap-8">
              {/* Directory Entry */}
              <div>
                <div className="text-center font-bold text-zinc-200 mb-2">Directory</div>
                <div className="border border-zinc-700 bg-black p-4 text-center">
                  <div className="text-zinc-400 mb-2"><code>test.txt</code></div>
                  <div className="text-yellow-400 border-t border-zinc-800 pt-2">Start Block: <span className="font-bold">217</span></div>
                </div>
              </div>

              {/* FAT Table */}
              <div>
                <div className="text-center font-bold text-zinc-200 mb-2">Memory-Resident FAT</div>
                <div className="border border-zinc-700 bg-black overflow-hidden rounded">
                  <div className="flex border-b border-zinc-800"><div className="w-12 text-center bg-zinc-900 text-zinc-500 p-1">0</div><div className="w-16 p-1 text-center text-zinc-600">...</div></div>
                  <div className="flex border-b border-zinc-800 bg-yellow-500/10"><div className="w-12 text-center border-r border-zinc-800 text-yellow-400 p-1 font-bold">217</div><div className="w-16 p-1 text-center text-teal-400 font-bold">618</div></div>
                  <div className="flex border-b border-zinc-800"><div className="w-12 text-center bg-zinc-900 text-zinc-500 p-1">...</div><div className="w-16 p-1 text-center text-zinc-600">...</div></div>
                  <div className="flex border-b border-zinc-800 bg-yellow-500/10"><div className="w-12 text-center border-r border-zinc-800 text-yellow-400 p-1 font-bold">618</div><div className="w-16 p-1 text-center text-teal-400 font-bold">339</div></div>
                  <div className="flex border-b border-zinc-800"><div className="w-12 text-center bg-zinc-900 text-zinc-500 p-1">...</div><div className="w-16 p-1 text-center text-zinc-600">...</div></div>
                  <div className="flex bg-yellow-500/10"><div className="w-12 text-center border-r border-zinc-800 text-yellow-400 p-1 font-bold">339</div><div className="w-16 p-1 text-center text-red-500 font-bold">EOF</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Explanations */}
          <div className="w-full lg:w-1/2 space-y-4">
            <p className="text-sm text-zinc-400 mb-4">
              Instead of placing the linked-list pointers <em>inside</em> the underlying disk blocks, a section of disk at the beginning of each volume is set aside to contain a master table. The table has one entry for each disk block and is indexed by block number. Let's trace `test.txt`.
            </p>
            <ol className="text-xs text-zinc-400 space-y-3 list-decimal list-outside pl-4">
              <li>The OS reads the directory entry and sees `test.txt` starts at block 217.</li>
              <li>The OS looks at FAT index [217]. The value there is 618. This means the next block in the file is block 618.</li>
              <li>The OS looks at FAT index [618]. The value there is 339.</li>
              <li>The OS looks at FAT index [339]. The value there is EOF (End of File).</li>
            </ol>
            <div className="bg-black border border-zinc-800 p-3 rounded mt-4">
              <strong className="text-yellow-500 text-xs uppercase tracking-widest block mb-1">Crucial Performance Upgrade</strong>
              <p className="text-zinc-500 text-xs">
                The OS can load this entire FAT table into RAM during boot. Now, random access is blazing fast! If we want block 10 of a file, we instantly trace the pointer chain in RAM in microseconds, determine the exact physical block on the hard drive, and calculate the shortest seek path to issue <em>exactly one</em> mechanical disk read.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: UNIX Inodes */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <h2 className="text-3xl font-bold text-zinc-100">3. Indexed Allocation (UNIX Inodes)</h2>
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded font-mono text-xs">UFS / EXT4</span>
        </div>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          FAT limits the file size (FAT32 max file size is 4GB) due to the pointer architecture. Modern UNIX systems (UFS, ext4) use an alternative called Indexed Allocation. Each file has its own index block, called the <strong>inode (index node)</strong>.
        </p>

        <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col h-full">
          <div className="bg-[#161b22] px-4 py-3 border-b border-zinc-800">
            <h4 className="text-blue-400 font-mono font-bold tracking-widest text-sm">The Multi-Level Inode (15 Pointers)</h4>
          </div>
          <div className="p-6 text-sm text-zinc-400 space-y-4 flex-1">
            <p>
              A UNIX inode contains 15 pointers to track the file's data blocks. But instead of just an array, it uses a brilliant tiered architecture to support both extremely small and massively large files with zero overhead.
            </p>
            <ul className="space-y-2 mt-4 font-mono text-xs">
              <li><strong className="text-green-400 block mb-1">Pointers 1-12 (Direct Blocks):</strong> Point directly to the first 12 physical blocks of the file. For small files, this is all you need. Instant access.</li>
              <li><strong className="text-yellow-400 block mb-1">Pointer 13 (Single Indirect Block):</strong> Points to a physical disk block that contains NOT data, but an array of pointers to data blocks. If a block is 4KB, and a pointer is 4 bytes, this block holds $1024$ additional pointers!</li>
              <li><strong className="text-orange-400 block mb-1">Pointer 14 (Double Indirect Block):</strong> Points to a block, which contains pointers to Single Indirect blocks, which point to data. Provides access to $1024 \times 1024$ blocks.</li>
              <li><strong className="text-red-400 block mb-1">Pointer 15 (Triple Indirect Block):</strong> Points to a block, which contains pointers to Double Indirect blocks. Supports TBs of data for a single file.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: VFS */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900 border-dashed">
        <h2 className="text-2xl font-bold text-zinc-300">4. Virtual File Systems (VFS)</h2>

        <p className="text-sm text-zinc-400 leading-relaxed max-w-4xl border-l-2 border-zinc-700 pl-4 bg-zinc-900/40 p-4 rounded-r">
          How does an OS support FAT, NTFS, ext4, and NFS simultaneously? The OS implements a Virtual File System layer. It provides an Object-Oriented generic API (e.g., <code>open()</code>, <code>read()</code>, <code>write()</code>). Underneath, specific modules implement these generic VFS calls into the exact binary layout of FAT or NTFS. The API abstraction ensures user programs never have to care what disk format they are writing to.
        </p>
      </section>

    </div>
  );
};
