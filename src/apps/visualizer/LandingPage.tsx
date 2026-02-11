import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProductNavbar } from '../../components/layout/ProductNavbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { 
    ArrowRight, 
    Terminal, 
    Cpu, 
    Zap, 
    Layers, 
    Database, 
    Network, 
    Lock, 
    GitCompare, 
    Activity,
    Box,
    ShieldCheck
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

/**
 * SympathyLanding - Multi-language execution visualizer landing page
 * Redesigned for "Cyber-Physical Schematics" theme
 */

// --- Constants & Data ---

type SupportedLanguage = 'python' | 'cpp';

const CODE_EXAMPLES: Record<SupportedLanguage, { filename: string; lines: React.ReactNode[] }> = {
    python: {
        filename: './trace/heap_alloc.py',
        lines: [
            <><span className="text-green-400">def</span> <span className="text-blue-400">heap_alloc</span>(size: int):</>,
            <>&nbsp;&nbsp;ptr = <span className="text-yellow-400">ctypes.malloc</span>(size)</>,
            <>&nbsp;&nbsp;<span className="text-green-400">if</span> <span className="text-orange-400">not</span> ptr:</>,
            <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400">raise</span> MemoryError()</>,
            <>&nbsp;&nbsp;<span className="text-green-400">return</span> ptr</>,
        ],
    },
    cpp: {
        filename: './trace/heap_alloc.cpp',
        lines: [
            <><span className="text-blue-400">void</span>* <span className="text-yellow-400">heap_alloc</span>(<span className="text-blue-400">size_t</span> size) {'{'}</>,
            <>&nbsp;&nbsp;<span className="text-blue-400">void</span>* ptr = <span className="text-yellow-400">malloc</span>(size);</>,
            <>&nbsp;&nbsp;<span className="text-green-400">if</span> (!ptr) {'{'}</>,
            <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-red-400">throw</span> std::bad_alloc();</>,
            <>&nbsp;&nbsp;{'}'} <span className="text-green-400">return</span> ptr; {'}'}</>,
        ],
    },
};

const LANGUAGE_META: Record<SupportedLanguage, { label: string; color: string }> = {
    python: { label: 'Python', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
    cpp: { label: 'C++', color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
};

// --- Components ---

const GridBackground = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>
    </div>
);

const SectionHeading = ({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) => (
    <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight font-display uppercase">
            {children}
        </h2>
        {subtitle && (
            <p className="text-zinc-400 font-sans max-w-2xl text-lg leading-relaxed">
                {subtitle}
            </p>
        )}
    </div>
);

export const SympathyLanding = () => {
    const navigate = useNavigate();
    const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>('python');
    const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

    const currentExample = CODE_EXAMPLES[activeLanguage];

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-300 overflow-x-hidden selection:bg-green-500/30 selection:text-green-100">
            {/* Font Injection */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@300;400;600;700;800&display=swap');
                .font-display { font-family: 'Manrope', sans-serif; }
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .font-sans { font-family: 'Manrope', sans-serif; }
                @keyframes scan {
                  0% { top: 0%; opacity: 0; }
                  50% { opacity: 1; }
                  100% { top: 100%; opacity: 0; }
                }
            `}</style>

            <ProductNavbar />

            {/* --- Hero Section --- */}
            <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6 overflow-hidden">
                <GridBackground />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        
                        {/* Left: Copy (60%) */}
                        <div className="flex-1 w-full lg:max-w-[60%] text-left">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-3 px-3 py-1 bg-green-950/30 border border-green-500/20 text-green-400 text-xs font-mono tracking-widest uppercase mb-8"
                            >
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                System Online
                            </motion.div>

                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-6xl md:text-8xl font-display font-extrabold tracking-tighter text-white mb-8 leading-[0.9]"
                            >
                                EXECUTE.<br />
                                <span className="text-zinc-600">VISUALIZE.</span><br />
                                UNDERSTAND.
                            </motion.h1>

                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-xl text-zinc-400 mb-10 max-w-xl leading-relaxed font-sans font-light"
                            >
                                The first multi-language runtime x-ray. See the heap, stack, and threads in real-time. 
                                <span className="text-white font-medium"> Stop guessing. See the memory.</span>
                            </motion.p>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-wrap gap-4"
                            >
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/platform/execution')}
                                    className="h-14 px-8 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-mono font-bold text-sm tracking-widest border border-green-500/50 shadow-[0_0_20px_rgba(74,222,128,0.15)] flex items-center gap-3 group transition-all rounded-none uppercase"
                                >
                                    <Terminal size={18} className="group-hover:translate-x-1 transition-transform" />
                                    Launch_Console
                                </Button>
                                <a 
                                    href="#engineering" 
                                    className="h-14 px-8 flex items-center gap-2 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white font-mono text-sm font-bold tracking-widest hover:bg-zinc-900 transition-all uppercase"
                                >
                                    Sys_Specs <ArrowRight size={16} />
                                </a>
                            </motion.div>
                        </div>

                        {/* Right: Interactive Code Preview (40%) - Tilted */}
                        <motion.div 
                            initial={{ opacity: 0, x: 50, rotateY: -10, rotateX: 5 }}
                            animate={{ opacity: 1, x: 0, rotateY: -10, rotateX: 5 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex-1 w-full lg:max-w-[40%] perspective-[1000px] hidden md:block"
                            style={{ transformStyle: 'preserve-3d', transform: 'perspective(1000px) rotateY(-12deg) rotateX(6deg)' }}
                        >
                            <div className="relative border border-white/10 bg-zinc-900/80 backdrop-blur-md shadow-2xl overflow-hidden rounded-sm group">
                                {/* Window Controls */}
                                <div className="h-10 bg-zinc-950 border-b border-white/5 flex items-center px-4 justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                                        <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                                        <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                                    </div>
                                    <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                                        read-only // 
                                        <span className={activeLanguage === 'python' ? 'text-yellow-400' : 'text-blue-400'}>
                                            {activeLanguage === 'python' ? '3.11.0' : 'clang++-17'}
                                        </span>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-white/5 bg-zinc-950/50">
                                    {(['python', 'cpp'] as SupportedLanguage[]).map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => setActiveLanguage(lang)}
                                            className={twMerge(
                                                "px-6 py-3 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors border-r border-white/5",
                                                activeLanguage === lang
                                                    ? "bg-zinc-900 text-white border-b-2 border-b-green-500"
                                                    : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50"
                                            )}
                                        >
                                            {LANGUAGE_META[lang].label}
                                        </button>
                                    ))}
                                </div>

                                {/* Code Area */}
                                <div className="p-6 font-mono text-xs relative min-h-[300px] bg-zinc-900/80">
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent h-[100px] w-full animate-[scan_3s_ease-in-out_infinite] pointer-events-none z-20"></div>
                                    
                                    <div className="space-y-1.5 relative z-10">
                                        {currentExample.lines.map((line, idx) => (
                                            <div key={idx} className="flex group/line">
                                                <span className={twMerge(
                                                    "w-8 text-zinc-700 select-none text-right pr-4 border-r border-zinc-800 mr-4",
                                                    idx === 0 && "text-green-500/80"
                                                )}>
                                                    {String(idx + 1).padStart(2, '0')}
                                                </span>
                                                <span className="opacity-90">{line}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Live Variable Sidebar (Mock) */}
                                    <div className="absolute top-6 right-6 w-40 border border-white/5 bg-zinc-950/90 p-3 shadow-xl">
                                        <div className="text-[9px] uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1 mb-2">Stack Frame</div>
                                        <div className="space-y-2 font-mono text-[10px]">
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">ptr</span>
                                                <span className="text-green-400">0x7FF...A0</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">size</span>
                                                <span className="text-blue-400">256</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Bento Grid Features --- */}
            <section className="py-32 px-6 border-t border-white/5 relative bg-zinc-900/30">
                <div className="max-w-7xl mx-auto">
                   <SectionHeading subtitle="Advanced instrumentation modules designed for deep inspection of runtime behavior.">
                       Core Modules
                   </SectionHeading>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-auto md:grid-rows-[300px_300px] gap-4">
                        
                        {/* Cell 1: CPU Flame Graph (2x2) */}
                        <div 
                            className={twMerge(
                                "col-span-1 md:col-span-2 md:row-span-2 relative group overflow-hidden border bg-zinc-900/50 backdrop-blur-sm transition-all duration-300",
                                hoveredFeature && hoveredFeature !== 'flame' ? "opacity-40 border-zinc-800" : "opacity-100 border-zinc-700 hover:border-green-500/50"
                            )}
                            onMouseEnter={() => setHoveredFeature('flame')}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="p-8 h-full flex flex-col justify-between relative z-10">
                                <div>
                                    <div className="w-10 h-10 border border-zinc-700 bg-zinc-950 flex items-center justify-center mb-6 text-orange-400">
                                        <Cpu size={20} />
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-white mb-2">CPU Flame Graph</h3>
                                    <p className="text-zinc-400 font-sans text-sm max-w-sm">
                                        Analyze execution time per instruction with high-precision timestamping. Identify bottlenecks instantly.
                                    </p>
                                </div>
                                <div className="w-full h-32 flex items-end gap-1 mt-8 opacity-50 group-hover:opacity-100 transition-opacity">
                                    {[40, 70, 45, 90, 60, 30, 80, 50, 95, 20, 60, 80].map((h, i) => (
                                        <div key={i} className="flex-1 bg-orange-500/20 border-t border-orange-500/50" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Cell 2: Stack Tracing (1x2 - Vertical) */}
                        <div 
                            className={twMerge(
                                "col-span-1 md:col-span-1 md:row-span-2 relative group overflow-hidden border bg-zinc-900/50 backdrop-blur-sm transition-all duration-300",
                                hoveredFeature && hoveredFeature !== 'stack' ? "opacity-40 border-zinc-800" : "opacity-100 border-zinc-700 hover:border-blue-500/50"
                            )}
                            onMouseEnter={() => setHoveredFeature('stack')}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="p-8 h-full flex flex-col relative z-10">
                                <div className="w-10 h-10 border border-zinc-700 bg-zinc-950 flex items-center justify-center mb-6 text-blue-400">
                                    <Layers size={20} />
                                </div>
                                <h3 className="text-xl font-display font-bold text-white mb-2">Stack Tracer</h3>
                                <p className="text-zinc-400 font-sans text-sm mb-8">
                                    Visualize function calls, recursion, and return addresses vertically.
                                </p>
                                <div className="space-y-2 flex-1 overflow-hidden font-mono text-[10px] text-blue-300/70">
                                    <div className="p-2 border border-blue-500/20 bg-blue-500/5">main()</div>
                                    <div className="p-2 border border-blue-500/20 bg-blue-500/5 ml-2">process_data()</div>
                                    <div className="p-2 border border-blue-500/20 bg-blue-500/5 ml-4">parse()</div>
                                    <div className="p-2 border border-blue-500/40 bg-blue-500/10 ml-6 text-white">validate()</div>
                                </div>
                            </div>
                        </div>

                        {/* Cell 3: Heap Visualization (2x1) */}
                        <div 
                            className={twMerge(
                                "col-span-1 md:col-span-2 md:col-start-3 md:row-start-3 relative group overflow-hidden border bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 h-[250px]", // Explicit height for row-3 items if needed, or rely on grid
                                hoveredFeature && hoveredFeature !== 'heap' ? "opacity-40 border-zinc-800" : "opacity-100 border-zinc-700 hover:border-green-500/50"
                            )}
                            style={{ gridColumn: "span 2" }} // Force span for visual consistency
                            onMouseEnter={() => setHoveredFeature('heap')}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="p-8 h-full relative z-10 flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex-1">
                                    <div className="w-10 h-10 border border-zinc-700 bg-zinc-950 flex items-center justify-center mb-6 text-green-400">
                                        <Database size={20} />
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-white mb-2">Heap Visualization</h3>
                                    <p className="text-zinc-400 font-sans text-sm">
                                        Track object allocations, references, and GC cycles in real-time.
                                    </p>
                                </div>
                                <div className="flex-1 hidden md:flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                                     <Network className="text-green-500" size={64} />
                                </div>
                            </div>
                        </div>
                        
                         {/* Cell 4: Comparison Mode (Rest of space) */}
                         <div 
                            className={twMerge(
                                "col-span-1 md:col-span-1 md:col-start-1 md:row-start-3 relative group overflow-hidden border bg-zinc-900/50 backdrop-blur-sm transition-all duration-300",
                                hoveredFeature && hoveredFeature !== 'compare' ? "opacity-40 border-zinc-800" : "opacity-100 border-zinc-700 hover:border-yellow-500/50"
                            )}
                            onMouseEnter={() => setHoveredFeature('compare')}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                             <div className="p-8 h-full relative z-10">
                                <div className="w-10 h-10 border border-zinc-700 bg-zinc-950 flex items-center justify-center mb-6 text-yellow-400">
                                    <GitCompare size={20} />
                                </div>
                                <h3 className="text-lg font-display font-bold text-white mb-2">Diff Mode</h3>
                                <p className="text-zinc-400 font-sans text-xs">
                                    Benchmark Python vs C++ execution side-by-side.
                                </p>
                            </div>
                        </div>

                         {/* Cell 5: SysCore Sandbox (Small) */}
                         <div 
                            className={twMerge(
                                "col-span-1 md:col-span-1 md:col-start-2 md:row-start-3 relative group overflow-hidden border bg-zinc-900/50 backdrop-blur-sm transition-all duration-300",
                                hoveredFeature && hoveredFeature !== 'syscore' ? "opacity-40 border-zinc-800" : "opacity-100 border-zinc-700 hover:border-red-500/50"
                            )}
                            onMouseEnter={() => setHoveredFeature('syscore')}
                            onMouseLeave={() => setHoveredFeature(null)}
                        >
                            <div className="p-8 h-full relative z-10 flex flex-col justify-center items-center text-center">
                                <ShieldCheck size={32} className="text-red-400 mb-4" />
                                <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest">SysCore Safe</h3>
                                <div className="mt-2 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5">
                                    SANDBOX ACTIVE
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- Engineering Section (Schematics) --- */}
            <section id="engineering" className="py-24 px-6 relative bg-zinc-950 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <SectionHeading subtitle="Sympathy isn't a debugger wrapper. We built custom execution tracers for each supported language.">
                        Engineering Architecture
                    </SectionHeading>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
                         {[
                            {
                                title: "Multi-Language Tracers",
                                badge: "CORE ENGINE",
                                colorClass: "bg-green-500",
                                badgeClasses: "bg-green-500/10 text-green-400 border-green-500/20",
                                icon: <Activity />,
                                desc: "Language-specific instrumentation capturing every opcode. Python uses sys.settrace; C++ uses LLVM instrumentation."
                            },
                            {
                                title: "SysCore Sandbox",
                                badge: "SECURITY",
                                colorClass: "bg-orange-500",
                                badgeClasses: "bg-orange-500/10 text-orange-400 border-orange-500/20",
                                icon: <Box />,
                                desc: "User code executes within ephemeral Docker containers. Custom gRPC streams ensure <50ms latency."
                            },
                            {
                                title: "Time-Travel Debugging",
                                badge: "REPLAY",
                                colorClass: "bg-blue-500",
                                badgeClasses: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                                icon: <GitCompare />,
                                desc: "Full state deltas enable instant 'undo'. Step backwards through execution history by traversing the immutable state array."
                            }
                        ].map((item, i) => (
                            <div key={i} className="relative pl-8 border-l border-zinc-800 group hover:border-zinc-600 transition-colors">
                                <div className={twMerge("absolute -left-[5px] top-0 w-2.5 h-2.5 ring-4 ring-zinc-950 group-hover:scale-125 transition-transform", item.colorClass)}></div>
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-white mb-2 font-display">{item.title}</h3>
                                    <span className={twMerge("inline-block px-2 py-0.5 text-[10px] border font-mono", item.badgeClasses)}>
                                        {item.badge}
                                    </span>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Footer CTA --- */}
            <section className="py-32 border-t border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="max-w-2xl mx-auto">
                        <Lock className="mx-auto text-green-500 mb-8 opacity-50" size={48} />
                        
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                            Ready to debug?
                        </h2>
                        <p className="text-zinc-400 mb-10 text-lg font-sans">
                            Authentication required for runtime access. Traces are encrypted at rest.
                        </p>

                        <Button
                            size="lg"
                            onClick={() => navigate('/auth')}
                            className="w-full md:w-auto min-w-[300px] h-16 bg-green-500 hover:bg-green-400 text-black font-mono font-bold text-lg tracking-widest border border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.3)] transition-all rounded-none uppercase flex items-center justify-center gap-3"
                        >
                            <Zap size={20} /> Authenticate_User
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default SympathyLanding;
