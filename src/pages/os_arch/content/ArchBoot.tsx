
import React from 'react';
import { ArrowDown } from 'lucide-react';

export const ArchBoot = () => {
    return (
        <div className="max-w-4xl space-y-12 animate-fade-in">
             {/* Header */}
            <div className="border-b border-zinc-800 pb-8">
                 <div className="text-xs font-mono text-zinc-500 mb-2">/usr/share/doc/boot</div>
                <h1 className="text-4xl font-bold text-white mb-6">From Power-On to Login</h1>
                <p className="text-xl text-zinc-400 leading-relaxed">
                    What happens when you press the power button? The journey from electricity to a graphical user interface.
                </p>
            </div>

            <div className="relative border-l-2 border-zinc-800 ml-6 space-y-12 pb-12">
                
                {/* 1. BIOS/UEFI */}
                <div className="relative pl-8">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-800 border-2 border-zinc-600"></div>
                    <h3 className="text-lg font-bold text-white mb-2">1. Firmware (BIOS / UEFI)</h3>
                    <p className="text-sm text-zinc-400 mb-4">
                        The motherboard initializes hardware (POST - Power On Self Test). It looks for a bootable device (SSD, USB) and reads the 
                        first sector (MBR) or the EFI partition.
                    </p>
                </div>

                {/* 2. Bootloader */}
                <div className="relative pl-8">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-900 border-2 border-blue-500"></div>
                    <h3 className="text-lg font-bold text-blue-400 mb-2">2. Bootloader (GRUB / Windows Boot Manager)</h3>
                    <p className="text-sm text-zinc-400 mb-4">
                        A small program that loads the Kernel into memory. It might present a menu to select an OS. 
                        It switches the CPU from 16-bit Real Mode to 32-bit Protected Mode (and later 64-bit Long Mode).
                    </p>
                </div>

                {/* 3. Kernel Init */}
                <div className="relative pl-8">
                     <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-red-900 border-2 border-red-500"></div>
                    <h3 className="text-lg font-bold text-red-400 mb-2">3. Kernel Initialization</h3>
                    <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 text-xs font-mono text-zinc-300 space-y-1">
                        <div>[ 0.000000] Linux version 6.8.0-generic...</div>
                        <div>[ 0.001000] Command line: BOOT_IMAGE=/boot/vmlinuz...</div>
                        <div>[ 0.120000] Memory: 16384MB available...</div>
                        <div className="text-green-500">[ OK ] Started Memory Management Unit.</div>
                        <div className="text-green-500">[ OK ] Mounted root filesystem.</div>
                    </div>
                    <p className="text-sm text-zinc-400 mt-4">
                        The kernel sets up interrupt tables, memory paging, and device drivers. It mounts the root filesystem as read-only initially.
                    </p>
                </div>

                {/* 4. Init Process */}
                <div className="relative pl-8">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-900 border-2 border-green-500"></div>
                    <h3 className="text-lg font-bold text-green-400 mb-2">4. User Space Init (PID 1)</h3>
                    <p className="text-sm text-zinc-400 mb-2">
                        The kernel starts the first user-space process (e.g., <code className="text-white">systemd</code> on Linux, <code className="text-white">smss.exe</code> on Windows).
                        This process is the "parent of all processes".
                    </p>
                    <ul className="list-disc list-inside text-xs text-zinc-500">
                        <li>Starts system services (Network, Audio).</li>
                        <li>Starts the Display Manager (Login Screen).</li>
                    </ul>
                </div>

            </div>
        </div>
    );
};
