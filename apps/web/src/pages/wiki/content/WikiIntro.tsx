import React from 'react';

export const WikiIntro = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
            {/* Header Section */}
            <div className="border-b border-zinc-800 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-mono rounded-full border border-blue-500/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    CS 401: OPERATING SYSTEMS THEORY
                </div>
                <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
                    Operating System Foundations
                </h1>
                <p className="text-xl text-zinc-400 leading-relaxed font-light">
                    An in-depth, rigorous exploration of computer-system organization, kernel architectures, interrupt-driven execution, and the POSIX system call interface.
                </p>
            </div>

            {/* Section 1: Formal Definition */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. Formal Definition & Objectives</h2>

                <p className="text-lg text-zinc-400 leading-relaxed">
                    An Operating System (OS) is formally defined as a program that acts as an intermediary between a user of a computer and the computer hardware. However, a more precise, industry-standard definition characterizes the OS as the one program running at all times on the computer—usually called the <strong>kernel</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(59,130,246,0.03)]">
                        <h3 className="text-xl font-bold text-blue-400 mb-4 font-mono uppercase tracking-widest">The Resource Allocator</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            A computer system has many resources that may be required to solve a problem: CPU time, memory space, file-storage space, I/O devices, and so on. The OS acts as the manager of these resources.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Facing numerous and possibly conflicting requests for resources, the OS must decide how to allocate them to specific programs and users so that it can operate the computer system efficiently and fairly.
                        </p>
                    </div>

                    <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(168,85,247,0.03)]">
                        <h3 className="text-xl font-bold text-purple-400 mb-4 font-mono uppercase tracking-widest">The Control Program</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            A control program manages the execution of user programs to prevent errors and improper use of the computer. It is entirely concerned with the operation and control of I/O devices.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Furthermore, it provides an abstraction layer (The Extended Machine), hiding the complex, esoteric hardware details of storage controllers, DMA engines, and bus architectures behind a clean, uniform interface (e.g., the File System).
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 2: Hardware Architecture */}
            <section className="space-y-8 pt-8">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">2. Computer-System Organization</h2>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl">
                    A modern general-purpose computer system consists of one or more CPUs and a number of device controllers connected through a common bus that provides access to shared memory.
                </p>

                {/* DOM Based Architecture Diagram */}
                <div className="bg-zinc-950 p-10 rounded-2xl border border-zinc-800 relative my-12 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                    <h4 className="text-center font-bold text-zinc-500 font-mono text-sm tracking-widest mb-10 w-full">VON NEUMANN ARCHITECTURE BLOCK DIAGRAM</h4>

                    <div className="flex flex-col items-center gap-6 relative z-10 w-full max-w-3xl mx-auto">

                        {/* Memory */}
                        <div className="w-full bg-green-500/10 border border-green-500/30 p-6 rounded-lg text-center animate-pulse-slow">
                            <span className="font-bold text-green-400 text-xl tracking-widest">SHARED MEMORY (RAM)</span>
                        </div>

                        {/* System Bus */}
                        <div className="relative w-full h-8 flex items-center justify-center">
                            <div className="absolute w-1 h-8 bg-zinc-700"></div>
                            <div className="absolute w-1 h-8 bg-zinc-700 -translate-x-32"></div>
                            <div className="absolute w-1 h-8 bg-zinc-700 translate-x-32"></div>
                            <div className="absolute w-1 h-8 bg-zinc-700 translate-x-64"></div>
                        </div>

                        <div className="w-[110%] h-4 bg-gradient-to-r from-blue-500/20 via-blue-500/50 to-blue-500/20 border-y border-blue-500/50"></div>
                        <div className="text-[10px] text-blue-400/50 font-mono tracking-[0.5em] mt-1 mb-2">SYSTEM BUS / BACKPLANE</div>

                        <div className="relative w-full h-8 flex items-center justify-center">
                            <div className="absolute w-1 h-8 bg-zinc-700"></div>
                            <div className="absolute w-1 h-8 bg-zinc-700 -translate-x-32"></div>
                            <div className="absolute w-1 h-8 bg-zinc-700 translate-x-32"></div>
                            <div className="absolute w-1 h-8 bg-zinc-700 translate-x-64"></div>
                        </div>

                        {/* Devices */}
                        <div className="flex w-full justify-between gap-4">
                            <div className="flex-1 bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex flex-col items-center justify-center relative">
                                <span className="text-xs text-red-400 font-mono mb-2 border-b border-red-500/20 pb-1 w-full text-center">Registers / Cache</span>
                                <span className="font-bold text-red-300 text-xl">CPU</span>
                            </div>
                            <div className="flex-1 bg-zinc-900 border border-zinc-700 p-4 rounded-lg flex flex-col items-center justify-center">
                                <span className="text-[10px] text-zinc-500 font-mono mb-2 border-b border-zinc-700 pb-1 w-full text-center">USB Controller</span>
                                <span className="font-bold text-zinc-300">Mouse/Keyboard</span>
                            </div>
                            <div className="flex-1 bg-zinc-900 border border-zinc-700 p-4 rounded-lg flex flex-col items-center justify-center">
                                <span className="text-[10px] text-zinc-500 font-mono mb-2 border-b border-zinc-700 pb-1 w-full text-center">Disk Controller</span>
                                <span className="font-bold text-zinc-300">NVMe / HDD</span>
                            </div>
                            <div className="flex-1 bg-zinc-900 border border-zinc-700 p-4 rounded-lg flex flex-col items-center justify-center">
                                <span className="text-[10px] text-zinc-500 font-mono mb-2 border-b border-zinc-700 pb-1 w-full text-center">Graphics Adapter</span>
                                <span className="font-bold text-zinc-300">Monitor</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interrupts */}
                <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800">
                    <h3 className="text-2xl font-bold text-zinc-100 mb-4">Interrupt-Driven Execution</h3>
                    <p className="text-zinc-400 leading-relaxed mb-6">
                        For a computer to operate dynamically, the CPU and device controllers can execute in parallel. To inform the CPU that it has finished its operation, a device controller causes an <strong>interrupt</strong>.
                    </p>
                    <div className="space-y-4 text-sm font-mono text-zinc-300">
                        <div className="p-4 bg-black border-l-4 border-l-orange-500 border border-zinc-800 rounded">
                            <span className="text-orange-400 block mb-1">Hardware Interrupt:</span> Triggered by an external device (e.g., keyboard press, disk DMA transfer complete) sending an electrical signal across the system bus to the CPU.
                        </div>
                        <div className="p-4 bg-black border-l-4 border-l-pink-500 border border-zinc-800 rounded">
                            <span className="text-pink-400 block mb-1">Software Interrupt (Trap / Exception):</span> Triggered by software executing a special instruction (e.g., division by zero, or a deliberate System Call requesting OS privileges).
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Dual Mode & Protection */}
            <section className="space-y-8 pt-8">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">3. Hardware Protection & Dual-Mode</h2>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl">
                    To ensure the proper execution of the operating system, we must distinguish between the execution of OS code and user-defined code. The hardware must provide at least two separate modes of operation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="p-8 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 text-[10rem] font-black text-green-500/5 leading-none">1</div>
                        <h4 className="text-2xl font-bold text-green-400 mb-2">User Mode</h4>
                        <div className="text-xs text-zinc-500 font-mono mb-4">Mode Bit = 1</div>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            When the computer system is executing on behalf of a user application, the system is in user mode.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            <strong>Restriction:</strong> In User Mode, a subset of CPU instructions are explicitly disabled by the silicon. These are known as <em>Privileged Instructions</em>. Examples include:
                        </p>
                        <ul className="list-disc list-inside text-xs text-zinc-500 space-y-1 ml-2 font-mono pb-4">
                            <li>Modifying the Timer</li>
                            <li>Modifying Memory Management Registers (TLB)</li>
                            <li>Directly accessing I/O ports</li>
                            <li>Halt instruction</li>
                        </ul>
                    </div>

                    <div className="p-8 bg-zinc-950 border border-zinc-800 rounded-xl shadow-[0_0_40px_rgba(239,68,68,0.05)] relative overflow-hidden">
                        <div className="absolute right-0 top-0 text-[10rem] font-black text-red-500/5 leading-none">0</div>
                        <h4 className="text-2xl font-bold text-red-500 mb-2">Kernel Mode</h4>
                        <div className="text-xs text-red-500/50 font-mono mb-4">Mode Bit = 0 (Supervisor / System / Privileged Mode)</div>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            When a user application requests a service from the operating system (via a system call), the transition from user to kernel mode must occur to fulfill the request.
                        </p>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                            <strong>Privilege:</strong> The OS kernel executes in Kernel Mode. Here, the CPU is completely unlocked. Every instruction in the instruction set architecture (ISA) is available. The kernel has unrestricted access to all hardware.
                        </p>
                    </div>
                </div>

                {/* Transition Diagram */}
                <div className="mt-8 p-8 bg-zinc-900/40 rounded-xl border border-zinc-800">
                    <h4 className="text-lg font-bold text-zinc-300 mb-6 text-center">State Transition via System Call</h4>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm font-mono text-zinc-400 max-w-4xl mx-auto">
                        <div className="p-4 border border-green-500/30 bg-black rounded w-full md:w-1/3 text-center">
                            Executing User Process<br />
                            <span className="text-green-500/50 mt-2 block text-xs">User Mode (bit = 1)</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-yellow-400 text-xs mb-1">TRAP via syscall()</span>
                            <span>━━▶</span>
                            <span className="text-yellow-400 text-xs mt-1">Set mode bit = 0</span>
                        </div>

                        <div className="p-4 border border-red-500/30 bg-black rounded w-full md:w-1/3 text-center">
                            Execute OS Routine<br />
                            <span className="text-red-500/50 mt-2 block text-xs">Kernel Mode (bit = 0)</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-blue-400 text-xs mb-1">return from trap</span>
                            <span>━━▶</span>
                            <span className="text-blue-400 text-xs mt-1">Set mode bit = 1</span>
                        </div>

                        <div className="p-4 border border-green-500/30 bg-black rounded w-full md:w-1/3 text-center">
                            Resume User Process<br />
                            <span className="text-green-500/50 mt-2 block text-xs">User Mode (bit = 1)</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: System Calls & POSIX */}
            <section className="space-y-8 pt-8 border-t border-zinc-900 mt-12">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">4. System Calls & POSIX API</h2>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
                    System calls provide the interface between a running program and the operating system. They are typically written in C or C++, although some are written in assembly language for tasks requiring direct hardware access.
                </p>

                <p className="text-zinc-500 text-sm mb-6">
                    Programmers rarely interface with raw system calls directly (e.g., triggering software interrupts manually). Instead, they use an Application Programming Interface (API). The most common standard is <strong>POSIX</strong> (Portable Operating System Interface), utilized by Linux, macOS, and UNIX variants.
                </p>

                <div className="grid grid-cols-1 gap-8 mt-8">
                    {/* POSIX Code Example */}
                    <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
                        <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
                            <span>copy_file.c</span>
                            <span>C Programming Language</span>
                        </div>
                        <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed">
                            <pre className="text-zinc-300">
                                <code className="text-zinc-500">{"// A standard POSIX implementation demonstrating API abstractions"}</code><br />
                                <span className="text-pink-400">#include</span> <span className="text-green-300">&lt;fcntl.h&gt;</span><br />
                                <span className="text-pink-400">#include</span> <span className="text-green-300">&lt;unistd.h&gt;</span><br />
                                <span className="text-pink-400">#include</span> <span className="text-green-300">&lt;stdio.h&gt;</span><br />
                                <br />
                                <span className="text-blue-400">int</span> <span className="text-yellow-300">main</span>() {"{"}<br />
                                <span className="text-blue-400 pl-4">int</span> in_fd, out_fd;<br />
                                <span className="text-blue-400 pl-4">char</span> buffer[<span className="text-orange-400">4096</span>];<br />
                                <span className="text-blue-400 pl-4">ssize_t</span> bytes_read;<br />
                                <br />
                                <span className="text-zinc-500 pl-4">{"/* System Call 1: open() traps to Kernel Mode to request file access */"}</span><br />
                                <span className="pl-4">in_fd = <span className="text-yellow-300">open</span>(<span className="text-green-300">"source.txt"</span>, O_RDONLY);</span><br />
                                <span className="text-pink-400 pl-4">if</span> (in_fd == -<span className="text-orange-400">1</span>) <span className="text-pink-400">return</span> <span className="text-orange-400">1</span>;<br />
                                <br />
                                <span className="zinc-500 pl-4">{"/* System Call 2: open() with create flags */"}</span><br />
                                <span className="pl-4">out_fd = <span className="text-yellow-300">open</span>(<span className="text-green-300">"dest.txt"</span>, O_WRONLY | O_CREAT, <span className="text-orange-400">0644</span>);</span><br />
                                <br />
                                <span className="zinc-500 pl-4">{"/* System Calls 3 & 4: read() and write() execute within a loop */"}</span><br />
                                <span className="text-pink-400 pl-4">while</span> ((bytes_read = <span className="text-yellow-300">read</span>(in_fd, buffer, <span className="text-orange-400">4096</span>)) {">"} <span className="text-orange-400">0</span>) {"{"}<br />
                                <span className="pl-8"><span className="text-yellow-300">write</span>(out_fd, buffer, bytes_read);</span><br />
                                <span className="pl-4">{"}"}</span><br />
                                <br />
                                <span className="zinc-500 pl-4">{"/* System Calls 5 & 6: close() releases the file descriptors */"}</span><br />
                                <span className="pl-4"><span className="text-yellow-300">close</span>(in_fd);</span><br />
                                <span className="pl-4"><span className="text-yellow-300">close</span>(out_fd);</span><br />
                                <br />
                                <span className="text-pink-400 pl-4">return</span> <span className="text-orange-400">0</span>;<br />
                                {"}"}
                            </pre>
                        </div>
                        <div className="bg-blue-500/10 p-4 border-t border-zinc-800 text-xs text-blue-300 font-mono">
                            <strong>Note:</strong> Functions like <code>open()</code> are not the system calls themselves. They are wrapper functions provided by the C Standard Library (libc) that load the correct system call number into an internal CPU register, and then execute the <code>trap</code> instruction (e.g., <code>int 0x80</code> or <code>syscall</code>).
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Kernel Architecture */}
            <section className="space-y-8 pt-8 border-t border-zinc-900 mt-12">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">5. Kernel Architecture Modality</h2>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
                    How should the OS Kernel itself be structured? Over the decades, massive engineering debates have occurred leading to three primary classifications of operating system architecture.
                </p>

                <div className="space-y-6">
                    {/* Monolithic */}
                    <div className="p-8 bg-zinc-900/40 rounded-xl border border-zinc-800">
                        <h4 className="text-2xl font-bold text-zinc-200 mb-2">5.1 Monolithic Kernels</h4>
                        <span className="text-xs bg-black text-zinc-500 px-2 py-1 rounded font-mono border border-zinc-800">Examples: Linux, MS-DOS, Early UNIX</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            <div>
                                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                    The entire operating system executes entirely in Kernel Space. File systems, device drivers, IPC mechanisms, memory management, and CPU scheduling are all compiled into one massive binary executable.
                                </p>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    <strong>Advantage:</strong> Supreme performance. Components communicate via direct function calls without incurring context-switch overhead.
                                </p>
                                <p className="text-sm text-zinc-400 leading-relaxed mt-4">
                                    <strong>Disadvantage:</strong> Extreme vulnerability. A single logic bug in a poorly written USB mouse driver will crash the entire system (Kernel Panic / Blue Screen of Death) because it has unrestricted memory access.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Microkernel */}
                    <div className="p-8 bg-zinc-900/40 rounded-xl border border-zinc-800">
                        <h4 className="text-2xl font-bold text-zinc-200 mb-2">5.2 Microkernels</h4>
                        <span className="text-xs bg-black text-zinc-500 px-2 py-1 rounded font-mono border border-zinc-800">Examples: Mach, QNX, MINIX</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            <div>
                                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                                    This structure removes all nonessential components from the kernel and implements them as system and user-level programs that reside in User Space. The kernel is stripped down to merely providing Inter-Process Communication (IPC), basic memory management, and primitive scheduling.
                                </p>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    <strong>Advantage:</strong> Exceptional reliability and security. If a file system module crashes, it crashes in User Space. The Microkernel simply restarts the service without taking down the entire machine.
                                </p>
                                <p className="text-sm text-zinc-400 leading-relaxed mt-4">
                                    <strong>Disadvantage:</strong> Severe performance degradation due to "Message Passing". When a user program opens a file, it must send a message to the microkernel, which forwards it to the file system server in User Space, requiring multiple expensive context switches.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Hybrid */}
                    <div className="p-8 bg-zinc-900/40 rounded-xl border border-zinc-800 border-l-[4px] border-l-blue-500">
                        <h4 className="text-2xl font-bold text-zinc-200 mb-2">5.3 Hybrid Systems</h4>
                        <span className="text-xs bg-black text-zinc-500 px-2 py-1 rounded font-mono border border-zinc-800">Examples: macOS (XNU), Windows NT/11</span>
                        <p className="text-sm text-zinc-400 leading-relaxed mt-6 max-w-3xl">
                            Modern architectures rarely adhere strictly to pure monolithic or pure microkernel designs. MacOS combines the Mach microkernel (for IPC/scheduling) with the BSD monolithic kernel (for POSIX APIs/Networking). Windows NT utilizes a microkernel-like architecture (client/server model) but runs all system services in Kernel Space for performance.
                        </p>
                    </div>
                </div>
            </section>

            {/* Study Questions */}
            <section className="space-y-6 pt-16 border-t border-zinc-900 mt-12">
                <h2 className="text-2xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4 uppercase tracking-widest text-center">Chapter Review & Study Questions</h2>

                <div className="bg-black border border-zinc-800 p-8 rounded-xl space-y-6 text-sm">
                    <div>
                        <strong className="text-blue-400 block mb-1">Q1: Explain why the dual-mode operation of an operating system is essential for system protection. What specific hardware feature enables this?</strong>
                        <p className="text-zinc-500 pl-4 border-l-2 border-zinc-800 mt-2">
                            Dual-mode protects the OS and core hardware from malicious or errant user programs. It relies on a hardware-supported Mode Bit. Privileged instructions (like halting the CPU, direct I/O, or manipulating memory bounds) are physically blocked by the hardware if the Mode Bit = 1 (User mode). The kernel sets it to 0 before executing its own code.
                        </p>
                    </div>

                    <div>
                        <strong className="text-blue-400 block mb-1">Q2: Evaluate the trade-off of the Microkernel architecture regarding system reliability vs performance overhead.</strong>
                        <p className="text-zinc-500 pl-4 border-l-2 border-zinc-800 mt-2">
                            Microkernels maximize reliability by moving services (Device drivers, file systems) into User Space. A driver crash no longer causes a Kernel Panic. However, because user programs and services cannot call each other's functions directly, they must communicate via IPC messaging routed through the tiny kernel. This introduces massive context-switching overhead, drastically reducing throughput compared to Monolithic designs.
                        </p>
                    </div>

                    <div>
                        <strong className="text-blue-400 block mb-1">Q3: Differentiate between a hardware interrupt and a software trap.</strong>
                        <p className="text-zinc-500 pl-4 border-l-2 border-zinc-800 mt-2">
                            A hardware interrupt is asynchronous, triggered by external devices (a hard drive completing a read) asserting a signal on the system bus to immediately grab the CPU's attention. A trap is synchronous, generated explicitly by software executing a specific instruction (e.g., a system call) or deliberately causing an exception (e.g., dividing by zero).
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
};
