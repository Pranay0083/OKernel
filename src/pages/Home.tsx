import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Zap, Layers, Clock, Terminal, ChevronRight, CheckCircle2, Circle, ArrowRight, Cpu, Lock } from 'lucide-react';

export const Home = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 border-b border-border bg-black/40 overflow-hidden">
                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-mono rounded-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            V0.2.0 SYSCORE ENGINE ACTIVE
                        </div>

                        <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
                            O<span className="text-primary glow-text">Kernel</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                            The definitive interactive platform for mastering Operating System concepts.
                            <br />
                            <span className="text-zinc-400">Powered by the <strong>SysCore</strong> engine. Toggle bits, not just slides.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-start pt-4">
                            <Link to="/console">
                                <Button size="lg" className="rounded-full px-10 text-lg h-16 bg-green-500 hover:bg-green-400 text-black font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all">
                                    <Terminal className="mr-2" /> Boot SysCore
                                </Button>
                            </Link>
                            <a href="https://github.com" target="_blank" rel="noreferrer">
                                <Button size="lg" variant="outline" className="rounded-full px-8 h-16 border-zinc-700 hover:bg-white/5">
                                    View Source Code
                                </Button>
                            </a>
                        </div>
                    </div>

                    <div className="relative hidden lg:block">
                        {/* Terminal Window Mockup */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl shadow-2xl overflow-hidden font-mono text-xs transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <div className="bg-zinc-900/50 px-4 py-3 flex items-center gap-2 border-b border-zinc-800/50">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                </div>
                                <div className="ml-auto text-zinc-600 font-bold">root@okernel:~</div>
                            </div>
                            <div className="p-8 space-y-4 text-zinc-400 text-sm">
                                <p><span className="text-green-500">➜</span> <span className="text-blue-400">~</span> syscore_init --level=verbose</p>
                                <div className="space-y-1 pl-4 border-l-2 border-zinc-800">
                                    <p className="text-zinc-500">[SYSCORE] Loading modules...</p>
                                    <p className="text-zinc-500">[SYSCORE] CPU Scheduler... <span className="text-green-500">OK</span></p>
                                    <p className="text-zinc-500">[SYSCORE] Memory Paging... <span className="text-yellow-500">PENDING</span></p>
                                    <p className="text-zinc-500">[SYSCORE] IO Subsystem... <span className="text-green-500">OK</span></p>
                                </div>
                                <p className="text-white">
                                    <span className="text-blue-500">[SUCCESS]</span> Environment Ready. Welcome, User.
                                </p>
                                <p><span className="text-green-500">➜</span> <span className="text-blue-400">~</span> <span className="animate-pulse block w-2 h-4 bg-green-500"></span></p>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
                    </div>
                </div>
            </section>

            {/* The Mission / Story Section */}
            <section className="py-24 border-b border-white/5 bg-zinc-900/10">
                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight">From Textbooks to <span className="text-green-500">Live Traces</span></h2>
                        <div className="space-y-4 text-zinc-400 text-lg leading-relaxed">
                            <p>
                                We've all been there. Staring at static Gantt charts in an Operating Systems textbook, trying to visualize how specific CPU bursts actually interleave.
                            </p>
                            <p>
                                <strong className="text-white">OKernel</strong> was born from that frustration. We wanted to build a bridge between abstract theory and silicon reality.
                            </p>
                            <p>
                                By simulating the <span className="text-white font-mono">Process Control Block</span> down to the cycle, we turn "learning" into "debugging".
                            </p>
                        </div>
                        <div className="pt-4 flex items-center gap-8">
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">10k+</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Cycles Simulated</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">Open</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Source (MIT)</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-[300px] rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                        <div className="relative z-10 text-center space-y-2">
                            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                                <Terminal size={32} className="text-green-500" />
                            </div>
                            <div className="font-mono text-xl font-bold">SysCore Engine v0.2.0</div>
                            <div className="font-mono text-xs text-zinc-500">Cycle-Accurate Scheduler</div>
                        </div>

                        {/* Animated Code Overlay */}
                        <div className="absolute top-4 left-4 right-4 bottom-4 border border-dashed border-zinc-800 rounded-xl opacity-50"></div>
                    </div>
                </div>
            </section>

            {/* System Hardware Grid (Modules) - Redesigned for NON-AI Vibe */}
            <section className="py-32 container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono rounded-full mb-6">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        SYSTEM ARCHITECTURE MAP
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight mb-4">Kernel Components</h2>
                    <p className="text-zinc-500">Directly interface with simulated hardware modules.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* CPU Unit */}
                    <Link to="/console" className="group relative bg-zinc-950 border border-zinc-800 hover:border-green-500/50 transition-colors rounded-xl overflow-hidden min-h-[320px] flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="p-8 flex-1">
                            <div className="w-12 h-12 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-shadow">
                                <Cpu size={24} className="text-zinc-400 group-hover:text-green-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold font-mono text-white mb-2">/dev/scheduler</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                                Core processing unit simulation. Handles context switching, interrupt vectors, and process queue management.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">Round Robin</div>
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">SJF</div>
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">Multilevel</div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
                            <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest">● Online</span>
                            <ArrowRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                    </Link>

                    {/* MMU Unit */}
                    <div className="group relative bg-zinc-950 border border-zinc-800 transition-colors rounded-xl overflow-hidden min-h-[320px] flex flex-col opacity-75 hover:opacity-100">

                        <div className="p-8 flex-1">
                            <div className="w-12 h-12 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center mb-6">
                                <Layers size={24} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold font-mono text-white mb-2">/dev/mem</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                                Virtual memory management unit (MMU). Visualizes paging, TLB lookups, and segmentation faults.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">Paging</div>
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">LRU Cache</div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
                            <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest">● In Development</span>
                        </div>
                    </div>

                    {/* Deadlock Unit */}
                    <div className="group relative bg-zinc-950 border border-zinc-800 transition-colors rounded-xl overflow-hidden min-h-[320px] flex flex-col opacity-75 hover:opacity-100">

                        <div className="p-8 flex-1">
                            <div className="w-12 h-12 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center mb-6">
                                <Lock size={24} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold font-mono text-white mb-2">/dev/mutex</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                                Concurrency control subsystem. Models semaphores, mutex locks, and the Banker's Algorithm.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">Semaphores</div>
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">Banker's</div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
                            <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest">● In Development</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact / Testimonials */}
            <section className="py-24 border-t border-zinc-800 bg-zinc-900/20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Testimonial
                            quote="Finally, a tool that actually shows what happens during a Context Switch. Saved my OS final."
                            author="Alex Chen"
                            role="CS Student, MIT"
                        />
                        <Testimonial
                            quote="I use kernelOne to demonstrate scheduling anomalies to my juniors. The visual clarity is unmatched."
                            author="Sarah Miller"
                            role="Senior Systems Engineer"
                        />
                        <Testimonial
                            quote="The 'Hardware' accurate mode is brilliant. It forced me to understand PCB overhead."
                            author="Davide Russo"
                            role="Embedded Developer"
                        />
                    </div>
                </div>
            </section>

            {/* System Showcase (Screenshots) */}
            <section className="py-24 bg-zinc-950 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Terminal Uplink</h2>
                        <p className="text-muted-foreground font-mono">user@kernel:~$ view_interface</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="group rounded border border-zinc-800 bg-zinc-900 p-2 transform hover:-translate-y-2 transition-transform duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <div className="aspect-video bg-black rounded overflow-hidden relative">
                                <img src="/console_preview.png" alt="Console Interface" className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                                <div className="absolute top-2 left-2 flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                            </div>
                            <div className="p-4 font-mono text-xs">
                                <h3 className="font-bold text-white mb-1">BASH Emulator</h3>
                                <p className="text-zinc-500">Full command history & auto-complete.</p>
                            </div>
                        </div>

                        <div className="group rounded border border-zinc-800 bg-zinc-900 p-2 transform hover:-translate-y-2 transition-transform duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <div className="aspect-video bg-black rounded overflow-hidden relative">
                                <img src="/visualizer_preview.png" alt="Visualizer Interface" className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                                <div className="absolute top-2 left-2 flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                            </div>
                            <div className="p-4 font-mono text-xs">
                                <h3 className="font-bold text-white mb-1">PCB Visualizer</h3>
                                <p className="text-zinc-500">Memory map & process table tracking.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feedback & Community */}
            <section className="py-24 container mx-auto px-4">
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden bg-zinc-900/50">
                    <h2 className="text-2xl font-bold mb-4 font-mono">kernel_panic(FEEDBACK_NEEDED)</h2>
                    <p className="text-zinc-400 max-w-xl mx-auto mb-10 text-sm font-mono">
                        Input stream required. Reporting bugs improves system stability.
                    </p>

                    <form className="max-w-md mx-auto space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="flex gap-4">
                            <span className="py-3 text-green-500 font-mono text-lg">&gt;</span>
                            <input type="text" placeholder="echo 'Your feedback here...'" className="w-full bg-transparent border-b border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors font-mono py-2" />
                        </div>
                        <Button size="sm" className="w-full rounded bg-zinc-800 text-white hover:bg-zinc-700 font-mono h-10 border border-zinc-700">
                            Execute Send()
                        </Button>
                    </form>
                </div>
            </section>

        </Layout>
    );
};

const Testimonial = ({ quote, author, role }: { quote: string, author: string, role: string }) => (
    <div className="p-8 rounded bg-black border border-zinc-800 relative">
        <div className="text-4xl text-zinc-800 absolute top-4 left-4 font-serif">"</div>
        <p className="text-zinc-300 relative z-10 mb-6 leading-relaxed text-sm">
            {quote}
        </p>
        <div>
            <div className="font-bold text-white text-sm">{author}</div>
            <div className="text-xs text-zinc-500 font-mono">{role}</div>
        </div>
    </div>
);
