
import React from 'react';

export const ArchPhilosophies = () => {
    return (
        <div className="max-w-4xl space-y-12 animate-fade-in">
            {/* Header */}
            <div className="border-b border-zinc-800 pb-8">
                 <div className="text-xs font-mono text-zinc-500 mb-2">/usr/share/doc/philosophy</div>
                <h1 className="text-4xl font-bold text-white mb-6">OS Design Philosophies</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    Operating Systems are not just code; they are built upon specific philosophies that dictate how users and developers interact with them.
                </p>
            </div>

            {/* UNIX */}
            <section id="unix" className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">The UNIX Philosophy</h2>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-green-400 mb-4">"Everything is a File"</h3>
                    <p className="text-zinc-300 mb-6">
                        In UNIX and Linux, almost every resource is represented as a file in the filesystem. 
                        Documents, directories, hard drives, modems, keyboards, printers, and even inter-process communications are streams of bytes.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-zinc-800 bg-black/40 rounded font-mono text-xs">
                            <div className="text-zinc-500 mb-2"># Read from keyboard, write to screen</div>
                            <div className="text-green-300">cat /dev/tty</div>
                            <br/>
                            <div className="text-zinc-500 mb-2"># Read from hard drive</div>
                            <div className="text-green-300">cat /dev/sda1 {'>'} backup.img</div>
                        </div>
                        <div className="p-4 border border-zinc-800 bg-zinc-900 rounded">
                            <h4 className="text-white font-bold mb-2 text-sm">Key Principles</h4>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Write programs that do one thing and do it well.</li>
                                <li>Write programs to work together (pipes).</li>
                                <li>Write programs to handle text streams, because that is a universal interface.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

             {/* Windows */}
             <section id="windows" className="space-y-6 pt-8 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">The Windows NT Philosophy</h2>
                </div>
                
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-400 mb-4">"Everything is an Object"</h3>
                    <p className="text-zinc-300 mb-6">
                        Windows NT treats resources as Objects managed by the Object Manager. 
                        Processes, threads, files, semaphores, and timers are all kernel objects accessed via <strong>Handles</strong>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-zinc-800 bg-black/40 rounded font-mono text-xs">
                            <div className="text-zinc-500 mb-2">// Opening a file in C++ (Win32)</div>
                            <div className="text-blue-300">HANDLE hFile = CreateFile(...)</div>
                            <br/>
                             <div className="text-zinc-500 mb-2">// Waiting for an event</div>
                             <div className="text-blue-300">WaitForSingleObject(hEvent, ...)</div>
                        </div>
                        <div className="p-4 border border-zinc-800 bg-zinc-900 rounded">
                             <h4 className="text-white font-bold mb-2 text-sm">Key Principles</h4>
                            <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1">
                                <li>Rich APIs and structured data over text streams.</li>
                                <li>Backward compatibility is paramount.</li>
                                <li>Security through Access Control Lists (ACLs) on objects.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
