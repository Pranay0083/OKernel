
import React from 'react';

export const ArchIntro = () => {
    return (
        <div className="max-w-4xl space-y-12 animate-fade-in">
            {/* Header */}
            <div className="border-b border-zinc-800 pb-8">
                <div className="text-xs font-mono text-zinc-500 mb-2">/usr/share/doc/architecture</div>
                <h1 className="text-4xl font-bold text-white mb-6">Kernel Architectures</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    The kernel is the core of the operating system, but not all kernels are built the same. 
                    The architectural design dictates performance, security, and stability.
                </p>
            </div>

            {/* Monolithic */}
            <section id="monolithic" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Monolithic Kernels</h2>
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-4">
                        In a monolithic architecture, the entire operating system runs as a single, large program in kernel mode. 
                        This includes the scheduler, memory management, file systems, and device drivers.
                    </p>
                    <p className="text-zinc-400 text-sm mb-6">
                        <strong>Examples:</strong> Linux, MS-DOS, Unix (BSD).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border border-zinc-800 bg-zinc-900 rounded">
                            <h3 className="text-white font-bold mb-2 text-sm">Advantages</h3>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>High performance (direct function calls between components).</li>
                                <li>Mature ecosystem and tooling.</li>
                            </ul>
                        </div>
                        <div className="p-4 border border-zinc-800 bg-zinc-900 rounded">
                            <h3 className="text-white font-bold mb-2 text-sm">Disadvantages</h3>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Large codebase makes it buggy and hard to maintain.</li>
                                <li>A crash in a driver (e.g., GPU driver) crashes the whole system.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Microkernel */}
            <section id="microkernel" className="space-y-6 pt-8 border-t border-zinc-800">
                <h2 className="text-2xl font-bold text-white">Microkernels</h2>
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-4">
                        Microkernels aim to minimize the code running in privileged mode. They implement only basic mechanisms: 
                        inter-process communication (IPC), basic scheduling, and low-level memory handling. 
                        Drivers, file systems, and protocol stacks run as separate user-space processes.
                    </p>
                    <p className="text-zinc-400 text-sm mb-6">
                        <strong>Examples:</strong> Mach (basis for macOS), L4, Minix, QNX (Blackberry).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 border border-zinc-800 bg-zinc-900 rounded">
                            <h3 className="text-white font-bold mb-2 text-sm">Advantages</h3>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>High stability: A driver crash just restarts that service.</li>
                                <li>Secure: Smaller attack surface in kernel mode.</li>
                            </ul>
                        </div>
                        <div className="p-4 border border-zinc-800 bg-zinc-900 rounded">
                            <h3 className="text-white font-bold mb-2 text-sm">Disadvantages</h3>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Performance overhead due to heavy context switching and IPC.</li>
                                <li>Complex system architecture.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hybrid */}
            <section id="hybrid" className="space-y-6 pt-8 border-t border-zinc-800">
                <h2 className="text-2xl font-bold text-white">Hybrid Kernels</h2>
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-4">
                        Hybrid kernels attempt to combine the best of both worlds. They have a structure similar to microkernels 
                        but run some "user-space" services (like file systems or graphics stacks) in kernel space for performance reasons.
                    </p>
                    <p className="text-zinc-400 text-sm mb-6">
                        <strong>Examples:</strong> Windows NT (Windows 10/11), XNU (macOS/iOS).
                    </p>

                    <div className="p-4 border border-zinc-800 bg-zinc-900 rounded">
                        <h3 className="text-white font-bold mb-2 text-sm">The Reality</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Most modern commercial OSs are Hybrid. Windows NT was designed as a microkernel initially, 
                            but graphics and other subsystems were moved into kernel space in NT 4.0 to improve graphics performance, 
                            essentially making it a hybrid design.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};
