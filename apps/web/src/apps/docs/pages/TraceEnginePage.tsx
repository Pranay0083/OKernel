import React from 'react';
import { ArrowRight } from 'lucide-react';

export const TraceEnginePage = () => {
    return (
        <div className="space-y-12 max-w-4xl animate-fade-in pb-20">
            <div className="space-y-6 border-b border-zinc-800 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-500 text-xs font-mono rounded-full border border-orange-500/20">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    Deep Dive
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">The Trace Engine</h1>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    How OKernel turns static code into a fluid, cycle-accurate visualization.
                    This page explains the "Transpilation Pipeline" used by the SysCore VM.
                </p>
            </div>

            {/* The Problem */}
            <div className="space-y-4" id="challenge">
                <h2 className="text-2xl font-bold text-white">The Challenge</h2>
                <p className="text-zinc-400 leading-relaxed">
                    Standard JavaScript execution is "run-to-completion". You call a function, it runs, and it returns.
                    You cannot easily pause it in the middle to inspect memory, unless you use `debugger`, which isn't available to the web app's logic itself.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                    To visualize algorithms like Round Robin or Memory Allocation, we need to <strong>yield</strong> execution after every instruction, allowing the UI to render the current state.
                </p>
            </div>

            {/* The Solution */}
            <div className="space-y-6" id="solution">
                <h2 className="text-2xl font-bold text-white">The Solution: Transpilation</h2>
                <p className="text-zinc-400 leading-relaxed">
                    We implemented a custom C-to-JS transpiler (`Transpiler.ts`) that rewrites user code into an `async` function where every operation is awaited.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Code */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-500">Source (C-Like)</div>
                        <pre className="p-4 text-sm font-mono text-zinc-300">
                            {`int main() {
  int x = 10;
    while (x > 0) {
        x--;
    }
} `}
                        </pre>
                    </div>

                    {/* Arrow */}
                    <div className="hidden lg:flex items-center justify-center text-zinc-600">
                        <ArrowRight size={32} />
                    </div>

                    {/* Output Code */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-500">Transpiled (Async JS)</div>
                        <pre className="p-4 text-sm font-mono text-zinc-300">
                            {`async function kernel_main() {
    const x_ptr = await __sys.stack_alloc(4);
    await __sys.write32(x_ptr, 10);

    while (await __sys.read32(x_ptr) > 0) {
        await __sys.yield(); // UI Update!
        await __sys.write32(x_ptr, ...);
    }
} `}
                        </pre>
                    </div>
                </div>
            </div>

            {/* Pipeline Steps */}
            <div className="space-y-8" id="pipeline">
                <h2 className="text-2xl font-bold text-white">Pipeline Stages</h2>

                <div className="space-y-6">
                    <Stage
                        num="1"
                        title="Regex Parsing"
                        desc="The raw string is scanned for variable declarations (`int x`), assignments, and loops. We do not use a full AST for performance reasons, opting for robust regex pattern matching."
                    />
                    <Stage
                        num="2"
                        title="Memory Mapping"
                        desc="Variables are not stored as JS variables. Instead, `int x` allocates 4 bytes in our simulated `Uint8Array` RAM. All reads/writes to `x` become `read32(addr)` and `write32(addr)` calls."
                    />
                    <Stage
                        num="3"
                        title="Yield Insertion"
                        desc="Inside every loop (`while`, `for`), we inject `await __sys.yield()`. This suspends the kernel, allowing the React render loop to process the latest memory state and update the screen."
                    />
                </div>
            </div>
        </div>
    );
};

interface StageProps {
    num: string;
    title: string;
    desc: string;
}

const Stage = ({ num, title, desc }: StageProps) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-white">
            {num}
        </div>
        <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);
