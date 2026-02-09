import React from 'react';
import { Terminal, Hash } from 'lucide-react';

export const ApiReferencePage = () => {
    return (
        <div className="space-y-12 max-w-4xl animate-fade-in" id="top">
            <div className="space-y-6 border-b border-zinc-800 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-mono rounded-full border border-purple-500/20">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    Reference
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">SysCore API Reference</h1>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    Documentation for the built-in shell commands and kernel system calls available in the Console environment.
                </p>
            </div>

            {/* Shell Commands */}
            <div className="space-y-8" id="shell-commands">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Terminal className="text-zinc-500" /> Shell Commands
                </h2>

                <div className="grid gap-4">
                    <CommandCard
                        name="help"
                        args=""
                        desc="List available commands in the terminal environment."
                        example="help"
                    />
                    <CommandCard
                        name="syscore"
                        args="<module>"
                        desc="CLI Interface for interacting with kernel modules (cpu, mem, algos)."
                        example="syscore cpu.info"
                    />
                    <CommandCard
                        name="init"
                        args="[app_name]"
                        desc="Launch a system application or visualizer module."
                        example="init cpu_scheduler"
                    />
                </div>
            </div>

            {/* Syscalls */}
            <div className="space-y-8" id="system-calls">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Hash className="text-zinc-500" /> System Calls (C-Interface)
                </h2>
                <p className="text-zinc-400 text-sm">
                    These low-level functions are available when writing C code in the Shell Maker IDE. They map directly to the underlying `Memory.ts` and `ShellKernel.ts` implementation.
                </p>

                <div className="grid gap-4">
                    <SyscallCard
                        name="print"
                        ret="void"
                        params="const char *format, ..."
                        desc="Print formatted output to stdout. Supports %s (strings) and %d (numbers)."
                    />
                    <SyscallCard
                        name="input"
                        ret="char*"
                        params="char *buffer"
                        desc="Read line from stdin into the provided memory buffer. Pauses execution until input is received."
                    />
                    <SyscallCard
                        name="malloc"
                        ret="void*"
                        params="size_t size"
                        desc="Allocates `size` bytes of uninitialized storage on the heap. Returns pointer."
                    />
                    <SyscallCard
                        name="write32"
                        ret="void"
                        params="int addr, int val"
                        desc="Write a 32-bit integer directly to physical memory address."
                    />
                    <SyscallCard
                        name="read32"
                        ret="int"
                        params="int addr"
                        desc="Read a 32-bit integer from physical memory address."
                    />
                    <SyscallCard
                        name="strcmp"
                        ret="int"
                        params="const char *s1, const char *s2"
                        desc="Compare two strings. Returns 0 if equal."
                    />
                </div>
            </div>
        </div>
    );
};

interface CommandCardProps {
    name: string;
    args: string;
    desc: string;
    example: string;
}

const CommandCard = ({ name, args, desc, example }: CommandCardProps) => (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 font-mono hover:border-zinc-700 transition-colors">
        <div className="flex items-baseline gap-3 mb-2">
            <span className="text-green-400 font-bold text-lg">{name}</span>
            <span className="text-zinc-500 text-sm">{args}</span>
        </div>
        <p className="text-zinc-300 text-sm mb-3 font-sans">{desc}</p>
        <div className="bg-black/50 p-2 rounded border border-white/5 text-xs text-zinc-500 flex items-center gap-2">
            <span className="text-green-500">$</span> {example}
        </div>
    </div>
);

interface SyscallCardProps {
    name: string;
    ret: string;
    params: string;
    desc: string;
}

const SyscallCard = ({ name, ret, params, desc }: SyscallCardProps) => (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 font-mono hover:border-zinc-700 transition-colors">
        <div className="flex flex-col gap-1 mb-3">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="text-blue-400">{ret}</span>
                <span className="text-yellow-400 font-bold text-base">{name}</span>
            </div>
            <span className="text-zinc-600 text-xs px-4">({params})</span>
        </div>
        <p className="text-zinc-300 text-sm font-sans border-t border-white/5 pt-2">{desc}</p>
    </div>
);
