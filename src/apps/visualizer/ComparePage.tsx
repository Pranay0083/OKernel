import React, { useState } from 'react';
import { Play, RotateCcw, Split, Clock, Cpu, Server } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import { StatsView } from './components/StatsView';
import { FlameGraph } from './components/FlameGraph';
import { RecursionTree } from './components/RecursionTree';
import { useSysCore } from '../../hooks/useSysCore';

const ComparePage: React.FC = () => {
    // Dual Backend Instances
    const sysCoreA = useSysCore();
    const sysCoreB = useSysCore();

    const [codeA, setCodeA] = useState("l = [i for i in range(1000)]");
    const [codeB, setCodeB] = useState("l = list(range(1000))");
    const [input, setInput] = useState("");
    const [showInput, setShowInput] = useState(false);
    const [language, setLanguage] = useState<'python' | 'cpp'>('python');

    // Tab State
    const [tabA, setTabA] = useState<'hardware' | 'recursion'>('hardware');
    const [tabB, setTabB] = useState<'hardware' | 'recursion'>('recursion'); // Different default for contrast

    const isRunning = sysCoreA.isExecuting || sysCoreB.isExecuting;

    const runBoth = async () => {
        // Run in parallel
        sysCoreA.executeCode(language, codeA, input);
        sysCoreB.executeCode(language, codeB, input);
    };

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-zinc-300 overflow-hidden">
            {/* Control Bar */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur z-20">
                <div className="flex items-center gap-2">
                    <Split className="text-purple-400" />
                    <span className="font-mono font-bold text-lg text-zinc-100">BENCHMARK STUDIO</span>
                    <span className="text-xs font-mono text-zinc-500 ml-2">Dual Execution Environment</span>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'python' | 'cpp')}
                        className="bg-zinc-800 border border-white/10 text-xs rounded px-3 py-1.5"
                    >
                        <option value="python">Python 3.11</option>
                        <option value="cpp">C++ (GCC)</option>
                    </select>

                    <button
                        onClick={runBoth}
                        disabled={isRunning}
                        className={`flex items-center gap-2 px-6 py-1.5 rounded text-sm font-bold transition-all
                            ${isRunning ? 'bg-zinc-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/20 text-white'}`}
                    >
                        {isRunning ? <RotateCcw className="animate-spin" size={16} /> : <Play size={16} />}
                        RUN COMPARISON
                    </button>
                </div>
            </div>

            {/* Shared Input Panel */}
            <div className={`border-b border-white/10 bg-zinc-900/30 transition-all duration-300 ${showInput ? 'h-32' : 'h-0 overflow-hidden'}`}>
                {showInput && (
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter shared standard input (stdin) for both variants..."
                        className="w-full h-full bg-zinc-950/50 p-3 text-sm font-mono text-zinc-300 outline-none resize-none"
                    />
                )}
            </div>

            {/* Toggle Input Button (Tiny) */}
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30">
                <button
                    onClick={() => setShowInput(!showInput)}
                    className="bg-zinc-800 border-x border-b border-white/10 rounded-b-lg px-3 py-0.5 text-[9px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors uppercase"
                >
                    {showInput ? 'Hide Input' : 'Show Input'}
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">

                {/* 1. Dual Editors */}
                <div className="h-[500px] flex border-b border-white/10">
                    {/* Left Pane */}
                    <div className="flex-1 flex flex-col border-r border-white/10 relative group">
                        <div className="absolute top-2 right-4 z-10 text-xs font-mono font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">VARIANT A</div>
                        <CodeEditor
                            code={codeA}
                            onChange={setCodeA}
                            language={language}
                        />
                    </div>
                    {/* Right Pane */}
                    <div className="flex-1 flex flex-col relative group">
                        <div className="absolute top-2 right-4 z-10 text-xs font-mono font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">VARIANT B</div>
                        <CodeEditor
                            code={codeB}
                            onChange={setCodeB}
                            language={language}
                        />
                    </div>
                </div>

                {/* 2. Metrics Overview (Diff) */}
                <div className="p-8 max-w-6xl mx-auto">
                    <h2 className="text-sm font-mono text-zinc-500 mb-6 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={16} /> Performance Delta
                    </h2>

                    <div className="grid grid-cols-3 gap-4 mb-12">
                        <MetricCard
                            label="Total Duration"
                            valA={formatDuration(sysCoreA.history.at(-1)?.process_time || 0)}
                            valB={formatDuration(sysCoreB.history.at(-1)?.process_time || 0)}
                            better="lower"
                        />
                        <MetricCard
                            label="Peak Memory"
                            valA={formatBytes(sysCoreA.metrics?.memory || 0)}
                            valB={formatBytes(sysCoreB.metrics?.memory || 0)}
                            better="lower"
                        />
                        <MetricCard
                            label="Instruction Count"
                            valA={sysCoreA.history.length || 0}
                            valB={sysCoreB.history.length || 0}
                            better="lower"
                        />
                        <MetricCard
                            label="Max Stack Depth"
                            valA={Math.max(0, ...sysCoreA.history.map(e => e.stack_depth || 0))}
                            valB={Math.max(0, ...sysCoreB.history.map(e => e.stack_depth || 0))}
                            better="lower"
                        />
                    </div>


                    {/* 3. CPU Flame Graphs */}
                    <h2 className="text-sm font-mono text-zinc-500 mb-6 uppercase tracking-wider flex items-center gap-2">
                        <Cpu size={16} /> CPU Profiles
                    </h2>
                    <div className="grid grid-cols-2 gap-6 h-64 mb-12">
                        <div className="border border-white/5 rounded-lg overflow-hidden bg-zinc-900/30">
                            <FlameGraph history={sysCoreA.history} />
                        </div>
                        <div className="border border-white/5 rounded-lg overflow-hidden bg-zinc-900/30">
                            <FlameGraph history={sysCoreB.history} />
                        </div>
                    </div>


                    {/* 4. Deep Analysis Tabs */}
                    <h2 className="text-sm font-mono text-zinc-500 mb-6 uppercase tracking-wider flex items-center gap-2">
                        <Server size={16} /> Deep Analysis
                    </h2>
                    <div className="grid grid-cols-2 gap-6 h-[500px] mb-12">
                        {/* Variant A Analysis */}
                        <div className="flex flex-col glass rounded-xl overflow-hidden relative">
                            {/* Tab Bar */}
                            <div className="flex items-center bg-zinc-900 border-b border-white/5 px-2 pt-2 gap-1">
                                <button
                                    onClick={() => setTabA('hardware')}
                                    className={`px-4 py-1.5 rounded-t text-[10px] font-bold uppercase tracking-wider transition-colors ${tabA === 'hardware' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >Hardware</button>
                                <button
                                    onClick={() => setTabA('recursion')}
                                    className={`px-4 py-1.5 rounded-t text-[10px] font-bold uppercase tracking-wider transition-colors ${tabA === 'recursion' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >Recursion</button>
                                <span className="ml-auto mr-2 text-[9px] font-mono text-blue-400 opacity-50">VARIANT A</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 relative overflow-hidden">
                                {tabA === 'hardware' ? (
                                    <StatsView history={sysCoreA.history} minimal />
                                ) : (
                                    <RecursionTree history={sysCoreA.history} />
                                )}
                            </div>
                        </div>

                        {/* Variant B Analysis */}
                        <div className="flex flex-col glass rounded-xl overflow-hidden relative">
                            {/* Tab Bar */}
                            <div className="flex items-center bg-zinc-900 border-b border-white/5 px-2 pt-2 gap-1">
                                <button
                                    onClick={() => setTabB('hardware')}
                                    className={`px-4 py-1.5 rounded-t text-[10px] font-bold uppercase tracking-wider transition-colors ${tabB === 'hardware' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >Hardware</button>
                                <button
                                    onClick={() => setTabB('recursion')}
                                    className={`px-4 py-1.5 rounded-t text-[10px] font-bold uppercase tracking-wider transition-colors ${tabB === 'recursion' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >Recursion</button>
                                <span className="ml-auto mr-2 text-[9px] font-mono text-purple-400 opacity-50">VARIANT B</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 relative overflow-hidden">
                                {tabB === 'hardware' ? (
                                    <StatsView history={sysCoreB.history} minimal />
                                ) : (
                                    <RecursionTree history={sysCoreB.history} />
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

interface MetricCardProps {
    label: string;
    valA: string | number;
    valB: string | number;
    better: 'lower' | 'higher';
}

const MetricCard = ({ label, valA, valB }: MetricCardProps) => {
    // Simple naive comparison for visual impact
    // Assuming numeric values would require parsing since we formatted them strings.
    // For now just display values.
    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded p-4 flex flex-col gap-2">
            <span className="text-xs font-mono text-zinc-500 uppercase">{label}</span>
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-zinc-600 mb-1">Variant A</span>
                    <span className="text-xl font-bold font-mono text-blue-400">{valA}</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex flex-col items-end">
                    <span className="text-xs text-zinc-600 mb-1">Variant B</span>
                    <span className="text-xl font-bold font-mono text-purple-400">{valB}</span>
                </div>
            </div>
        </div>
    );
}

const formatDuration = (ns: number) => {
    if (!ns) return '0s';
    if (ns < 1000) return `${ns}ns`;
    if (ns < 1000000) return `${(ns / 1000).toFixed(1)}µs`;
    if (ns < 1000000000) return `${(ns / 1000000).toFixed(1)}ms`;
    return `${(ns / 1000000000).toFixed(2)}s`;
};

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default ComparePage;
