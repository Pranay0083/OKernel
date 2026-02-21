
import { Layout } from '../components/layout/Layout';
import { Cpu, Database, Layout as LayoutIcon, ArrowRight, Box, HardDrive, Cpu as Zap, ShieldCheck, Microscope } from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';

export const Architecture = () => {
    const { config } = useSystemConfig();

    return (
        <Layout>
            <div className="bg-[#050505] min-h-screen text-zinc-300 font-mono selection:bg-green-500/30">
                {/* Header Section */}
                <div className="border-b border-zinc-800 bg-[#0A0A0A] relative">
                    <div className="container mx-auto px-6 py-24">
                        <div className="flex items-center gap-3 text-green-500 font-mono text-xs mb-6 uppercase tracking-widest">
                            <span className="w-2 h-2 bg-green-500 animate-pulse"></span>
                            System Internals
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-8 leading-tight">
                            FULL STACK<br />
                            <span className="text-zinc-600">INFRASTRUCTURE.</span>
                        </h1>
                        <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed font-sans">
                            We didn't just mock an OS. We built one.
                            <br />
                            A technical deep-dive into the VM, the Transpiler, and the 1MB of ArrayBuffer that powers it all.
                        </p>
                    </div>
                </div>

                {/* Core Diagram Section - The High Level Flow */}
                <section className="py-24 border-b border-zinc-800 relative overflow-hidden bg-[#050505]">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        {/* 4-Layer "Stack" Diagram */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-zinc-800 border border-zinc-800 mb-16">
                            {['Presentation (React)', 'SysCore VM (Kernel)', 'Scheduling Engine', 'Persistence (DB)'].map((layer, i) => (
                                <div key={i} className={`p - 6 bg - [#0A0A0A] flex items - center justify - center font - mono text - xs uppercase tracking - wider ${i === 1 ? 'text-green-500 bg-zinc-900/30' : 'text-zinc-500'} `}>
                                    {i + 1}. {layer}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-start">
                            {/* Layer 1: Frontend */}
                            <div className="space-y-4">
                                <div className="p-8 bg-[#0A0A0A] border border-zinc-800 h-full hover:border-zinc-600 transition-colors group">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-mono uppercase text-sm"><LayoutIcon className="text-blue-500" size={16} /> Presentation</h3>
                                    <p className="text-zinc-500 text-xs mb-6 font-mono">The View & Controller</p>
                                    <div className="space-y-4 text-xs text-zinc-400 font-mono">
                                        <p>Standard React 18 SPA. It handles the DOM, but logic is delegated.</p>
                                        <div className="p-3 bg-black border border-zinc-800 text-blue-400">
                                            &lt;Terminal /&gt;<br />
                                            &nbsp;⬇<br />
                                            useTerminal()<br />
                                            &nbsp;⬇<br />
                                            ShellKernel.boot()
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Layer 2: VM (The Cool Stuff) */}
                            <div className="space-y-4">
                                <div className="p-8 bg-[#0A0A0A] border border-green-500/30 h-full hover:border-green-500/50 transition-colors group relative">
                                    <div className="absolute inset-0 bg-green-500/5 pointer-events-none"></div>
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-mono uppercase text-sm"><Box className="text-green-500" size={16} /> SysCore VM</h3>
                                    <p className="text-zinc-500 text-xs mb-6 font-mono">The Sandbox</p>
                                    <ul className="space-y-3 text-xs text-zinc-400 font-mono">
                                        <li className="flex gap-2"><ArrowRight size={12} className="text-green-500 mt-0.5" /> <strong>Transpiler:</strong> Regex-based C-to-JS compilation.</li>
                                        <li className="flex gap-2"><ArrowRight size={12} className="text-green-500 mt-0.5" /> <strong>Sandbox:</strong> `__sys` injection for safe I/O.</li>
                                        <li className="flex gap-2"><ArrowRight size={12} className="text-green-500 mt-0.5" /> <strong>MMU:</strong> 1MB Flat Memory Model.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Layer 3: Engine */}
                            <div className="space-y-4">
                                <div className="p-8 bg-[#0A0A0A] border border-zinc-800 h-full hover:border-zinc-600 transition-colors group">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-mono uppercase text-sm"><Cpu className="text-yellow-500" size={16} /> Engine</h3>
                                    <p className="text-zinc-500 text-xs mb-6 font-mono">The Scheduler</p>
                                    <div className="space-y-4 text-xs text-zinc-400 font-mono">
                                        <p>Pure functional logic. State in, State out.</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {['FCFS', 'SJF', 'RR', 'SRTF', 'PRIO'].map(a => <span key={a} className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-none">{a}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Layer 4: DB */}
                            <div className="space-y-4">
                                <div className="p-8 bg-[#0A0A0A] border border-zinc-800 h-full hover:border-zinc-600 transition-colors group">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-mono uppercase text-sm"><Database className="text-purple-500" size={16} /> Persistence</h3>
                                    <p className="text-zinc-500 text-xs mb-6 font-mono">Supabase</p>
                                    <p className="text-xs text-zinc-400 font-mono">Configuration, Leaderboards, and User Profiles stored in PostgreSQL.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* THE RANT SECTION: Internals */}
                <section className="py-24 bg-[#050505]">
                    <div className="container mx-auto px-6">
                        <div className="flex items-center gap-4 mb-20">
                            <h2 className="text-3xl font-bold text-white uppercase tracking-tight">System Internals</h2>
                            <div className="h-px flex-1 bg-zinc-800"></div>
                            <span className="text-zinc-600 font-mono text-xs">// implementation_details.md</span>
                        </div>

                        <div className="space-y-24">
                            {/* Topic 1: The Transpiler Pipeline */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 font-mono uppercase text-sm">
                                        <Zap className="text-yellow-400" size={16} />
                                        The C-to-JS Transpiler Pipeline
                                    </h3>
                                    <p className="text-zinc-400 leading-relaxed mb-6 text-sm font-sans">
                                        We execute C code in the browser. But we don't use WebAssembly. Why? Because we need
                                        <strong> granular control</strong> over the execution state (variables, heap, stack) to visualize it.
                                    </p>
                                    <p className="text-zinc-400 leading-relaxed mb-6 text-sm font-sans">
                                        Instead, `Transpiler.ts` statically analyzes your C code and recompiles it into an Async JavaScript Function.
                                        Crucially, it injects `await __sys.yield()` into every loop, effectively giving us a
                                        preemptive multitasking scheduler within a single-threaded JS engine.
                                    </p>
                                    <ul className="space-y-3 font-mono text-xs text-green-500/80 mt-8">
                                        <li className="flex items-center gap-3"><span className="text-zinc-600">01</span> int x = 10 ➔ stack_alloc(4); write32(ptr, 10);</li>
                                        <li className="flex items-center gap-3"><span className="text-zinc-600">02</span> while(1) ➔ while(true) &#123; await __sys.yield(); ... &#125;</li>
                                        <li className="flex items-center gap-3"><span className="text-zinc-600">03</span> printf(...) ➔ await __sys.print(...)</li>
                                    </ul>
                                </div>
                                <div className="bg-[#0A0A0A] border border-zinc-800 p-6 font-mono text-xs overflow-hidden relative shadow-2xl">
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-zinc-900 border-b border-l border-zinc-800 text-zinc-500 text-[10px]">src/syscore/vm/Transpiler.ts</div>
                                    <div className="text-purple-400 mt-4">export class</div> <div className="text-yellow-400 inline">Transpiler</div> &#123;
                                    <br />
                                    &nbsp;&nbsp;<div className="text-blue-400 inline">static compile</div>(cCode: string) &#123;
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-500">// 1. Stack Allocation injection</span>
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;js = js.replace(<span className="text-green-400">/int\s+(\w+);/g</span>, <span className="text-green-400">"const $1_ptr = __sys.stack_alloc(4);"</span>);
                                    <br />
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-500">// 2. Preemptive Yield injection</span>
                                    <br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;js = js.replace(<span className="text-green-400">/while\s*\((.*?)\)\s*&#123;/g</span>, <span className="text-green-400">"while ($1) &#123; await __sys.yield();"</span>);
                                    <br />
                                    &nbsp;&nbsp;&#125;
                                    <br />
                                    &#125;
                                </div>
                            </div>

                            {/* Topic 2: Memory Model */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div className="order-2 lg:order-1 bg-[#0A0A0A] border border-zinc-800 p-8 flex flex-col justify-center items-center shadow-2xl">
                                    <div className="w-full max-w-xs border-2 border-zinc-700 h-80 relative bg-[#050505] flex flex-col">
                                        <div className="h-16 bg-red-500/10 border-b border-red-500/20 flex items-center justify-center text-red-500 font-mono text-xs">
                                            0xFFFFF (Stack Top)
                                        </div>
                                        <div className="flex-1 flex items-center justify-center text-zinc-700 font-mono text-xs italic">
                                            Free Space
                                        </div>
                                        <div className="h-32 bg-blue-500/10 border-t border-blue-500/20 flex items-center justify-center text-blue-500 font-mono text-xs">
                                            Heap (Grows Up)
                                        </div>
                                        <div className="h-16 bg-green-500/10 border-t border-green-500/20 flex items-center justify-center text-green-500 font-mono text-xs">
                                            0x0000 (Code/Data)
                                        </div>
                                    </div>
                                    <p className="mt-6 text-zinc-500 font-mono text-[10px] uppercase tracking-widest text-center">Visual representation of the 1MB Address Space</p>
                                </div>

                                <div className="order-1 lg:order-2">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 font-mono uppercase text-sm">
                                        <HardDrive className="text-red-500" size={16} />
                                        1MB of Raw Power
                                    </h3>
                                    <p className="text-zinc-400 leading-relaxed mb-6 text-sm font-sans">
                                        We don't use JavaScript variables to store user data. That would be cheating.
                                        SysCore allocates a single <strong>1MB ArrayBuffer</strong> on boot.
                                    </p>
                                    <p className="text-zinc-400 leading-relaxed mb-6 text-sm font-sans">
                                        Every integer, string, or struct you create in the Shell Maker is serialized into bytes
                                        and written to this buffer using `DataView`. This allows us to simulate:
                                    </p>
                                    <ul className="space-y-4 font-mono text-xs text-zinc-400 mt-8">
                                        <li className="flex gap-4">
                                            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 font-bold">SO</div>
                                            <div>
                                                <strong className="text-white">Stack Overflow</strong>
                                                <p className="text-zinc-500 mt-1">If your recursion goes too deep, you actually hit the Heap.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-4">
                                            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-500 font-bold">ML</div>
                                            <div>
                                                <strong className="text-white">Memory Leaks</strong>
                                                <p className="text-zinc-500 mt-1">`malloc` without `free` will eventually crash the tab.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Topic 3: Cycle-Accurate Tracing (NEW) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 font-mono uppercase text-sm">
                                        <Microscope className="text-purple-500" size={16} />
                                        Cycle-Accurate Tracer
                                    </h3>
                                    <p className="text-zinc-400 leading-relaxed mb-6 text-sm font-sans">
                                        For Python execution, we needed more than just transpilation. We built a custom `sys.settrace` hook
                                        that acts as a <strong>Program Counter</strong> stepping through opcode execution.
                                    </p>
                                    <p className="text-zinc-400 leading-relaxed mb-6 text-sm font-sans">
                                        At each step, we serialize the entire heap graph using structural sharing.
                                        This allows "Time Travel" debugging - you can step BACKWARDS because we have the state snapshot of `t - 1`.
                                    </p>
                                </div>
                                <div className="bg-[#0A0A0A] border border-zinc-800 p-8 font-mono text-xs flex items-center justify-center">
                                    <div className="space-y-4 w-full">
                                        <div className="flex justify-between text-zinc-500 text-[10px] uppercase">
                                            <span>Trace Buffer</span>
                                            <span>Size: 1024 Frames</span>
                                        </div>
                                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-purple-500/50"></div>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className={`h - 8 border border - zinc - 800 ${i === 4 ? 'bg-purple-900/20 border-purple-500/50 text-purple-400' : 'bg-zinc-900 text-zinc-600'} flex items - center justify - center`}>
                                                    t-{5 - i}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Topic 4: Sandboxing (NEW) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div className="order-2 lg:order-1 bg-[#0A0A0A] border border-zinc-800 p-8 flex items-center justify-center">
                                    <div className="border border-zinc-700 p-4 rounded bg-[#050505]">
                                        <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                                            <ShieldCheck size={14} className="text-green-500" />
                                            <span className="text-zinc-400">Docker Container (Ephemeral)</span>
                                        </div>
                                        <div className="space-y-2 text-zinc-600">
                                            <div className="flex justify-between gap-8"><span>User Code</span> <span className="text-green-500">running...</span></div>
                                            <div className="flex justify-between gap-8"><span>Network</span> <span className="text-red-500">BLOCKED</span></div>
                                            <div className="flex justify-between gap-8"><span>Filesystem</span> <span className="text-yellow-500">READ-ONLY</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-1 lg:order-2">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 font-mono uppercase text-sm">
                                        <ShieldCheck className="text-green-500" size={16} />
                                        Isolate & Sandbox
                                    </h3>
                                    <p className="text-zinc-400 leading-relaxed mb-6 text-sm font-sans">
                                        Allowing users to run arbitrary C/Python code is dangerous. We solve this with <strong>Ephemeral Containers</strong>.
                                    </p>
                                    <p className="text-zinc-400 leading-relaxed mb-6 text-sm font-sans">
                                        Every execution request spins up a lightweight, network-isolated Docker container.
                                        Input/Output is streamed via gRPC. The container is destroyed immediately after execution (or timeout), preserving zero state.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};
