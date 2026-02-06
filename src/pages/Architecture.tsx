import { Layout } from '../components/layout/Layout';
import { Cpu, Database, Layout as LayoutIcon, Terminal, ArrowRight, Box, HardDrive, Cpu as Zap } from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';

export const Architecture = () => {
    const { config } = useSystemConfig();

    return (
        <Layout>
            <div className="bg-zinc-950 min-h-screen text-zinc-300 font-sans selection:bg-green-500/30">
                {/* Header Section */}
                <div className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm relative">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex items-center gap-3 text-green-500 font-mono text-sm mb-2">
                            <Terminal size={14} />
                            <span>System Architecture v{config.version.replace('v', '')}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                            System <span className="text-zinc-500">Architecture</span>
                        </h1>
                        <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">
                            We didn't just mock an OS. We built one.
                            <br />
                            A technical deep-dive into the VM, the Transpiler, and the 1MB of ArrayBuffer that powers it all.
                        </p>
                    </div>
                </div>

                {/* Core Diagram Section - The High Level Flow */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        {/* 4-Layer "Stack" Diagram */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch mb-16">
                            {['Presentation (React)', 'SysCore VM (Kernel)', 'Scheduling Engine', 'Persistence (DB)'].map((layer, i) => (
                                <div key={i} className={`p-4 rounded border border-zinc-800 bg-black/40 flex items-center justify-center font-mono text-sm ${i === 1 ? 'border-green-500/50 text-green-400 bg-green-900/10' : 'text-zinc-400'}`}>
                                    {i + 1}. {layer}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                            {/* Layer 1: Frontend */}
                            <div className="space-y-4">
                                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 transition-colors group h-full">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><LayoutIcon className="text-blue-500" size={18} /> Presentation</h3>
                                    <p className="text-zinc-500 text-xs mb-4">The View & Controller</p>
                                    <div className="space-y-4 text-sm text-zinc-400">
                                        <p>Standard React 18 SPA. It handles the DOM, but logic is delegated.</p>
                                        <div className="p-2 bg-black rounded border border-zinc-800 font-mono text-[10px] text-blue-300">
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
                                <div className="p-6 rounded-xl bg-zinc-900/50 border border-green-500/30 transition-colors group relative h-full ring-1 ring-green-900/50">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Box className="text-green-500" size={18} /> SysCore VM</h3>
                                    <p className="text-zinc-500 text-xs mb-4">The Sandbox</p>
                                    <ul className="space-y-2 text-sm text-zinc-400">
                                        <li>• <strong>Transpiler:</strong> Regex-based C-to-JS compilation.</li>
                                        <li>• <strong>Sandbox:</strong> `__sys` injection for safe I/O.</li>
                                        <li>• <strong>MMU:</strong> 1MB Flat Memory Model.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Layer 3: Engine */}
                            <div className="space-y-4">
                                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-yellow-500/30 transition-colors group h-full">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Cpu className="text-yellow-500" size={18} /> Engine</h3>
                                    <p className="text-zinc-500 text-xs mb-4">The Scheduler</p>
                                    <div className="space-y-2 text-sm text-zinc-400">
                                        <p>Pure functional logic. State in, State out.</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {['FCFS', 'SJF', 'RR', 'SRTF', 'PRIO'].map(a => <span key={a} className="px-1 bg-zinc-800 text-zinc-400 text-[10px] rounded">{a}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Layer 4: DB */}
                            <div className="space-y-4">
                                <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/30 transition-colors group h-full">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Database className="text-purple-500" size={18} /> Persistence</h3>
                                    <p className="text-zinc-500 text-xs mb-4">Supabase</p>
                                    <p className="text-sm text-zinc-400">Configuration, Leaderboards, and User Profiles stored in PostgreSQL.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* THE RANT SECTION: Internals */}
                <section className="py-20 bg-black border-t border-zinc-800">
                    <div className="container mx-auto px-6">
                        <h2 className="text-3xl font-bold text-white mb-12 border-l-4 border-green-500 pl-4">
                            System Internals <span className="text-zinc-600 font-mono text-sm ml-2">// The implementation details</span>
                        </h2>

                        <div className="space-y-20">
                            {/* Topic 1: The Transpiler Pipeline */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                        <Zap className="text-yellow-400" />
                                        The C-to-JS Transpiler Pipeline
                                    </h3>
                                    <p className="text-zinc-400 leading-relaxed mb-6">
                                        We execute C code in the browser. But we don't use WebAssembly. Why? Because we need
                                        <strong> granular control</strong> over the execution state (variables, heap, stack) to visualize it.
                                    </p>
                                    <p className="text-zinc-400 leading-relaxed mb-6">
                                        Instead, `Transpiler.ts` statically analyzes your C code and recompiles it into an Async JavaScript Function.
                                        Crucially, it injects `await __sys.yield()` into every loop, effectively giving us a
                                        preemptive multitasking scheduler within a single-threaded JS engine.
                                    </p>
                                    <ul className="space-y-3 font-mono text-sm text-green-400/80">
                                        <li className="flex items-center gap-2"><ArrowRight size={14} /> int x = 10 ➔ stack_alloc(4); write32(ptr, 10);</li>
                                        <li className="flex items-center gap-2"><ArrowRight size={14} /> while(1) ➔ while(true) &#123; await __sys.yield(); ... &#125;</li>
                                        <li className="flex items-center gap-2"><ArrowRight size={14} /> printf(...) ➔ await __sys.print(...)</li>
                                    </ul>
                                </div>
                                <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 font-mono text-xs overflow-hidden relative group">
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded">src/syscore/vm/Transpiler.ts</div>
                                    <div className="text-purple-400">export class</div> <div className="text-yellow-400 inline">Transpiler</div> &#123;
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="order-2 lg:order-1 bg-zinc-900 rounded-lg border border-zinc-800 p-6 flex flex-col justify-center items-center">
                                    <div className="w-full max-w-sm border-2 border-zinc-700 h-64 relative bg-black flex flex-col">
                                        <div className="h-12 bg-red-500/20 border-b border-red-500/50 flex items-center justify-center text-red-500 font-mono text-xs">
                                            0xFFFFF (Stack Top)
                                        </div>
                                        <div className="flex-1 flex items-center justify-center text-zinc-700 font-mono text-xs italic">
                                            Free Space
                                        </div>
                                        <div className="h-20 bg-blue-500/20 border-t border-blue-500/50 flex items-center justify-center text-blue-500 font-mono text-xs">
                                            Heap (Grows Up)
                                        </div>
                                        <div className="h-12 bg-green-500/20 border-t border-green-500/50 flex items-center justify-center text-green-500 font-mono text-xs">
                                            0x0000 (Code/Data)
                                        </div>
                                    </div>
                                    <p className="mt-4 text-zinc-500 font-mono text-xs text-center">Visual representation of the 1MB Address Space</p>
                                </div>

                                <div className="order-1 lg:order-2">
                                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                        <HardDrive className="text-red-500" />
                                        1MB of Raw Power
                                    </h3>
                                    <p className="text-zinc-400 leading-relaxed mb-6">
                                        We don't use JavaScript variables to store user data. That would be cheating.
                                        SysCore allocates a single <strong>1MB ArrayBuffer</strong> on boot.
                                    </p>
                                    <p className="text-zinc-400 leading-relaxed mb-6">
                                        Every integer, string, or struct you create in the Shell Maker is serialized into bytes
                                        and written to this buffer using `DataView`. This allows us to simulate:
                                        <br /><br />
                                        • <strong>Stack Overflow:</strong> If your recursion goes too deep, you actually hit the Heap.
                                        <br />
                                        • <strong>Memory Leaks:</strong> `malloc` without `free` will eventually crash the tab.
                                        <br />
                                        • <strong>Pointer Arithmetic:</strong> Is totally possible (and dangerous).
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
