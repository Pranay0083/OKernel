import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Terminal, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black/95 text-zinc-100 font-mono relative overflow-hidden">
            {/* Background Noise/Grid */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1),transparent_70%)] pointer-events-none"></div>

            <div className="max-w-2xl w-full space-y-8 text-center md:text-left relative z-10">
                {/* Error Header */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono rounded animate-pulse">
                    <AlertTriangle size={12} />
                    <span>KERNEL_PANIC: SECTOR_NOT_FOUND</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-orange-500 mb-4">
                    404
                </h1>

                <div className="space-y-4 font-mono text-zinc-400 text-sm border-l-2 border-red-500/30 pl-6 py-2 bg-red-500/5 rounded-r backdrop-blur-sm">
                    <p>Error: The requested resource could not be mapped to physical memory.</p>
                    <p className="text-zinc-500">
                        Stack Trace:
                        <br />
                        &gt; at Router.resolve('<span className="text-zinc-300">{location.pathname}</span>')
                        <br />
                        &gt; at MemoryManager.allocatePage(<span className="text-blue-400">0xDEADBEEF</span>)
                        <br />
                        &gt; <span className="text-red-400">Segmentation Fault (Core Dumped)</span>
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-8">
                    <Link to="/">
                        <Button size="lg" className="bg-red-600 hover:bg-red-500 text-white border-none shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                            <Home className="mr-2" size={18} /> Reboot System
                        </Button>
                    </Link>
                    <Link to="/dev/console">
                        <Button size="lg" variant="outline" className="border-zinc-700 hover:bg-zinc-800 bg-black">
                            <Terminal className="mr-2" size={18} /> Debug in Console
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
