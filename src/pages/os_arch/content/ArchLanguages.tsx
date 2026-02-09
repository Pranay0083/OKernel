
import React from 'react';

export const ArchLanguages = () => {
    return (
        <div className="max-w-4xl space-y-12 animate-fade-in">
             {/* Header */}
            <div className="border-b border-zinc-800 pb-8">
                 <div className="text-xs font-mono text-zinc-500 mb-2">/usr/share/doc/languages</div>
                <h1 className="text-4xl font-bold text-white mb-6">The Language of Kernels</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    For 50 years, C has been the undisputed king of kernel development. But a challenger has finally arrived.
                </p>
            </div>

            {/* C */}
            <section id="c" className="space-y-6">
                <h2 className="text-2xl font-bold text-white">C: The Lingua Franca</h2>
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-4">
                        Developed by Dennis Ritchie specifically to write UNIX, C allows "portable assembly". 
                        It gives you direct access to memory addresses and hardware registers with minimal abstraction.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-4 border border-zinc-800 bg-black/40 rounded font-mono text-xs">
                            <div className="text-zinc-500 mb-2">// Direct pointer manipulation</div>
                            <div className="text-purple-400">volatile unsigned int *ptr = (unsigned int*) 0xFFFF0000;</div>
                            <div className="text-purple-400">*ptr = 1; <span className="text-zinc-500">// Turn on LED</span></div>
                        </div>
                        <div className="p-4 border border-zinc-800 bg-zinc-900 rounded">
                            <h3 className="text-white font-bold mb-2 text-sm">Why it dominates</h3>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Zero runtime overhead.</li>
                                <li>Manual memory management (malloc/free).</li>
                                <li>Every OS architecture has a C compiler.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

             {/* Rust */}
             <section id="rust" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Rust: The Modern Challenger</h2>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-xs border border-orange-500/20 font-mono">Linux 6.1+</span>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <p className="text-zinc-300 mb-4">
                        Rust brings <strong>Memory Safety</strong> without garbage collection. It uses a strict ownership model that prevents common kernel bugs 
                        like null pointer dereferences, buffer overflows, and data races at compile time.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-4 border border-zinc-800 bg-black/40 rounded font-mono text-xs">
                            <div className="text-zinc-500 mb-2">// Ownership & Borrowing</div>
                            <div className="text-orange-400">fn process_data(data: &mut Data) &#123;</div>
                            <div className="text-orange-400 pl-4">...</div>
                            <div className="text-orange-400">&#125; <span className="text-zinc-500">// Compiler guarantees exclusive access</span></div>
                        </div>
                        <div className="p-4 border border-zinc-800 bg-zinc-900 rounded">
                            <h3 className="text-white font-bold mb-2 text-sm">The Shift</h3>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                In 2022, Rust became the second official language of the Linux Kernel. 
                                Projects like <strong>Redox OS</strong> are writing full microkernel OSs entirely in Rust.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
