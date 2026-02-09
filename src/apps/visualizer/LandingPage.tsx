
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductNavbar } from '../../components/layout/ProductNavbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Terminal, Cpu, Zap, Layers, Database, Network, Lock } from 'lucide-react';

export const SympathyLanding = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#050505] min-h-screen text-zinc-300 font-mono overflow-x-hidden selection:bg-green-500/30">
            <ProductNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 border-b border-white/10 px-6">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 text-left">
                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] tracking-widest uppercase mb-6 font-bold">
                                <span className="w-1.5 h-1.5 bg-green-500 animate-pulse"></span>
                                System Online
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
                                EXECUTE.<br />
                                <span className="text-zinc-500">VISUALIZE.</span><br />
                                UNDERSTAND.
                            </h1>
                            <p className="text-lg text-zinc-400 mb-8 max-w-xl leading-relaxed">
                                A cycle-accurate Python execution engine that visualizes memory allocation, stack frames, and object references in real-time.
                                Stop guessing. See the heap.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/platform/execution')}
                                    className="h-12 px-6 bg-green-600 hover:bg-green-500 text-black font-bold text-sm tracking-wide rounded-none border border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center gap-2 group transition-all"
                                >
                                    <Terminal size={16} className="fill-black group-hover:scale-110 transition-transform" />
                                    LAUNCH_CONSOLE
                                </Button>
                                <a href="#engineering" className="h-12 px-6 flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-bold tracking-wide hover:bg-white/5 transition-colors">
                                    SYSTEM_SPECS <ArrowRight size={14} />
                                </a>
                            </div>
                        </div>

                        {/* Technical Graphic / Code Preview */}
                        <div className="flex-1 w-full max-w-xl">
                            <div className="border border-zinc-800 bg-[#0A0A0A] p-1 font-mono text-xs shadow-2xl relative">
                                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-green-500"></div>
                                <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-green-500"></div>
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-green-500"></div>
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-green-500"></div>

                                <div className="bg-[#050505] p-4 border-b border-zinc-800 flex justify-between items-center text-zinc-500">
                                    <span>./kernel/mem_trace.py</span>
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                                        <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                                    </div>
                                </div>
                                <div className="p-6 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                                        <Cpu size={120} className="text-green-500" />
                                    </div>
                                    <div className="space-y-1 text-zinc-400 relative z-10">
                                        <div className="flex"><span className="text-purple-400 w-8">01</span> <span className="text-green-400">def</span> <span className="text-blue-400">heap_alloc</span>():</div>
                                        <div className="flex"><span className="text-zinc-700 w-8">02</span> &nbsp;&nbsp;ptr = <span className="text-yellow-400">malloc</span>(0x100)</div>
                                        <div className="flex"><span className="text-zinc-700 w-8">03</span> &nbsp;&nbsp;<span className="text-green-400">if</span> not ptr:</div>
                                        <div className="flex"><span className="text-zinc-700 w-8">04</span> &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400">raise</span> KernelPanic()</div>
                                        <div className="flex"><span className="text-zinc-700 w-8">05</span> &nbsp;&nbsp;return ptr</div>
                                        <div className="flex mt-4 text-green-500/50">
                                            <span className="w-8">&gt;&gt;</span> Allocated 256 bytes at 0x7FF...A0
                                        </div>
                                        <div className="flex text-green-500/50">
                                            <span className="w-8">&gt;&gt;</span> Stack frame pushed: heap_alloc
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section className="py-24 px-6 border-b border-white/10 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-px flex-1 bg-zinc-800"></div>
                        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase">Core Modules</h2>
                        <div className="h-px flex-1 bg-zinc-800"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="md:col-span-2 p-8 border border-zinc-800 bg-[#0A0A0A] hover:border-zinc-600 transition-colors group relative overflow-hidden">
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:16px_16px]"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-green-500">
                                    <Database size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 font-sans">Heap Visualization</h3>
                                <p className="text-zinc-400 text-sm max-w-sm">
                                    Track every object allocation in real-time. Visualize references, garbage collection cycles, and memory fragmentation as code executes.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 border border-zinc-800 bg-[#0A0A0A] hover:border-zinc-600 transition-colors group">
                            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-blue-500">
                                <Layers size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 font-sans">Stack Tracing</h3>
                            <p className="text-zinc-400 text-sm">
                                Visualize function calls, local variables, and return addresses. Debug recursion with a visual stack tree.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 border border-zinc-800 bg-[#0A0A0A] hover:border-zinc-600 transition-colors group">
                            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-purple-500">
                                <Cpu size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 font-sans">CPU Flame Graph</h3>
                            <p className="text-zinc-400 text-sm">
                                Analyze execution time per line. Identify bottlenecks with high-precision timestamping.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="md:col-span-2 p-8 border border-zinc-800 bg-[#0A0A0A] hover:border-zinc-600 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px]"></div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1">
                                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-yellow-500">
                                        <Network size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 font-sans">Graph-Based Object View</h3>
                                    <p className="text-zinc-400 text-sm">
                                        See data structures as they connect. Linked lists, trees, and graphs are rendered as node-link diagrams, not just lists of numbers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Engineering Achievements - Section requested by user */}
            <section id="engineering" className="py-24 px-6 relative bg-[#080808]">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-tight">Engineering Architecture</h2>
                        <p className="text-zinc-400 max-w-2xl leading-relaxed">
                            Sympathy isn't just a UI wrapper. We built a custom execution environment to capture runtime state without significant performance overhead.
                        </p>
                    </div>

                    <div className="space-y-12">
                        {/* Achievement 1 */}
                        <div className="flex flex-col md:flex-row gap-8 border-l border-zinc-800 pl-8 relative">
                            <div className="absolute -left-1.5 top-0 w-3 h-3 bg-zinc-800 border border-zinc-600"></div>
                            <div className="md:w-1/3">
                                <h3 className="text-xl font-bold text-white mb-2">Cycle-Accurate Tracer</h3>
                                <div className="inline-block px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20 mb-4">CORE ENGINE</div>
                            </div>
                            <div className="md:w-2/3">
                                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                    We implemented a custom Python `sys.settrace` hook that intercepts every opcode execution. Unlike standard debuggers, we serialize the entire heap state at each step, employing structural sharing to minimize memory footprint.
                                </p>
                                <ul className="space-y-2 text-zinc-500 text-sm font-mono">
                                    <li className="flex gap-2 items-center"><span className="text-green-500">OK</span> Captures variable mutations in-place</li>
                                    <li className="flex gap-2 items-center"><span className="text-green-500">OK</span> Handles circular references via ID tracking</li>
                                </ul>
                            </div>
                        </div>

                        {/* Achievement 2 */}
                        <div className="flex flex-col md:flex-row gap-8 border-l border-zinc-800 pl-8 relative">
                            <div className="absolute -left-1.5 top-0 w-3 h-3 bg-zinc-800 border border-zinc-600"></div>
                            <div className="md:w-1/3">
                                <h3 className="text-xl font-bold text-white mb-2">Sandboxed Virtualization</h3>
                                <div className="inline-block px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[10px] border border-orange-500/20 mb-4">SECURITY</div>
                            </div>
                            <div className="md:w-2/3">
                                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                    User code executes within ephemeral Docker containers (SysCore). We use a custom gRPC stream to pipe stdout/stderr and state deltas back to the client in real-time, ensuring &lt; 50ms latency.
                                </p>
                                <div className="bg-zinc-900 border border-zinc-800 p-3 font-mono text-[10px] text-zinc-500">
                                    client -&gt; gRPC -&gt; syscore_vm -&gt; python_trace -&gt; delta_stream -&gt; client
                                </div>
                            </div>
                        </div>

                        {/* Achievement 3 */}
                        <div className="flex flex-col md:flex-row gap-8 border-l border-zinc-800 pl-8 relative">
                            <div className="absolute -left-1.5 top-0 w-3 h-3 bg-zinc-800 border border-zinc-600"></div>
                            <div className="md:w-1/3">
                                <h3 className="text-xl font-bold text-white mb-2">Deterministic Replay</h3>
                                <div className="inline-block px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] border border-purple-500/20 mb-4">TIME TRAVEL</div>
                            </div>
                            <div className="md:w-2/3">
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Because we capture the full state delta, "undo" is trivial. We enable time-travel debugging by simply traversing the state history array. No re-execution is required to step back.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Auth CTA */}
            <section className="py-24 border-t border-white/10 relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="max-w-lg mx-auto bg-[#0A0A0A] border border-zinc-800 p-12 shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>

                        <Lock className="mx-auto text-zinc-600 mb-6" size={32} />

                        <h2 className="text-2xl font-bold text-white mb-4 font-sans">Initialize Session</h2>
                        <p className="text-zinc-400 text-sm mb-8">
                            Authentication required for runtime access. Your environment states are persisted encrypted at rest.
                        </p>

                        <Button
                            size="lg"
                            onClick={() => navigate('/platform')}
                            className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-none border-b-4 border-zinc-300 active:border-b-0 active:translate-y-1 transition-all"
                        >
                            <Zap className="mr-2 fill-black" size={16} /> AUTHENTICATE_USER
                        </Button>
                        <div className="mt-4 text-[10px] text-zinc-600 font-mono uppercase">
                            Verified via Google OAuth 2.0
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};
