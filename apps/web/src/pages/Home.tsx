import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Zap, Layers, Clock, Terminal, ArrowRight, Cpu, Lock, Heart, BarChart3 } from 'lucide-react';

import { useSystemConfig } from '../hooks/useSystemConfig';

interface PollVotes {
    javascript: number;
    rust: number;
    go: number;
    java: number;
    cpp: number;
}

export const Home = () => {
    const { config } = useSystemConfig();
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [testimonials, setTestimonials] = useState<{ message: string; name: string; role?: string }[]>([]);
    const [pollVotes, setPollVotes] = useState<PollVotes>({ javascript: 0, rust: 0, go: 0, java: 0, cpp: 0 });

    React.useEffect(() => {
        // Redirect if already logged in, but only once per session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                const hasRedirected = sessionStorage.getItem('dashboard_redirected');
                if (!hasRedirected) {
                    sessionStorage.setItem('dashboard_redirected', 'true');
                    navigate('/dashboard');
                }
            }
        });
    }, [navigate]);

    React.useEffect(() => {
        const fetchTestimonials = async () => {
            const { data } = await supabase
                .from('featured_reviews')
                .select('message, name, role')
                .order('rank', { ascending: true }) // Order by Rank
                .order('created_at', { ascending: false }) // Fallback
                .limit(10);

            if (data && data.length > 0) {
                setTestimonials(data);
            }
        };
        fetchTestimonials();
    }, []);

    React.useEffect(() => {
        const fetchPollVotes = async () => {
            const { data, error } = await supabase
                .from('language_poll')
                .select('language, votes')
                .order('language');

            if (data && !error) {
                const voteMap: PollVotes = { javascript: 0, rust: 0, go: 0, java: 0, cpp: 0 };
                data.forEach((row: { language: string; votes: number }) => {
                    if (row.language in voteMap) {
                        voteMap[row.language as keyof PollVotes] = row.votes;
                    }
                });
                setPollVotes(voteMap);
            }
        };
        fetchPollVotes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setStatus('loading');
        try {
            const { error } = await supabase
                .from('user_feedback')
                .insert([{
                    message: feedback,
                    name: name || null, // Send null if empty
                    email: email || null,
                    version: 'v1.0.1',
                    user_agent: navigator.userAgent
                }]);

            if (error) throw error;
            setStatus('success');
            setFeedback('');
            setName('');
            setEmail('');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <Layout>
            {/* NEW: Aether Terminal Banner */}
            <section className="pt-20 pb-12 relative border-b border-purple-500/20 bg-zinc-950/80 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_70%)] pointer-events-none"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/20 border border-purple-500/30 text-purple-400 text-xs font-mono rounded-full mb-4 animate-pulse">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        NEW PRODUCT RELEASE
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
                        Aether <span className="text-purple-500">Terminal</span>
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
                        The <span className="text-white font-medium">Next-Gen</span> terminal emulator for macOS.
                        <span className="text-zinc-500 text-sm block mt-1">(Only 2MB in size)</span>
                        <span className="text-purple-400 font-mono text-base block mt-4">Fast. Configurable. Beautiful.</span>
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/aether">
                            <Button size="lg" className="h-12 px-6 text-base bg-white text-black hover:bg-zinc-200 font-bold rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                Discover Aether &rarr;
                            </Button>
                        </Link>
                        <Link to="/code-tracer">
                            <Button size="lg" variant="outline" className="h-12 px-6 text-base border-zinc-700 hover:bg-zinc-800 font-bold rounded-full">
                                Code Tracer
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Original Hero Section (Restored) */}
            <section className="relative pt-16 pb-16 md:pt-24 md:pb-24 border-b border-border bg-black/40 overflow-hidden">
                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

                    <div className="space-y-10">
                        <div className="flex items-center gap-2">
                            <Link to="/algo-wiki">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-mono rounded-md animate-in">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                    UNDERSTAND OPERATING SYSTEMS
                                </div>
                            </Link>

                            <Link to="/sponsor" className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-mono rounded-md hover:bg-pink-500/20 transition-colors animate-in">
                                <Heart size={10} className="fill-current" />
                                <span>SPONSOR</span>
                            </Link>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-tight animate-in delay-100">
                            Execute <span className="text-primary glow-text">Theory.</span>
                            <br />
                            <span className="text-white">Visualize RAM.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed animate-in delay-200">
                            Stop staring at Gantt charts.
                            <br />
                            <span className="text-zinc-400">Boot a <strong>real Virtual Machine</strong> in your browser. Write C, manage Memory, and watch the Kernel panic safely.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-start pt-4 animate-in delay-300">
                            <Link to="/shell-maker">
                                <Button size="lg" className="rounded-full px-10 text-lg h-16 bg-green-500 hover:bg-green-400 text-black font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all">
                                    <Terminal className="mr-2" /> Launch Shell Maker
                                </Button>
                            </Link>
                            <Link to="/cpu-scheduler">
                                <Button size="lg" variant="outline" className="rounded-full px-8 h-16 border-zinc-700 hover:bg-white/5">
                                    <Cpu className="mr-2 size-4" /> Launch CPU Scheduler
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative hidden lg:block animate-in delay-500">
                        {/* Terminal Window Mockup */}
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl shadow-2xl overflow-hidden font-mono text-xs transform rotate-1 hover:rotate-0 transition-transform duration-500 group">
                            <div className="bg-zinc-900/50 px-4 py-3 flex items-center gap-2 border-b border-zinc-800/50">
                                <div className="ml-auto text-zinc-600 font-bold">root@syscore-v2:~/kernel#</div>
                            </div>
                            <div className="p-8 space-y-4 text-zinc-400 text-sm">
                                <p><span className="text-green-500">➜</span> <span className="text-blue-400">~/kernel</span> ./init_syscore.o</p>
                                <div className="space-y-1 pl-4 border-l-2 border-zinc-800">
                                    <p className="text-zinc-500 typing-effect">[BOOT] Virtual Memory Manager... <span className="text-green-500">ACTIVE</span></p>
                                    <p className="text-zinc-500 typing-effect delay-200">[BOOT] Allocating 256MB Heap... <span className="text-green-500">OK</span></p>
                                    <p className="text-zinc-500 typing-effect delay-500">[BOOT] Loading Process Scheduler... <span className="text-green-500">READY</span></p>
                                </div>
                                <div className="p-4 bg-zinc-900 rounded border border-zinc-800 font-mono text-xs text-zinc-300 mt-4 group-hover:scale-[1.02] transition-transform">
                                    <span className="text-purple-400">int</span> main() {'{'}<br />
                                    &nbsp;&nbsp;<span className="text-yellow-400">printf</span>(<span className="text-green-300">"Hello Kernel!\n"</span>);<br />
                                    &nbsp;&nbsp;<span className="text-blue-400">void</span>* ptr = <span className="text-yellow-400">malloc</span>(1024);<br />
                                    &nbsp;&nbsp;<span className="text-zinc-500">// Real pointer arithmetic supported</span><br />
                                    {'}'}
                                </div>
                                <p><span className="text-green-500">➜</span> <span className="text-blue-400">~</span> <span className="animate-pulse block w-2 h-4 bg-green-500"></span></p>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
                    </div>
                </div>
            </section>

            {/* Story Section: Static vs Dynamic */}
            <section className="py-16 md:py-32 border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]"></div>

                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-xs font-mono rounded-full mb-6 backdrop-blur-sm">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            THE PARADIGM SHIFT
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            Operating Systems is <span className="text-red-500 line-through decoration-2 decoration-white/20">Theory</span>.
                            <br />
                            <span className="text-white">Operating Systems is <span className="text-green-500">Live</span>.</span>
                        </h2>
                        <p className="text-zinc-400 text-lg leading-relaxed">
                            For decades, we learned Concurrency from static diagrams and Scheduling from Excel sheets.
                            OKernel changes the game by running a <strong className="text-white">cycle-accurate simulation</strong> of the hardware itself.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        {/* Old Way */}
                        <div className="relative group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50">
                            <div className="p-8 relative z-10">
                                <h3 className="text-xl font-bold text-zinc-500 mb-2">The Old Way</h3>
                                <p className="text-zinc-600 text-sm">Static Gantt Charts. Zero interactivity. Memorization over understanding.</p>
                            </div>
                            <div className="mt-8 p-6 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                                {/* CSS Gantt Chart Mockup */}
                                <div className="space-y-3">
                                    <div className="flex gap-2 items-center">
                                        <div className="w-12 text-xs text-zinc-600">P1</div>
                                        <div className="flex-1 h-6 bg-zinc-800 rounded relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-zinc-700"></div>
                                            <div className="absolute left-2/3 top-0 bottom-0 w-1/4 bg-zinc-700"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <div className="w-12 text-xs text-zinc-600">P2</div>
                                        <div className="flex-1 h-6 bg-zinc-800 rounded relative overflow-hidden">
                                            <div className="absolute left-1/3 top-0 bottom-0 w-1/3 bg-zinc-600"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <div className="w-12 text-xs text-zinc-600">P3</div>
                                        <div className="flex-1 h-6 bg-zinc-800 rounded relative overflow-hidden">
                                            <div className="absolute right-0 top-0 bottom-0 w-1/12 bg-zinc-500"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between text-[10px] text-zinc-700 font-mono">
                                    <span>0ms</span>
                                    <span>5ms</span>
                                    <span>10ms</span>
                                    <span>15ms</span>
                                </div>
                            </div>
                        </div>

                        {/* New Way */}
                        <div className="relative group overflow-hidden rounded-2xl border border-primary/20 bg-zinc-950/80 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="p-8 pb-0 relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold text-white">The SysCore Way</h3>
                                    <div className="px-2 py-0.5 rounded bg-green-500/20 text-green-500 text-[10px] font-bold tracking-wider uppercase">Live Render</div>
                                </div>
                                <p className="text-zinc-400 text-sm">Real-time Heap inspection. Visualized Stack frames. Hardware Interrupts.</p>
                            </div>

                            {/* Live Code/Visuals Mockup */}
                            <div className="mt-8 relative font-mono text-xs p-6 bg-black/50 border-t border-zinc-800/50 min-h-[200px] flex flex-col gap-2">
                                <div className="flex gap-2 mb-2">
                                    <div className="flex-1 h-2 bg-zinc-800 rounded animate-pulse"></div>
                                    <div className="flex-1 h-2 bg-zinc-800 rounded animate-pulse delay-75"></div>
                                    <div className="flex-1 h-2 bg-zinc-800 rounded animate-pulse delay-150"></div>
                                </div>
                                <div className="text-green-500">
                                    $ ./scheduler --algo=RR --quantum=4
                                </div>
                                <div className="text-zinc-500 pl-4 border-l border-zinc-800">
                                    [CPU] Context Switch (P1 -&gt; P2)<br />
                                    [MEM] P2 Loaded to 0x4000 (Frame 4)<br />
                                    [RAM] <span className="text-yellow-500">Writing 4KB Page...</span>
                                </div>
                                <div className="mt-auto flex justify-between items-center text-zinc-600">
                                    <span>CPU0: 45%</span>
                                    <span>RAM: 12MB/1024MB</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Spotlight: SysCore Engine 2 */}
            <section className="py-16 md:py-32 bg-zinc-950 border-b border-zinc-800">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/10 border border-blue-500/20 text-blue-400 text-xs font-mono rounded-full">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                SYSCORE ENGINE 2
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                                See the <span className="text-blue-500">Digital Biology</span> of your Computer.
                            </h2>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                Most visualizers hide the details. We expose them.
                                SysCore Engine 2 maps every byte of memory, track every stack frame, and visualize the heap in real-time.
                            </p>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <div>
                                    <div className="text-white font-bold mb-1 flex items-center gap-2">
                                        <Layers className="text-blue-500" size={16} /> 1MB RAM Matrix
                                    </div>
                                    <p className="text-xs text-zinc-500">Live heatmap of physical memory pages.</p>
                                </div>
                                <div>
                                    <div className="text-white font-bold mb-1 flex items-center gap-2">
                                        <Zap className="text-yellow-500" size={16} /> C-Transpiler
                                    </div>
                                    <p className="text-xs text-zinc-500">Compiles C code to JS Safe-Sandbox.</p>
                                </div>
                                <div>
                                    <div className="text-white font-bold mb-1 flex items-center gap-2">
                                        <Clock className="text-red-500" size={16} /> Cycle Accurate
                                    </div>
                                    <p className="text-xs text-zinc-500">Step-by-step execution control.</p>
                                </div>
                                <div>
                                    <div className="text-white font-bold mb-1 flex items-center gap-2">
                                        <Terminal className="text-green-500" size={16} /> Shell Kernel
                                    </div>
                                    <p className="text-xs text-zinc-500">Custom <code>int main()</code> entry point.</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            {/* Abstract RAM Visualization */}
                            <div className="aspect-square bg-zinc-900 rounded-2xl border border-zinc-800 p-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
                                <div className="grid grid-cols-12 gap-1 h-full w-full opacity-50 group-hover:opacity-80 transition-opacity">
                                    {Array.from({ length: 144 }).map((_, i) => (
                                        <div key={i} className={`rounded-[2px] ${Math.random() > 0.9 ? 'bg-blue-500 animate-pulse' : 'bg-zinc-800'}`}></div>
                                    ))}
                                </div>
                                {/* Floating Label */}
                                <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur border border-zinc-700 px-4 py-2 rounded-lg text-xs font-mono shadow-xl">
                                    <div className="text-zinc-500">HEAP_STATUS</div>
                                    <div className="text-blue-400">0x7FF02A [ALLOCATED]</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Spotlight: Shell Maker */}
            <section className="py-16 md:py-32 relative">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
                        The <span className="font-mono bg-zinc-800 px-2 rounded">/dev/null</span> is not enough.
                        <br /><span className="text-green-500">Build your own Kernel.</span>
                    </h2>
                    <p className="text-zinc-400 text-lg mb-12">
                        Introducing <strong>Shell Maker</strong>. A dedicated environment where you write the OS.
                        <br />Handle IO, Manage Processes, and avoid Deadlocks.
                    </p>

                    <div className="relative mx-auto rounded-xl border border-zinc-800 bg-black shadow-2xl overflow-hidden text-left max-w-2xl">
                        <div className="bg-zinc-900 px-4 py-2 flex items-center gap-2 border-b border-zinc-800">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-xs text-zinc-500 font-mono ml-2">vim kernel.c</span>
                        </div>
                        <div className="p-6 font-mono text-sm overflow-x-auto">
                            <pre className="text-zinc-300">
                                {`#include <syscore.h>

int main() {
    print("Initializing Kernel...\\n");
    
    // Allocate Stack for Process 1
    int* p1_stack = stack_alloc(1024);
    
    // Fork Process
    if (fork() == 0) {
        exec("user_program");
    }
}`}
                            </pre>
                        </div>
                    </div>

                    <div className="mt-12">
                        <Link to="/shell">
                            <Button className="rounded-full px-8 bg-white text-black hover:bg-zinc-200 font-bold">
                                Start Coding &rarr;
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Education First Section */}
            <section className="py-24 bg-zinc-950 border-y border-zinc-800 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1),transparent_70%)]"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">Don't just run it. <span className="text-green-500">Understand it.</span></h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            OKernel is more than a toy. It's a comprehensive educational suite designed to map directly to University Curriculums.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link to="/os-concepts" className="group p-6 rounded-xl border border-zinc-800 bg-black hover:border-green-500/50 transition-colors">
                            <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center mb-4 group-hover:bg-green-500/10">
                                <Clock className="text-zinc-400 group-hover:text-green-500" size={20} />
                            </div>
                            <h3 className="font-bold text-white mb-2">Scheduling</h3>
                            <p className="text-xs text-zinc-500">FCFS, Round Robin, SJF. Time quantum analysis.</p>
                        </Link>

                        <Link to="/shell" className="group p-6 rounded-xl border border-zinc-800 bg-black hover:border-blue-500/50 transition-colors">
                            <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center mb-4 group-hover:bg-blue-500/10">
                                <Terminal className="text-zinc-400 group-hover:text-blue-500" size={20} />
                            </div>
                            <h3 className="font-bold text-white mb-2">System Calls</h3>
                            <p className="text-xs text-zinc-500">fork(), exec(), wait(). Process lifecycle management.</p>
                        </Link>

                        <Link to="/mutex-visualizer" className="group p-6 rounded-xl border border-zinc-800 bg-black hover:border-yellow-500/50 transition-colors">
                            <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center mb-4 group-hover:bg-yellow-500/10">
                                <Lock className="text-zinc-400 group-hover:text-yellow-500" size={20} />
                            </div>
                            <h3 className="font-bold text-white mb-2">Concurrency</h3>
                            <p className="text-xs text-zinc-500">Mutex Visualization. Deadlock detection algorithms.</p>
                        </Link>

                        <Link to="/algo-wiki" className="group p-6 rounded-xl border border-zinc-800 bg-black hover:border-purple-500/50 transition-colors">
                            <div className="w-10 h-10 rounded bg-zinc-900 flex items-center justify-center mb-4 group-hover:bg-purple-500/10">
                                <Layers className="text-zinc-400 group-hover:text-purple-500" size={20} />
                            </div>
                            <h3 className="font-bold text-white mb-2">Memory</h3>
                            <p className="text-xs text-zinc-500">Paging, Segmentation, and Virtual Memory translation.</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Interface Showcase Gallery */}
            <section className="py-24 border-b border-zinc-800 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono rounded-full mb-6">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                            SYSTEM INTERFACE
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                            Production-Grade <span className="text-purple-500">Tooling</span>.
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            From a fully-featured IDE to compliant policy frameworks. We built OKernel to look and feel like a real OS.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Shell Maker Preview */}
                        <div className="group space-y-4">
                            <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden aspect-[16/10] shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                <img
                                    src="/assets/shell_preview.png"
                                    alt="Shell Maker Interface"
                                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                    <h3 className="text-xl font-bold text-white mb-1">Shell Maker IDE</h3>
                                    <p className="text-sm text-zinc-400">Full-featured C Editor with Syntax Highlighting and Syscall Autocomplete.</p>
                                </div>
                            </div>
                        </div>

                        {/* Policy/Terms Preview */}
                        <div className="group space-y-4">
                            <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden aspect-[16/10] shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                <img
                                    src="/assets/privacy_preview.png"
                                    alt="Privacy & Policy Page"
                                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                    <h3 className="text-xl font-bold text-white mb-1">Open Source Compliance</h3>
                                    <p className="text-sm text-zinc-400">Transparent Terms & Privacy. No hidden tracking. Pure educational value.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* System Hardware Grid (Modules) - Redesigned for NON-AI Vibe */}
            <section className="py-16 md:py-32 container mx-auto px-4">
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
                    <Link to="/scheduler" className="group relative bg-zinc-950 border border-zinc-800 hover:border-green-500/50 transition-colors rounded-xl overflow-hidden min-h-[320px] flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="p-8 flex-1">
                            <div className="w-12 h-12 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-shadow">
                                <Cpu size={24} className="text-zinc-400 group-hover:text-green-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold font-mono text-white mb-2">/cpu-scheduler</h3>
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

                    {/* Shell Maker Unit */}
                    <Link to="/shell" className="group relative bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 transition-colors rounded-xl overflow-hidden min-h-[320px] flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="p-8 flex-1">
                            <div className="w-12 h-12 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-shadow">
                                <Terminal size={24} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold font-mono text-white mb-2">/shell-maker</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                                Interactive C-Shell Kernel. Write custom shell logic in C and execute it in a simulated environment.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">Monaco Editor</div>
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">Live Kernel</div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
                            <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest">● Online</span>
                            <ArrowRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                    </Link>

                    {/* Deadlock Unit */}
                    <Link to="/mutex-visualizer" className="group relative bg-zinc-950 border border-zinc-800 hover:border-yellow-500/50 transition-colors rounded-xl overflow-hidden min-h-[320px] flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="p-8 flex-1">
                            <div className="w-12 h-12 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] transition-shadow">
                                <Lock size={24} className="text-zinc-400 group-hover:text-yellow-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold font-mono text-white mb-2">/mutex-visualizer</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                                Concurrency control subsystem. Models semaphores, mutex locks, hardware and software algorithms.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">Software Mutex</div>
                                <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-400">Hardware Locks</div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-900 bg-zinc-900/30 flex justify-between items-center">
                            <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest">● Online</span>
                            <ArrowRight size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                    </Link>
                </div>
            </section >

            {/* Impact / Testimonials (Dynamic Carousel) */}
            <section className="py-24 border-t border-zinc-800 bg-zinc-900/20">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-2xl font-bold mb-2">User Feedback</h2>
                        <div className="text-xs font-mono text-zinc-500">/var/log/public_opinions</div>
                    </div>

                    {testimonials.length === 0 ? (
                        /* Default Static Mockups */
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Testimonial quote="Finally, a tool that actually shows Context Switches. Saved my OS final." author="Alex Chen" role="CS Student" />
                            <Testimonial quote="I use kernelOne to demonstrate scheduling anomalies. Visual clarity is unmatched." author="Sarah M." role="Systems Engineer" />
                            <Testimonial quote="The 'Hardware' accurate mode is brilliant. Forced me to understand PCB overhead." author="Davide R." role="Embedded Dev" />
                        </div>
                    ) : (
                        /* Dynamic Rendering logic */
                        testimonials.length <= 3 ? (
                            /* 1-3 Items: Centered Grid */
                            <div className={`grid grid-cols-1 md:grid-cols-${testimonials.length} gap-8 max-w-${testimonials.length === 1 ? '2xl' : '6xl'} mx-auto`}>
                                {testimonials.map((t, i) => (
                                    <Testimonial key={i} quote={t.message} author={t.name} role={t.role || 'Verified User'} />
                                ))}
                            </div>
                        ) : (
                            /* 4+ Items: Scrolling Carousel */
                            <div className="overflow-x-auto pb-8 flex gap-6 snap-x snap-mandatory">
                                {testimonials.map((t, i) => (
                                    <div key={i} className="min-w-[300px] md:min-w-[400px] snap-center">
                                        <Testimonial quote={t.message} author={t.name} role={t.role || 'Verified User'} />
                                    </div>
                                ))}
                            </div>
                        )
                    )}
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

                    <form className="max-w-md mx-auto space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-3">
                            <div className="flex gap-4">
                                <span className="py-3 text-green-500 font-mono text-lg">&gt;</span>
                                <div className="space-y-3 w-full">
                                    <input
                                        type="text"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="echo 'Your feedback here...'"
                                        className="w-full bg-transparent border-b border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors font-mono py-2"
                                        disabled={status === 'loading'}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="--name (Optional)"
                                            className="w-full bg-transparent border-b border-zinc-800 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors font-mono py-1"
                                            disabled={status === 'loading'}
                                        />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="--email (Optional)"
                                            className="w-full bg-transparent border-b border-zinc-800 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors font-mono py-1"
                                            disabled={status === 'loading'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button
                            disabled={status === 'loading'}
                            size="sm"
                            className={`w-full rounded font-mono h-10 border transition-all ${status === 'success' ? 'bg-green-500/20 border-green-500 text-green-500 hover:bg-green-500/30' :
                                status === 'error' ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30' :
                                    'bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700'
                                }`}
                        >
                            {status === 'loading' ? 'Sending...' :
                                status === 'success' ? 'Feedback Sent [OK]' :
                                    status === 'error' ? 'Error (Check Console)' :
                                        'Execute Send()'}
                        </Button>
                    </form>
                </div>
            </section>

            {/* OKernel Marketing Section */}
            <section className="py-24 bg-zinc-950 border-t border-zinc-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-green-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        {/* Left: Content */}
                        <div className="lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono rounded-full">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                CLI TOOL
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                                Local <span className="text-green-500">Python Tracing</span>
                            </h2>

                            <p className="text-xl text-zinc-400 leading-relaxed">
                                Zero dependencies. Full visualization. One command.
                                <br />
                                <span className="text-sm text-zinc-500 mt-2 block">Generate a self-contained HTML report of your code's execution flow.</span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <div className="group relative">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-green-600 rounded-lg blur opacity-20 group-hover:opacity-50 transition duration-200"></div>
                                    <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm text-zinc-300">
                                        <span className="text-green-500 mr-2">$</span>
                                        pip install okernel
                                    </div>
                                </div>

                                <a
                                    href="https://pypi.org/project/okernel/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-lg transition-colors"
                                >
                                    View on PyPI <ArrowRight size={16} />
                                </a>
                            </div>
                        </div>

                        {/* Right: Code Example */}
                        <div className="lg:w-1/2 w-full">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden shadow-2xl relative group">
                                <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                {/* Window Header */}
                                <div className="bg-zinc-900/80 backdrop-blur px-4 py-3 flex items-center gap-2 border-b border-zinc-800">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                    </div>
                                    <div className="ml-4 text-xs font-mono text-zinc-500">main.py</div>
                                </div>

                                {/* Code Content */}
                                <div className="p-6 overflow-x-auto">
                                    <pre className="font-mono text-sm leading-relaxed">
                                        <code className="block">
                                            <span className="text-purple-400">from</span> <span className="text-white">okernel</span> <span className="text-purple-400">import</span> <span className="text-yellow-200">trace</span>
                                            <br /><br />
                                            <span className="text-zinc-500"># 1. Trace your code</span>
                                            <br />
                                            <span className="text-blue-400">result</span> = <span className="text-yellow-200">trace</span>(<span className="text-green-300">"x = [1, 2, 3]\nprint(sum(x))"</span>)
                                            <br /><br />
                                            <span className="text-zinc-500"># 2. Export visualization</span>
                                            <br />
                                            <span className="text-blue-400">result</span>.<span className="text-yellow-200">to_html</span>(<span className="text-green-300">"trace.html"</span>)
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sponsor / Goals Link Section */}
            <section className="py-24 border-t border-zinc-800 bg-zinc-950 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] bg-green-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800 text-green-400 text-xs font-mono rounded-full mb-8 backdrop-blur-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        /usr/bin/support
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Support the <span className="text-green-500">Project</span>.
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
                        Check out our roadmap and funding goals. Help us keep the servers running.
                    </p>

                    <div className="flex justify-center">
                        <Link
                            to="/sponsor"
                            className="group relative inline-flex items-center justify-center"
                        >
                            <div className="absolute -inset-1 bg-green-500 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                            <Button size="lg" className="relative h-14 px-8 text-lg font-bold bg-zinc-900 hover:bg-zinc-800 !text-white border border-zinc-700 rounded-xl flex items-center gap-3">
                                <Heart className="text-red-500 fill-red-500 animate-pulse" size={20} />
                                View Funding Goals
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Language Poll Results Section */}
            <section className="py-16 border-t border-zinc-800 bg-zinc-900/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/20 border border-blue-500/30 text-blue-400 text-xs font-mono rounded-full mb-3">
                                    <BarChart3 size={12} />
                                    COMMUNITY POLL
                                </div>
                                <h2 className="text-2xl font-bold text-white">
                                    What language should OKernel support next?
                                </h2>
                            </div>
                            <Link to="/packages">
                                <Button variant="outline" className="whitespace-nowrap font-mono text-sm">
                                    Vote Now <ArrowRight size={14} className="ml-2" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { key: 'javascript', name: 'JS/TS', color: 'yellow' },
                                { key: 'rust', name: 'Rust', color: 'orange' },
                                { key: 'go', name: 'Go', color: 'cyan' },
                                { key: 'java', name: 'Java', color: 'red' },
                                { key: 'cpp', name: 'C++', color: 'blue' },
                            ].map((lang) => {
                                const totalVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);
                                const voteCount = pollVotes[lang.key as keyof PollVotes];
                                const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

                                return (
                                    <div
                                        key={lang.key}
                                        className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center relative overflow-hidden"
                                    >
                                        <div
                                            className="absolute bottom-0 left-0 right-0 bg-zinc-800/50 transition-all"
                                            style={{ height: `${percentage}%` }}
                                        />
                                        <div className="relative z-10">
                                            <div className="text-white font-bold mb-1">{lang.name}</div>
                                            <div className="text-2xl font-mono text-zinc-300">{voteCount}</div>
                                            <div className="text-xs text-zinc-500">{percentage.toFixed(0)}%</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-center text-zinc-600 text-xs mt-4 font-mono">
                            {Object.values(pollVotes).reduce((a, b) => a + b, 0)} total votes
                        </p>
                    </div>
                </div>
            </section>

        </Layout >
    );
};

const Testimonial = ({ quote, author, role }: { quote: string, author: string, role: string }) => (
    <div className="p-8 rounded bg-black border border-zinc-800 relative">
        <div className="text-4xl text-zinc-800 absolute top-4 left-4 font-serif">"</div>
        <p className="text-zinc-300 italic mb-6 relative z-10">{quote}</p>
        <div>
            <div className="font-bold text-white text-sm">{author}</div>
            <div className="text-xs text-zinc-500">{role}</div>
        </div>
    </div>
);
