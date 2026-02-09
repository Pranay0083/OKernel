
import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Cpu } from 'lucide-react';
import { Button } from '../ui/Button';

export const ProductNavbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo Area */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center rounded group-hover:border-green-500 transition-colors">
                        <Terminal size={16} className="text-zinc-400 group-hover:text-green-500 transition-colors" />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">
                        OKernel.<span className="text-green-500">Sympathy</span>
                    </span>
                </Link>

                {/* Center Links (Desktop) */}
                <div className="hidden md:flex items-center gap-8 text-sm font-mono text-zinc-400">
                    <a href="#features" className="hover:text-white transition-colors">Modules</a>
                    <a href="#engineering" className="hover:text-white transition-colors">Architecture</a>
                    <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <Link to="/auth">
                        <Button
                            variant="ghost"
                            className="text-zinc-400 hover:text-white hover:bg-white/5 font-mono text-xs"
                        >
                            Log In
                        </Button>
                    </Link>
                    <Link to="/auth">
                        <Button
                            className="bg-zinc-100 hover:bg-white text-black font-bold h-9 px-4 text-xs font-mono flex items-center gap-2"
                        >
                            <Cpu size={14} /> GET_ACCESS
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};
