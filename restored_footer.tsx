import React from 'react';
import { Github, Heart, MessageSquare } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="border-t border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-lg mt-auto pb-8 md:pb-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
                    {/* Brand Column - Full width on mobile often looks better, or span 2 cols */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <span className="text-xl font-bold tracking-tight">O<span className="text-primary">Kernel</span></span>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            An open-source interactive platform for mastering Operating System concepts.
                            Built for students, by students.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a href="https://github.com/Vaiditya2207/OKernel" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors"><Github size={20} /></a>
                            <a href="#" className="text-zinc-400 hover:text-white transition-colors"><MessageSquare size={20} /></a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-bold mb-4 md:mb-6 text-white text-sm md:text-base">Platform</h4>
                        <ul className="space-y-2 md:space-y-3 text-sm text-muted-foreground">
                            <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
                            <li><a href="/dev/console" className="hover:text-primary transition-colors">Console</a></li>
                            <li><a href="/dev/scheduler" className="hover:text-primary transition-colors">CPU Visualizer</a></li>
                            <li><a href="/dev/roadmap" className="hover:text-primary transition-colors">Roadmap</a></li>
                            <li><a href="/dev/changelog" className="hover:text-primary transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-bold mb-4 md:mb-6 text-white text-sm md:text-base">Resources</h4>
                        <ul className="space-y-2 md:space-y-3 text-sm text-muted-foreground">
                            <li><a href="/dev/docs" className="hover:text-primary transition-colors">Documentation</a></li>
                            <li><a href="/dev/os-concepts" className="hover:text-primary transition-colors">OS Concepts Guide</a></li>
                            <li><a href="/dev/algo-wiki" className="hover:text-primary transition-colors">Algorithm Wiki</a></li>
                        </ul>
                    </div>

                    {/* Legal/Contact */}
                    <div>
                        <h4 className="font-bold mb-4 md:mb-6 text-white text-sm md:text-base">Community</h4>
                        <ul className="space-y-2 md:space-y-3 text-sm text-muted-foreground">
                            <li><a href="/dev/bug-report" className="hover:text-primary transition-colors">Report a Bug</a></li>
                            <li><a href="/dev/feature-request" className="hover:text-primary transition-colors">Request Feature</a></li>
                            <li><a href="/dev/contributing" className="hover:text-primary transition-colors">Contributing</a></li>
                            <li><a href="/sponsor" className="hover:text-pink-400 transition-colors flex items-center gap-2"><Heart size={12} className="fill-current" /> Sow a Seed</a></li>
                            <li className="pt-2 border-t border-white/10 mt-2"></li>
                            <li><a href="/privacy" className="hover:text-white transition-colors text-xs">Privacy Policy</a></li>
                            <li><a href="/terms" className="hover:text-white transition-colors text-xs">Terms & Conditions</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <span className="text-xs text-zinc-500">© 2026 OKernel. Released under MIT License.</span>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <span>Made with</span>
                        <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
                        <span>by the OKernel Team</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
