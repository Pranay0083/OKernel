import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Zap, Cpu, Download, ArrowRight, Settings,
    Heart, GitMerge, Feather, Gauge, Sliders, Fingerprint,
    Sparkles, Shield, MonitorPlay, TerminalSquare, Combine, Code2
} from 'lucide-react';

export const Aether = () => {
    const [_scrolled, setScrolled] = useState(false);
    const [latestVersion, setLatestVersion] = useState('v1.0.0');
    const [downloadUrl, setDownloadUrl] = useState('/aether/download');
    const [latestSize, setLatestSize] = useState('');
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

    const macbookScrollRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: macbookScrollRef,
        offset: ["start start", "end end"]
    });

    // 3D Transforms mapped to scroll
    // Sequence:
    // 0.0 -> 0.1: Closed state locked.
    // 0.1 -> 0.4: Lid opens, laptop rotates to view, translates down to center.
    // 0.4 -> 0.6: Pauses, fully opened and centered.
    // 0.6 -> 0.9: Zooms in (scales up) and translates further down to keep the screen perfectly centered inside the viewport.
    const lidRotate = useTransform(scrollYProgress, [0, 0.1, 0.4, 0.6, 0.9, 1], [80, 80, 185, 185, 185, 185]);
    const containerRotateX = useTransform(scrollYProgress, [0, 0.1, 0.4, 0.6, 0.9, 1], [-20, -20, 5, 5, 5, 5]);
    const containerTranslateY = useTransform(scrollYProgress, [0, 0.1, 0.4, 0.6, 0.9, 1], [150, 150, 550, 550, 900, 900]);
    const overallScale = useTransform(scrollYProgress, [0, 0.1, 0.4, 0.6, 0.9, 1], [0.85, 0.85, 0.85, 0.85, 1.6, 1.6]);

    // UI elements fade in at the end
    const uiOpacity = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);
    // Initial hero title fades out
    const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    // Glare sweep effect as it opens
    const glareOpacity = useTransform(scrollYProgress, [0.1, 0.5], [0.8, 0]);

    const galleryItems = [
        { src: '/assets/Aether.png', label: 'Vanilla Alpha v0.3', gradient: '', title: 'Vanilla Alpha v0.3' },
        { src: '/assets/Nvim.png', label: 'Neovim + LSP Integration', gradient: '', title: 'Neovim + LSP Integration' },
        { src: '/assets/Multiple_Panes_Aether.png', label: 'Native Multiplexing Engine', gradient: '', title: 'Native Multiplexing Engine' },
        { src: '/assets/gemini.png', label: 'Gemini Integration', gradient: '', title: 'Gemini Integration' },
        { src: '/assets/Opencode.png', label: 'OpenCode Integration', gradient: '', title: 'OpenCode Integration' },
        { src: '/assets/focus_on_what_you_need.png', label: 'Focus on What You Need', gradient: '', title: 'Focus on What You Need' },

    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveGalleryIndex((prev) => (prev + 1) % galleryItems.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [galleryItems.length]);

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const res = await fetch('https://api.hackmist.tech/api/v1/aether');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setLatestVersion(data[0].version);
                        setDownloadUrl(`https://api.hackmist.tech/api/v1/aether/download?v=${data[0].version}`);
                        if (data[0].size) {
                            setLatestSize((data[0].size / (1024 * 1024)).toFixed(2) + ' MB');
                        }
                    }
                }
            } catch (e) {
                console.warn("API offline, using fallback Aether version data.");
                setLatestVersion('v0.3.0 ALPHA');
                setDownloadUrl('/aether/download');
                setLatestSize('2.00 MB');
            }
        };
        fetchLatest();

        const handleScroll = () => {
            const scrollY = window.scrollY;
            setScrolled(scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const tools = [
        'Neovim', 'Tmux', 'Docker', 'Git', 'Node.js', 'Python',
        'Rust', 'Zig', 'AWS', 'Gemini', 'OpenCode', 'Bash',
        'Zsh', 'Vite', 'React', 'Go', 'Kubernetes'
    ];

    return (
        <Layout>
            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-infinite-scroll {
                    animation: scroll 40s linear infinite;
                }
                .hover-pause:hover {
                    animation-play-state: paused;
                }
            `}</style>

            {/* 1. HERO SECTION (Text Only + Download) */}
            <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 bg-zinc-950 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 blur-[150px] pointer-events-none rounded-full"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center justify-center h-full">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                        SYSTEM ONLINE: {latestVersion}
                    </div>

                    <h1 className="flex flex-col md:flex-row items-center justify-center gap-x-4 text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 leading-[1.1]">
                        <span>Aether</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400 animate-gradient bg-300%">Terminal</span>
                    </h1>

                    <p className="text-xl md:text-3xl text-zinc-400 font-light max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                        The world's fastest macOS terminal. <br />
                        <span className="text-white font-medium">Engineered for absolute flow state.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                        <a href={downloadUrl}>
                            <button className="group relative h-16 pl-8 pr-20 text-lg overflow-hidden rounded-full bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_80px_rgba(168,85,247,0.4)]">
                                <div className="absolute right-2 top-2 h-12 w-12 rounded-full bg-black flex items-center justify-center transition-all group-hover:bg-purple-600">
                                    <Download className="text-white" size={20} />
                                </div>
                                <span className="relative text-black font-bold tracking-wide">Download {latestVersion}</span>
                            </button>
                        </a>
                        <Link to="/docs/aether">
                            <button className="px-8 h-16 rounded-full border border-zinc-800 text-zinc-400 font-bold hover:bg-zinc-900 hover:text-white transition-all text-lg flex items-center gap-2">
                                Read Architecture <ArrowRight size={18} />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. FOUR STICKY SLIDES (Card Stacking Effect) */}
            <div className="relative pb-32 bg-zinc-950">
                {/* Slide 1: Light */}
                <section className="h-screen sticky top-0 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden z-10 border-t border-zinc-800 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-all">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_50%)]"></div>
                    <div className="text-center relative z-10 w-full px-6">
                        <h2 className="text-[20vw] font-bold text-white/[0.02] leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">LIGHT</h2>
                        <Feather className="w-20 h-20 mx-auto text-zinc-300 mb-8 font-light stroke-1" />
                        <h3 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">Light.</h3>
                        <p className="text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">Written in Zig. Stripped of electron bloat. Aether starts before your finger leaves the key.</p>
                    </div>
                </section>

                {/* Slide 2: Fast */}
                <section className="h-screen sticky top-8 bg-[#08080a] flex flex-col items-center justify-center overflow-hidden z-20 border-t border-purple-900/30 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] transition-all">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_70%)]"></div>
                    <div className="text-center relative z-10 w-full px-6">
                        <h2 className="text-[20vw] font-bold text-purple-500/[0.03] leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">FAST</h2>
                        <Gauge className="w-20 h-20 mx-auto text-purple-400 mb-8 animate-pulse stroke-1" />
                        <h3 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">Fast.</h3>
                        <p className="text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">Custom Metal GPU-accelerated pipeline pushing frames at 120Hz. Flawless scrolling through millions of lines.</p>
                    </div>
                </section>

                {/* Slide 3: Configurable */}
                <section className="h-screen sticky top-16 bg-black flex flex-col items-center justify-center overflow-hidden z-30 border-t border-blue-900/30 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] transition-all">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)]"></div>
                    <div className="text-center relative z-10 w-full px-6">
                        <h2 className="text-[20vw] font-bold text-blue-500/[0.03] leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">CONFIG</h2>
                        <Sliders className="w-20 h-20 mx-auto text-blue-400 mb-8 stroke-1" />
                        <h3 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">Configurable.</h3>
                        <p className="text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">TOML-based pure configuration. Hot-reload everything from complex keybinds to custom window shaders instantly.</p>
                    </div>
                </section>

                {/* Slide 4: Yours */}
                <section className="min-h-screen sticky top-24 bg-zinc-950 flex flex-col items-center pt-40 overflow-hidden z-40 border-t border-zinc-800 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] transition-all">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                    <div className="text-center relative z-10 w-full px-6 mb-20">
                        <Fingerprint className="w-20 h-20 mx-auto text-zinc-300 mb-8 stroke-1" />
                        <h3 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">Yours.</h3>
                        <p className="text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">Open source heart. Privacy-first architecture. Zero telemetry. Your terminal is your sanctuary.</p>
                    </div>

                    {/* 3. CONFIG EXAMPLES SNIPPET */}
                    <div className="w-full max-w-4xl mx-auto px-4 relative z-20 pb-32">
                        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-transform duration-500">
                            {/* Window Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-[#111115] border-b border-zinc-800/50">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                </div>
                                <div className="text-xs font-mono text-zinc-500 flex items-center gap-2">
                                    <Settings size={12} /> ~/.config/aether/aether.toml
                                </div>
                                <div className="w-12"></div>
                            </div>

                            {/* Code Content */}
                            <div className="p-6 md:p-8 font-mono text-sm md:text-base leading-loose overflow-x-auto">
                                <pre className="text-zinc-300">
                                    <span className="text-zinc-500 italic"># Aether Core Settings</span><br />
                                    <span className="text-purple-400 font-bold">[window]</span><br />
                                    <span className="text-blue-300">opacity</span> = <span className="text-orange-300">0.85</span><br />
                                    <span className="text-blue-300">blur_radius</span> = <span className="text-orange-300">30.0</span><br />
                                    <span className="text-blue-300">padding</span> = <span className="text-green-300">"16px 24px"</span><br />
                                    <span className="text-blue-300">decorations</span> = <span className="text-green-300">"buttonless"</span><br />
                                    <br />
                                    <span className="text-zinc-500 italic"># Advanced GPU Shaders</span><br />
                                    <span className="text-purple-400 font-bold">[effects]</span><br />
                                    <span className="text-blue-300">crt_curve</span> = <span className="text-orange-300">true</span><br />
                                    <span className="text-blue-300">bloom_intensity</span> = <span className="text-orange-300">1.2</span><br />
                                    <br />
                                    <span className="text-zinc-500 italic"># Multiplexer Bindings</span><br />
                                    <span className="text-purple-400 font-bold">[keys]</span><br />
                                    <span className="text-blue-300">"Cmd+D"</span> = <span className="text-green-300">"split_pane_vertical"</span><br />
                                    <span className="text-blue-300">"Cmd+Shift+D"</span> = <span className="text-green-300">"split_pane_horizontal"</span><br />
                                    <span className="text-blue-300">"Cmd+W"</span> = <span className="text-green-300">"close_pane"</span><br />
                                </pre>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* 4. INTEGRATIONS MARQUEE */}
            <section className="py-20 bg-black border-y border-zinc-900 overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

                <div className="mb-10 text-center container mx-auto px-4 relative z-20">
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Natively Supports Your Ecosystem</p>
                </div>

                <div className="flex w-[200%] animate-infinite-scroll hover-pause">
                    {/* Double the array for seamless looping */}
                    {[...tools, ...tools].map((tool, idx) => (
                        <div key={idx} className="flex-1 flex justify-center items-center py-4 px-8 min-w-max">
                            <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-zinc-900 hover:from-white hover:to-zinc-400 transition-all duration-300 cursor-default select-none uppercase tracking-tighter">
                                {tool}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. GALLERY (Apple-Style Carousel with Scroll-to-Open MacBook Effect) */}
            <section ref={macbookScrollRef} className="bg-zinc-950 min-h-[400vh] relative">

                {/* Fixed container during scroll */}
                <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden w-full">

                    {/* Floating Title (Fades out when laptop opens) */}
                    <motion.div
                        className="absolute top-24 left-0 w-full z-10 text-center"
                        style={{ opacity: titleOpacity }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4">Unmatched Performance.</h2>
                        <p className="text-xl md:text-2xl text-zinc-400 font-light">See how Aether dominates the competition.</p>
                    </motion.div>

                    {/* Scale Container based on scroll */}
                    <motion.div
                        className="relative mx-auto w-full max-w-[1000px] flex justify-center items-center px-4"
                        style={{
                            scale: overallScale,
                            rotateX: containerRotateX,
                            y: containerTranslateY,
                            perspective: 2500,
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        {/* THE MACBOOK 3D ASSEMBLY */}
                        {/* Both Lid and Base occupy this EXACT SAME aspect box, hinging at top: 0 */}
                        <div className="relative w-full aspect-[16/10] max-w-4xl z-20" style={{ transformStyle: 'preserve-3d' }}>

                            {/* BASE (Keyboard desk) */}
                            <div
                                className="absolute inset-0 bg-transparent rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col items-center pt-8"
                                style={{
                                    transformOrigin: 'top',
                                    transform: 'rotateX(80deg)',
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                {/* keyboard front face (drawn on +Z so it faces UP when base rotates 80deg) */}
                                <div
                                    className="absolute inset-0 w-full h-full bg-[#0d0d0f] rounded-[1.5rem] md:rounded-[2.5rem] border border-zinc-700/50 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                                    style={{ transform: 'translateZ(1px)', backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
                                >
                                    <div className="absolute inset-0 flex flex-col items-center pt-8 w-full h-full">
                                        {/* Fake Keyboard Layout */}
                                        <div className="w-[85%] h-[45%] bg-[#050505] rounded-xl shadow-inner ring-1 ring-white/5 grid grid-cols-12 gap-1.5 p-3 opacity-90">
                                            {Array.from({ length: 72 }).map((_, i) => (
                                                <div key={i} className={`bg-[#1a1a1c] rounded-md ring-1 ring-zinc-900 shadow-sm ${i > 60 ? 'col-span-2' : ''}`}></div>
                                            ))}
                                        </div>
                                        {/* Trackpad */}
                                        <div className="w-[45%] h-[30%] bg-[#0a0a0c] rounded-xl shadow-inner ring-1 ring-white/5 mt-6 opacity-90"></div>

                                        {/* Lip Edge */}
                                        <div
                                            className="absolute top-full left-0 w-full h-4 md:h-6 bg-gradient-to-b from-[#111] to-[#050505] rounded-b-[1.5rem] md:rounded-b-[2.5rem]"
                                            style={{ transformOrigin: 'top', transform: 'rotateX(-90deg)' }}
                                        >
                                            <div className="mx-auto w-24 md:w-32 h-2 md:h-3 bg-[#020202] rounded-b-xl shadow-inner mt-[-1px]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* LID (Screen + Logo) */}
                            <motion.div
                                className="absolute inset-0 w-full rounded-[1.5rem] md:rounded-[2.5rem] z-30"
                                style={{
                                    transformOrigin: 'top',
                                    rotateX: lidRotate,
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                {/* BACK COVER (Logo) */}
                                {/* Front Face (+Z). Visible when closed (Lid Absolute = 60). */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-[#1a1a1c] to-[#0a0a0c] rounded-[1.5rem] md:rounded-[2.5rem] border border-zinc-700/50 flex flex-col items-center justify-center pointer-events-none"
                                    style={{
                                        transform: 'translateZ(1px)',
                                        backfaceVisibility: 'hidden',
                                    }}
                                >
                                    <div className="relative flex flex-col items-center justify-center">
                                        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                            <span className="font-mono text-4xl font-bold text-white">O</span>
                                            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20 ring-inset"></div>
                                        </div>
                                    </div>
                                    <div className="mt-5 text-zinc-400 font-mono text-sm font-bold tracking-[0.4em] uppercase">OKernel</div>
                                </div>

                                {/* FRONT SCREEN COVER */}
                                {/* Back Face (-Z). Visible when open (Lid Absolute = 190 -> which means it flipped). */}
                                <div
                                    className="absolute inset-0 bg-black rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-5 shadow-2xl border border-zinc-900 ring-1 ring-white/10 overflow-hidden"
                                    style={{
                                        transform: 'translateZ(-1px) rotateY(180deg) rotateZ(180deg)',
                                        backfaceVisibility: 'hidden',
                                    }}
                                >
                                    {/* Webcam/Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 md:w-28 h-4 md:h-6 bg-black rounded-b-xl z-30 flex justify-center items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700"></div>
                                    </div>

                                    {/* Inner Screen Area */}
                                    <div className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden bg-zinc-950 shadow-inner">
                                        <div className="relative w-full h-full bg-[#050505] p-6 lg:p-10 flex flex-col justify-center overflow-hidden">
                                            <div className="flex flex-col justify-between items-start mb-6 w-full">
                                                <div className="inline-flex items-center gap-2 text-white/50 mb-2">
                                                    <Gauge size={16} />
                                                    <span className="uppercase tracking-widest font-bold text-xs">The Benchmark Lab</span>
                                                </div>
                                                <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Numbers don't lie.</h2>
                                                <p className="text-zinc-500 font-mono text-[10px] w-full border-b border-white/5 pb-4">Tested on <strong>M1 Base Model</strong>. Lower is always better.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                                                {/* Stat 1 */}
                                                <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-zinc-800/80 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all flex flex-col justify-center">
                                                    <h3 className="text-sm font-bold text-zinc-300 mb-6 border-b border-zinc-800 pb-2">Input Latency <span className="text-zinc-600 font-normal ml-1">(ms)</span></h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex justify-between text-xs mb-1"><span className="text-white font-bold">Aether</span><span className="text-purple-400 font-mono text-sm font-bold">6ms</span></div>
                                                            <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800"><div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-[6%] rounded-full shadow-[0_0_15px_#a855f7]"></div></div>
                                                        </div>
                                                        <div className="opacity-70">
                                                            <div className="flex justify-between text-xs mb-1"><span className="text-zinc-400">Kitty</span><span className="text-zinc-500 font-mono">7ms</span></div>
                                                            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800"><div className="h-full bg-zinc-600 w-[7%] rounded-full"></div></div>
                                                        </div>
                                                        <div className="opacity-50">
                                                            <div className="flex justify-between text-xs mb-1"><span className="text-zinc-400">iTerm2</span><span className="text-zinc-500 font-mono">25ms</span></div>
                                                            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800"><div className="h-full bg-zinc-800 w-[25%] rounded-full"></div></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stat 2 */}
                                                <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-zinc-800/80 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all flex flex-col justify-center">
                                                    <h3 className="text-sm font-bold text-zinc-300 mb-6 border-b border-zinc-800 pb-2">Startup Time <span className="text-zinc-600 font-normal ml-1">(ms)</span></h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex justify-between text-xs mb-1"><span className="text-white font-bold">Aether</span><span className="text-blue-400 font-mono text-sm font-bold">40ms</span></div>
                                                            <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800"><div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[8%] rounded-full shadow-[0_0_15px_#3b82f6]"></div></div>
                                                        </div>
                                                        <div className="opacity-70">
                                                            <div className="flex justify-between text-xs mb-1"><span className="text-zinc-400">Alacritty</span><span className="text-zinc-500 font-mono">50ms</span></div>
                                                            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800"><div className="h-full bg-zinc-600 w-[10%] rounded-full"></div></div>
                                                        </div>
                                                        <div className="opacity-50">
                                                            <div className="flex justify-between text-xs mb-1"><span className="text-zinc-400">Hyper</span><span className="text-zinc-500 font-mono">800ms</span></div>
                                                            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800"><div className="h-full bg-zinc-800 w-[95%] rounded-full"></div></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stat 3 */}
                                                <div className="bg-[#0a0a0c] p-6 rounded-2xl border border-zinc-800/80 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all flex flex-col justify-center">
                                                    <h3 className="text-sm font-bold text-zinc-300 mb-6 border-b border-zinc-800 pb-2">Memory <span className="text-zinc-600 font-normal ml-1">(MB)</span></h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex justify-between text-xs mb-1"><span className="text-white font-bold">Aether</span><span className="text-emerald-400 font-mono text-sm font-bold">25MB</span></div>
                                                            <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800"><div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[12%] rounded-full shadow-[0_0_15px_#10b981]"></div></div>
                                                        </div>
                                                        <div className="opacity-70">
                                                            <div className="flex justify-between text-xs mb-1"><span className="text-zinc-400">Kitty</span><span className="text-zinc-500 font-mono">40MB</span></div>
                                                            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800"><div className="h-full bg-zinc-600 w-[20%] rounded-full"></div></div>
                                                        </div>
                                                        <div className="opacity-50">
                                                            <div className="flex justify-between text-xs mb-1"><span className="text-zinc-400">Warp</span><span className="text-zinc-500 font-mono">180MB</span></div>
                                                            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800"><div className="h-full bg-zinc-800 w-[70%] rounded-full"></div></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Screen Glare reflection */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/5 to-transparent pointer-events-none z-20 mix-blend-overlay"
                                                style={{ opacity: glareOpacity }}
                                            ></motion.div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 6. REDESIGNED GALLERY (Extracted outside MacBook) */}
            <section className="py-32 bg-[#050505] border-y border-zinc-900 relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-300 font-mono text-xs mb-6">
                            <Sparkles size={14} className="text-purple-400" />
                            <span>VISUAL EXCELLENCE</span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Aesthetic out of the box.</h2>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">See how true hackers customize Aether to their liking.</p>
                    </div>

                    {/* Standalone Gallery Layout */}
                    <div className="relative w-full aspect-video md:aspect-[16/10] max-w-6xl mx-auto rounded-3xl bg-[#0a0a0c] border border-zinc-800/80 shadow-2xl overflow-hidden group">
                        <motion.div
                            className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            style={{ transform: `translateX(-${activeGalleryIndex * 100}%)` }}
                        >
                            {galleryItems.map((item, idx) => (
                                <div key={idx} className="w-full flex-shrink-0 relative">
                                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20`}></div>
                                    <img src={item.src} alt={item.title} className="w-full h-full object-cover object-center opacity-90" />

                                    {/* Glassmorphism Title Overlay */}
                                    <div className="absolute inset-0 flex items-end justify-center pb-12">
                                        <div className="px-8 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                                            <span className="text-white font-mono text-lg font-semibold uppercase tracking-widest">{item.title}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={() => setActiveGalleryIndex(prev => prev === 0 ? galleryItems.length - 1 : prev - 1)}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <svg className="w-6 h-6 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <button
                            onClick={() => setActiveGalleryIndex(prev => (prev + 1) % galleryItems.length)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    {/* Dot Indicators */}
                    <div className="flex justify-center gap-4 mt-8">
                        {galleryItems.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveGalleryIndex(idx)}
                                className={`w-3 h-3 rounded-full transition-all duration-500 ${idx === activeGalleryIndex ? 'bg-white scale-150 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-zinc-800 hover:bg-zinc-600 cursor-pointer'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section >

            {/* 7. APPLE-STYLE MASSIVE FEATURES */}
            < section className="py-32 bg-black" >
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-6">Uncompromising Polish.</h2>
                        <p className="text-2xl text-zinc-400 font-light max-w-3xl mx-auto">Every detail obsessed over, out of the box. No plugins required.</p>
                    </div>

                    <div className="space-y-8">
                        {/* Feature 1 */}
                        <div className="bg-gradient-to-br from-zinc-900 to-black rounded-[3rem] p-12 md:p-20 border border-zinc-800 flex flex-col md:flex-row items-center gap-12 group overflow-hidden relative">
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent_70%)] pointer-events-none"></div>
                            <div className="flex-1 relative z-10">
                                <TerminalSquare className="text-purple-400 mb-8" size={64} />
                                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Native Multiplexing</h3>
                                <p className="text-xl text-zinc-400 leading-relaxed font-light">
                                    Split panes and manage tabs natively without Tmux overhead. Panes are managed directly by the Metal renderer, ensuring zero latency and perfectly synced redrawing.
                                </p>
                            </div>
                            <div className="flex-1 w-full md:w-auto flex justify-center transform group-hover:scale-105 transition-transform duration-700 relative z-10">
                                <Combine size={250} className="text-purple-500/20 drop-shadow-[0_0_50px_rgba(168,85,247,0.3)]" strokeWidth={1} />
                            </div>
                        </div>

                        {/* Split Features */}
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 bg-gradient-to-br from-[#0c0c0e] to-black rounded-[3rem] p-12 border border-zinc-800 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none"></div>
                                <Code2 className="text-blue-400 mb-8 relative z-10" size={48} />
                                <h3 className="text-3xl font-bold text-white mb-4 relative z-10">Perfect Ligatures</h3>
                                <p className="text-lg text-zinc-400 font-light relative z-10">Crisp, pixel-perfect rendering for Fira Code, JetBrains Mono, and all developer fonts. HarfBuzz text shaping built-in.</p>
                            </div>
                            <div className="flex-1 bg-gradient-to-br from-[#0c0c0e] to-black rounded-[3rem] p-12 border border-zinc-800 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.1),transparent_70%)] pointer-events-none"></div>
                                <Sparkles className="text-yellow-400 mb-8 relative z-10" size={48} />
                                <h3 className="text-3xl font-bold text-white mb-4 relative z-10">TrueColor & Shaders</h3>
                                <p className="text-lg text-zinc-400 font-light relative z-10">24-bit color support out of the box with custom GPU shaders for bloom, CRT curves, and chromatic aberration.</p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-gradient-to-tr from-zinc-900 to-black rounded-[3rem] p-12 md:p-20 border border-zinc-800 flex flex-col md:flex-row items-center gap-12 group overflow-hidden relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none"></div>
                            <div className="flex-1 w-full md:w-auto flex justify-center order-2 md:order-1 transform group-hover:scale-105 transition-transform duration-700 relative z-10">
                                <MonitorPlay size={250} className="text-emerald-500/20 drop-shadow-[0_0_50px_rgba(16,185,129,0.2)]" strokeWidth={1} />
                            </div>
                            <div className="flex-1 relative z-10 order-1 md:order-2">
                                <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full mb-6 text-emerald-400 text-xs font-bold tracking-widest uppercase">
                                    <Shield size={14} /> Full Compatibility
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Kitty Protocol</h3>
                                <p className="text-xl text-zinc-400 leading-relaxed font-light">
                                    Advanced key handling built right into the core. Distinguish between Tab, Ctrl+I, shift states, and comprehensive shortcut mapping for absolute VIM mastery.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* 8. GITHUB MARKETING (The Cult) */}
            < section className="py-32 bg-black overflow-hidden relative border-y border-zinc-900" >
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-900/10 to-transparent pointer-events-none"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 text-white mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <Heart className="fill-zinc-700 text-white" />
                    </div>

                    <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">Built by hackers.<br />For hackers.</h2>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                        Aether is entirely open source. No telemetry. No paywalls for basic features.
                        Star us on GitHub and help build the last terminal emulator you'll ever need.
                    </p>

                    <a href="https://github.com/Vaiditya2207/OKernel" target="_blank" rel="noopener noreferrer">
                        <Button size="lg" className="h-16 px-10 text-lg bg-zinc-100 hover:bg-white text-black font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all transform hover:scale-105">
                            <GitMerge className="mr-3" /> Star on GitHub
                        </Button>
                    </a>
                </div>
            </section >

            {/* 9. FINAL DOWNLOAD CTA */}
            < section className="py-40 bg-zinc-950 relative overflow-hidden flex items-center justify-center min-h-[70vh]" >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_60%)] pointer-events-none"></div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-[12vw] md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-8 tracking-tighter leading-none select-none">
                        SWITCH TO AETHER
                    </h2>

                    <p className="text-xl text-zinc-400 mb-12 max-w-xl mx-auto font-light">
                        Stop waiting for your terminal. Start waiting for your code to compile.
                    </p>

                    <a href={downloadUrl}>
                        <button className="group relative h-20 pl-8 pr-24 text-xl md:text-2xl overflow-hidden rounded-full bg-white transition-all hover:scale-105 shadow-[0_0_60px_rgba(168,85,247,0.4)] hover:shadow-[0_0_100px_rgba(168,85,247,0.6)] mt-4">
                            <div className="absolute right-3 top-3 h-14 w-14 rounded-full bg-black flex items-center justify-center transition-all group-hover:bg-purple-600 group-hover:scale-110">
                                <Download className="text-white transition-colors" size={28} />
                            </div>
                            <span className="relative text-black font-bold tracking-tight px-4 flex items-center gap-3">
                                Download {latestVersion}
                                <ArrowRight size={20} className="text-zinc-500" />
                            </span>
                        </button>
                    </a>

                    <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-zinc-600 text-sm font-mono">
                        <div className="flex items-center gap-2"><Shield size={16} /> 100% Free & Open Source</div>
                        <span className="hidden md:block">•</span>
                        <div>macOS 14.0+ {latestSize && `(${latestSize})`}</div>
                    </div>
                </div>
            </section >
        </Layout >
    );
};