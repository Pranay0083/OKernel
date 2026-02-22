import React from 'react';
import { Github, Heart, MessageSquare, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = ({ minimal }: { minimal?: boolean }) => {
    if (minimal) {
        return (
            <footer className="w-full py-6 text-center border-t border-white/5 bg-[#050505]">
                <div className="flex items-center justify-center gap-1 text-xs text-zinc-600 font-mono">
                    <span>©️ 2026 OKernel.</span>
                    <span>MIT License.</span>
                </div>
            </footer>
        );
    }
    return (
        <footer className="border-t border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-lg mt-auto pb-8 md:pb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
                            <Terminal size={20} className="text-green-500" />
                            OKernel.<span className="text-green-500">CodeTracer</span>
                        </div>
                        <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                            An open-source interactive platform for mastering Operating System concepts.
                            Built for students, by students.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="https://github.com/Vaiditya2207/OKernel" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors"><Github size={20} /></a>
                            <a href="#" className="text-zinc-400 hover:text-white transition-colors"><MessageSquare size={20} /></a>
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="font-bold mb-4 md:mb-6 text-white text-sm md:text-base uppercase tracking-wider">Platform</h4>
                        <ul className="space-y-2 md:space-y-3 text-sm text-zinc-400 font-mono">
                            <li><Link to="/code-tracer" className="hover:text-green-500 transition-colors text-white font-bold">Code Tracer</Link></li>
                            <li><a href="/" className="hover:text-green-500 transition-colors">Home</a></li>
                            <li><a href="/console" className="hover:text-green-500 transition-colors">Console [BASH]</a></li>
                            <li><a href="/cpu-scheduler" className="hover:text-green-500 transition-colors">CPU Scheduler</a></li>
                            <li><a href="/roadmap" className="hover:text-green-500 transition-colors">Roadmap</a></li>
                            <li><a href="/changelog" className="hover:text-green-500 transition-colors">System Log</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-bold mb-4 md:mb-6 text-white text-sm md:text-base uppercase tracking-wider">Resources</h4>
                        <ul className="space-y-2 md:space-y-3 text-sm text-zinc-400 font-mono">
                            <li><a href="/docs" className="hover:text-green-500 transition-colors">Documentation</a></li>
                            <li><a href="/os-concepts" className="hover:text-green-500 transition-colors">OS Architecture Guide</a></li>
                            <li><a href="/algo-wiki" className="hover:text-green-500 transition-colors">Algorithm Wiki</a></li>
                            <li><a href="/architecture" className="hover:text-green-500 transition-colors">Architecture</a></li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h4 className="font-bold mb-4 md:mb-6 text-white text-sm md:text-base uppercase tracking-wider">Community</h4>
                        <ul className="space-y-2 md:space-y-3 text-sm text-zinc-400 font-mono">
                            <li><a href="/bug-report" className="hover:text-green-500 transition-colors">Report a Bug</a></li>
                            <li><a href="/feature-request" className="hover:text-green-500 transition-colors">Request Feature</a></li>
                            <li><a href="/contributing" className="hover:text-green-500 transition-colors">Contributing</a></li>
                            <li><a href="/sponsor" className="hover:text-pink-400 transition-colors flex items-center gap-2"><Heart size={12} className="fill-current" /> Sow a Seed</a></li>
                            <li className="pt-2 border-t border-white/10 mt-2"></li>
                            <li><a href="/privacy" className="hover:text-white transition-colors text-xs">Privacy Policy</a></li>
                            <li><a href="/terms" className="hover:text-white transition-colors text-xs">Terms & Conditions</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <span className="text-xs text-zinc-500 font-mono">©️ 2026 OKernel. Released under MIT License.</span>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-xs text-zinc-500 font-mono">
                        <Link to="/docs" className="hover:text-green-500 transition-colors">Documentation</Link>
                        <span>•</span>
                        <Link to="/blog" className="hover:text-green-500 transition-colors">Blog</Link>
                        <span>•</span>
                        <Link to="/aether" className="hover:text-green-500 transition-colors flex items-center gap-1">Aether Terminal <span className="text-purple-500 text-[10px] uppercase font-bold bg-purple-500/10 px-1.5 py-0.5 rounded ml-1">New</span></Link>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1 w-full sm:w-auto justify-center mt-2 sm:mt-0">Made with <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" /> by the OKernel Team</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};