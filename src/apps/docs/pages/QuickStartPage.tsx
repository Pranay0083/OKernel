import React from 'react';
import { Copy, Check, Play } from 'lucide-react';
import { useState } from 'react';

export const QuickStartPage = () => {
    return (
        <div className="space-y-12 max-w-4xl animate-fade-in pb-20">
            {/* Header */}
            <div className="space-y-6 border-b border-zinc-800 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 text-xs font-mono rounded-full border border-green-500/20">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Local Development
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">Quick Start Guide</h1>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    Set up the OKernel environment on your local machine. This guide covers installation, dependencies, and running the development server.
                </p>
            </div>

            {/* Prerequisites */}
            <div className="space-y-6" id="prerequisites">
                <h2 className="text-2xl font-bold text-white">Prerequisites</h2>
                <ul className="space-y-3 text-zinc-400">
                    <li className="flex items-center gap-3">
                        <Check className="text-green-500" size={18} />
                        <span>Node.js v18.0.0 or higher</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Check className="text-green-500" size={18} />
                        <span>npm (v9+) or yarn</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Check className="text-green-500" size={18} />
                        <span>Git for version control</span>
                    </li>
                </ul>
            </div>

            {/* Step 1: Clone */}
            <div className="space-y-4" id="clone-repo">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white border border-zinc-700">1</div>
                    <h3 className="text-xl font-bold text-white">Clone the Repository</h3>
                </div>
                <CodeBlock code="git clone https://github.com/Vaiditya2207/OKernel.git" />
                <CodeBlock code="cd OKernel" />
            </div>

            {/* Step 2: Install */}
            <div className="space-y-4" id="install-deps">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white border border-zinc-700">2</div>
                    <h3 className="text-xl font-bold text-white">Install Dependencies</h3>
                </div>
                <p className="text-zinc-400 text-sm">We use standard npm packages. This might take a minute.</p>
                <CodeBlock code="npm install" />
            </div>

            {/* Step 3: Env Vars */}
            <div className="space-y-4" id="configure-env">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white border border-zinc-700">3</div>
                    <h3 className="text-xl font-bold text-white">Configure Environment</h3>
                </div>
                <p className="text-zinc-400 text-sm">
                    Create a <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200">.env</code> file in the root directory.
                    For local development without persistence, you can skip Supabase keys, but some features might be disabled.
                </p>
                <CodeBlock
                    label=".env"
                    code={`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`}
                />
            </div>

            {/* Step 4: Run */}
            <div className="space-y-4" id="run-server">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-white border border-zinc-700">4</div>
                    <h3 className="text-xl font-bold text-white">Start Development Server</h3>
                </div>
                <CodeBlock code="npm run dev" />
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                    <Play className="text-green-500 mt-0.5" size={18} />
                    <div>
                        <p className="text-green-400 font-bold text-sm">Server Running!</p>
                        <p className="text-green-500/80 text-sm">Open <a href="http://localhost:5173" className="underline">http://localhost:5173</a> to view the application.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CodeBlock = ({ code, label }: { code: string, label?: string }) => {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-lg bg-black border border-zinc-800 overflow-hidden group">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
                <span className="text-xs font-mono text-zinc-500">{label || 'Terminal'}</span>
                <button onClick={copy} className="text-zinc-500 hover:text-white transition-colors">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>
            <div className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
                <pre>{code}</pre>
            </div>
        </div>
    );
};
