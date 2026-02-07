import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Square, Activity, Database, Server, Clock, Download, ChevronLeft, ChevronRight, BarChart2, Cpu, MemoryStick } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import HeapView from './components/HeapView';
import StackView from './components/StackView';
import { StatsView } from './components/StatsView';
import { FlameGraph } from './components/FlameGraph';

// ... (existing imports)



import { useSysCore } from '../../hooks/useSysCore';
import { AreaChart, Area, ResponsiveContainer, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';

const VisualizerPage: React.FC = () => {
    const { isConnected, isExecuting, logs, metrics, executeCode, jobId, history } = useSysCore();
    const [code, setCode] = useState<string>('l = [1, 2, 3]\nimport gc\nprint("Address:", hex(id(l)))\nl = None\ngc.collect()');
    const [language, setLanguage] = useState<'python' | 'cpp'>('python');
    const [highlightedAddress, setHighlightedAddress] = useState<string | null>(null);
    const updateXarrow = useXarrow();

    const location = useLocation();
    const navigate = useNavigate();

    // Parse View Mode from URL
    const viewMode = useMemo(() => {
        if (location.pathname.includes(':cpu')) return 'cpu';
        if (location.pathname.includes(':mem')) return 'mem';
        if (location.pathname.includes(':compare')) return 'compare';
        if (location.pathname.includes(':hardware')) return 'hardware';
        return 'default';
    }, [location.pathname]);

    const setViewMode = (mode: 'default' | 'cpu' | 'mem' | 'compare' | 'hardware') => {
        // Strip existing suffix
        let base = location.pathname.replace(/:cpu|:mem|:compare|:hardware/g, '');
        if (base.endsWith('/')) base = base.slice(0, -1);

        if (mode === 'default') navigate(base);
        else navigate(`${base}:${mode}`);
    };

    // Force update arrows on scroll or resize
    useEffect(() => {
        setTimeout(() => updateXarrow(), 100);
        window.addEventListener('resize', updateXarrow);
        return () => window.removeEventListener('resize', updateXarrow);
    }, [updateXarrow]);

    // Group History into Macro Steps (Lines)
    const macroHistory = useMemo(() => {
        const groups: { main: any; micros: any[] }[] = [];
        let currentGroup: { main: any; micros: any[] } | null = null;

        history.forEach(event => {
            if (['line', 'call', 'return', 'exception'].includes(event.event || '') || event.type === 'Stdout') {
                if (currentGroup) groups.push(currentGroup);
                currentGroup = { main: event, micros: [] };
            } else {
                if (currentGroup) {
                    currentGroup.micros.push(event);
                } else {
                    currentGroup = { main: event, micros: [] };
                }
            }
        });
        if (currentGroup) groups.push(currentGroup);
        return groups;
    }, [history]);

    // Playback State
    const [macroIndex, setMacroIndex] = useState(0);
    const [microIndex, setMicroIndex] = useState(-1);
    const [isReplaying, setIsReplaying] = useState(false);
    const replayInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Derived Current Frame
    const currentMacro = macroHistory[macroIndex];
    // Resolve active frame: precise micro step or end of list if resetting
    const frameToRender = (currentMacro && microIndex >= 0 && currentMacro.micros[microIndex])
        ? currentMacro.micros[microIndex]
        : currentMacro?.main;

    // Auto-advance
    useEffect(() => {
        if (isExecuting && !isReplaying) {
            setMacroIndex(Math.max(0, macroHistory.length - 1));
            setMicroIndex(-1);
        }
    }, [macroHistory.length, isExecuting, isReplaying]);

    // Replay Logic
    const toggleReplay = () => {
        if (isReplaying) {
            if (replayInterval.current) clearInterval(replayInterval.current);
            setIsReplaying(false);
        } else {
            setIsReplaying(true);
            replayInterval.current = setInterval(() => {
                setMacroIndex(prev => {
                    if (prev >= macroHistory.length - 1) {
                        if (replayInterval.current) clearInterval(replayInterval.current);
                        setIsReplaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
                setMicroIndex(-1);
            }, 500);
        }
    };

    const stepMacro = (delta: number) => {
        const next = Math.max(0, Math.min(macroHistory.length - 1, macroIndex + delta));
        setMacroIndex(next);
        setMicroIndex(-1);
    };

    // Compute changed variables for highlighting
    const changedVars = useMemo(() => {
        if (macroIndex === 0 && microIndex <= 0) return new Set<string>();

        const prevMacro = microIndex > 0 ? currentMacro : macroHistory[macroIndex - 1];
        // If microIndex is 0, we compare with the LAST micro of the PREVIOUS macro
        // If microIndex > 0, we compare with microIndex - 1
        let prevFrame = null;
        if (microIndex > 0 && currentMacro) {
            prevFrame = currentMacro.micros[microIndex - 1];
        } else if (prevMacro) {
            prevFrame = prevMacro.micros?.length > 0
                ? prevMacro.micros[prevMacro.micros.length - 1]
                : prevMacro.main;
        }

        if (!prevFrame || !frameToRender) return new Set<string>();

        const changes = new Set<string>();
        const prevLocals = prevFrame.locals || {};
        const currLocals = frameToRender.locals || {};

        Object.keys(currLocals).forEach(key => {
            // Check if value changed or if it's new
            if (!prevLocals[key] || prevLocals[key].value !== currLocals[key].value) {
                changes.add(key); // Stack variable name
                if (currLocals[key].address) changes.add(currLocals[key].address); // Heap address
            }
        });
        return changes;
    }, [macroIndex, microIndex, macroHistory, frameToRender]);

    // Compute execution times per line for heatmap
    const lineExecutionTimes = useMemo(() => {
        const times: Record<number, number> = {};
        history.forEach(event => {
            if (event.line && event.duration) {
                times[event.line] = (times[event.line] || 0) + event.duration;
            }
        });
        return times;
    }, [history]);


    // Transform locals into Stack Frames for StackView
    const stackFrames = useMemo(() => {
        if (!frameToRender || !frameToRender.locals) return [];
        return [{
            name: frameToRender.function || '<module>',
            locals: frameToRender.locals,
            isActive: true,
            depth: frameToRender.stack_depth || 0,
        }];
    }, [frameToRender]);

    // Transform locals into Heap Objects for HeapView
    const heapObjects = useMemo(() => {
        if (!frameToRender || !frameToRender.locals) return [];
        const objects: { id: string; type: string; value: string; size: number }[] = [];
        const seen = new Set<string>();

        Object.values(frameToRender.locals).forEach((local: any) => {
            if (local.address && !seen.has(local.address)) {
                seen.add(local.address);
                objects.push({
                    id: local.address,
                    type: local.type,
                    value: local.value,
                    size: local.size,
                });
            }
        });

        return objects;
    }, [frameToRender]);

    const formatDuration = (ns: number) => {
        if (!ns) return '';
        if (ns < 1000) return `${ns}ns`;
        if (ns < 1000000) return `${(ns / 1000).toFixed(1)}µs`;
        return `${(ns / 1000000).toFixed(1)}ms`;
    };

    const getEventLabel = (frame: any) => {
        if (!frame) return 'Idle';
        if (frame.type === 'GC') return `Garbage Collection (${frame.phase})`;
        if (frame.event === 'opcode') return `Opcode: ${frame.bytecode?.opcode}`;
        if (frame.type === 'Stdout') return `Output: ${frame.content?.replace('\n', '\\n')}`;

        // Plain English Explanation
        let explanation = `Line ${frame.line} in ${frame.function}()`;
        if (changedVars.size > 0) {
            const vars = Array.from(changedVars).filter(v => !v.startsWith('0x')); // Filter out addresses
            if (vars.length > 0) explanation += ` • Updated: ${vars.join(', ')}`;
        }
        return explanation;
    };

    // Helper to generate arrows
    const renderArrows = () => {
        if (!frameToRender || !frameToRender.locals) return null;
        const arrows: React.ReactNode[] = [];

        Object.values(frameToRender.locals).forEach((local: any) => {
            if (local.address) {
                arrows.push(
                    <Xarrow
                        key={`${local.address}`}
                        start={`stack-var-${local.address}`}
                        end={`heap-${local.address}`}
                        color="#4ade80" // Green-400
                        strokeWidth={1.5}
                        headSize={4}
                        curveness={0.4}
                        startAnchor="right"
                        endAnchor="left"
                        path="smooth"
                        zIndex={50}
                        animateDrawing={false}
                        labels={null}
                    />
                );
            }
        });
        return arrows;
    };


    return (
        <Xwrapper>
            <div className="flex h-screen bg-zinc-950 text-gray-300 font-sans overflow-hidden">
                {/* LEFT: Code Editor (40%) */}
                <div className="w-2/5 flex flex-col border-r border-white/10 bg-zinc-950/50 backdrop-blur-sm relative z-10 transition-all duration-300">
                    <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50">
                        <span className="font-mono font-bold tracking-wider text-sm text-green-400">CODE EDITOR</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-red-500 animate-pulse'}`} />
                            <span className="text-xs uppercase font-mono text-gray-500">{isConnected ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative group">
                        <CodeEditor
                            code={code}
                            onChange={setCode}
                            language={language}
                            highlightLine={frameToRender ? frameToRender.line : undefined}
                            lineExecutionTimes={lineExecutionTimes}
                        />

                        <div className="absolute bottom-6 right-6 flex gap-3 z-10">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as any)}
                                className="bg-zinc-900 border border-white/10 text-xs rounded px-3 py-2 outline-none focus:border-green-500 text-gray-300"
                            >
                                <option value="python">Python 3.11</option>
                                <option value="cpp">C++ (GCC)</option>
                            </select>
                            <button
                                onClick={() => executeCode(language, code)}
                                disabled={isExecuting}
                                className={`flex items-center gap-2 px-6 py-2 rounded shadow-lg font-bold text-white transition-all transform hover:scale-105
                                    ${isExecuting
                                        ? 'bg-zinc-800 cursor-not-allowed opacity-50'
                                        : 'bg-green-600 hover:bg-green-500 shadow-green-500/20'
                                    }`}
                            >
                                {isExecuting ? <Clock className="animate-spin" size={16} /> : <Play size={16} fill="currentColor" />}
                                {isExecuting ? 'RUNNING' : 'EXECUTE'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Visualizations (60%) */}
                <div className="w-3/5 flex flex-col bg-zinc-950 z-10">

                    {/* Header Bar */}
                    <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50">
                        <div className="flex items-center gap-3">
                            <span className="font-mono font-bold tracking-wider text-sm text-blue-400">MEMORY MODEL</span>

                            {/* View Switcher */}
                            <div className="flex items-center bg-zinc-800 rounded p-0.5 border border-white/5 ml-4">
                                <button
                                    onClick={() => setViewMode('default')}
                                    className={`px-2 py-0.5 text-[10px] rounded ${viewMode === 'default' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    DEFAULT
                                </button>
                                <button
                                    onClick={() => setViewMode('cpu')}
                                    className={`px-2 py-0.5 text-[10px] rounded flex items-center gap-1 ${viewMode === 'cpu' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    <Cpu size={10} /> CPU
                                </button>
                                <button
                                    onClick={() => setViewMode('mem')}
                                    className={`px-2 py-0.5 text-[10px] rounded flex items-center gap-1 ${viewMode === 'mem' ? 'bg-cyan-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    <Database size={10} /> MEM
                                </button>
                                <button
                                    onClick={() => setViewMode('hardware')}
                                    className={`px-2 py-0.5 text-[10px] rounded flex items-center gap-1 ${viewMode === 'hardware' ? 'bg-zinc-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    <Server size={10} /> HARDWARE
                                </button>
                            </div>

                            <div className="flex items-center gap-1.5 bg-zinc-800 px-2 py-1 rounded border border-white/5 ml-auto">
                                <Activity size={12} className="text-orange-400" />
                                <span className="text-[10px] font-mono whitespace-nowrap">
                                    {getEventLabel(frameToRender)}
                                </span>
                            </div>
                            {/* Opcode Badge */}
                            {frameToRender?.bytecode && (
                                <div className="flex items-center gap-1.5 bg-zinc-800 px-2 py-1 rounded border border-white/5">
                                    <Server size={12} className="text-purple-400" />
                                    <span className="text-[10px] font-mono whitespace-nowrap text-purple-300">
                                        OP: {frameToRender.bytecode.opcode}
                                    </span>
                                </div>
                            )}
                            {/* Duration Badge */}
                            {frameToRender?.duration && (
                                <div className="flex items-center gap-1.5 bg-zinc-800 px-2 py-1 rounded border border-white/5">
                                    <Clock size={12} className="text-pink-400" />
                                    <span className="text-[10px] font-mono whitespace-nowrap text-pink-300">
                                        {formatDuration(frameToRender.duration)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-zinc-500 font-mono">Job: {jobId ? jobId.substring(0, 8) : '---'}</span>
                    </div>

                    {/* Main Visualization Area */}
                    <div className="flex-1 flex min-h-0 relative">
                        {/* HARDWARE VIEW */}
                        {viewMode === 'hardware' && (
                            <div className="flex-1 bg-zinc-950 overflow-hidden">
                                <StatsView history={history} />
                            </div>
                        )}

                        {/* CPU VIEW: FlameGraph */}
                        {viewMode === 'cpu' && (
                            <div className="flex-1 p-4 bg-zinc-950 flex flex-col gap-4">
                                <div className="h-2/3">
                                    <FlameGraph history={history} />
                                </div>
                                <div className="h-1/3 bg-zinc-900/30 border border-white/5 rounded p-4 overflow-auto">
                                    <h3 className="text-orange-400 font-mono text-xs mb-2">HOTSPOTS (Top 5)</h3>
                                    {Object.entries(lineExecutionTimes)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([line, duration], i) => (
                                            <div key={i} className="flex justify-between items-center text-xs font-mono py-1 border-b border-white/5">
                                                <span className="text-zinc-400">Line {line}</span>
                                                <span className="text-zinc-200">{formatDuration(duration)}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* DEFAULT / MEM VIEW */}
                        {(viewMode === 'default' || viewMode === 'mem') && (
                            <>
                                {/* Arrows Layer */}
                                {viewMode === 'default' && renderArrows()}

                                {/* Stack Frames Panel */}
                                {viewMode === 'default' && (
                                    <div className="w-1/3 border-r border-white/10 flex flex-col z-20 bg-zinc-950">
                                        <div className="h-8 border-b border-white/5 flex items-center px-3 bg-zinc-900/30">
                                            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">Stack Frames</span>
                                        </div>
                                        <div className="flex-1 overflow-auto custom-scrollbar relative" onScroll={updateXarrow}>
                                            <StackView
                                                frames={stackFrames}
                                                onVariableHover={setHighlightedAddress}
                                                onVariableClick={(addr) => setHighlightedAddress(addr)}
                                                changedVars={changedVars}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Heap Objects Panel */}
                                <div className={`${viewMode === 'mem' ? 'w-full' : 'w-2/3'} flex flex-col z-20 bg-zinc-950`}>
                                    <div className="h-8 border-b border-white/5 flex items-center px-3 bg-zinc-900/30">
                                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Heap Objects</span>
                                        <span className="ml-auto text-[9px] text-zinc-600 font-mono">{heapObjects.length} objects</span>
                                    </div>
                                    <div className="flex-1 overflow-auto custom-scrollbar relative" onScroll={updateXarrow}>
                                        <HeapView
                                            objects={heapObjects}
                                            highlightId={highlightedAddress || undefined}
                                            onObjectClick={(id) => setHighlightedAddress(id)}
                                            changedIds={changedVars}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Timeline & Controls */}
                    <div className="h-48 border-t border-white/10 bg-zinc-900/50 p-3 flex flex-col gap-2 z-30">
                        {/* Memory Chart with GC Markers */}
                        <div className="h-32 bg-zinc-900/30 rounded border border-white/5 overflow-hidden relative group/chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history.map((h, i) => ({
                                    time: i,
                                    usage: (h.memory_curr || 0) / 1024 / 1024,
                                    isGC: h.type === 'GC',
                                    phase: h.type === 'GC' ? h.phase : null
                                }))}>
                                    <Area
                                        type="step"
                                        dataKey="usage"
                                        stroke="#4ade80"
                                        fill="#4ade80"
                                        fillOpacity={0.1}
                                        strokeWidth={1}
                                        isAnimationActive={false}
                                    />
                                    {/* GC Markers */}
                                    {history.map((h, i) => (
                                        h.type === 'GC' ? (
                                            <ReferenceLine
                                                key={i}
                                                x={i}
                                                stroke="#ef4444"
                                                strokeDasharray="2 2"
                                                strokeOpacity={0.5}
                                                label={{
                                                    value: 'GC',
                                                    position: 'insideTop',
                                                    fill: '#ef4444',
                                                    fontSize: 8
                                                }}
                                            />
                                        ) : null
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <ControlBtn onClick={() => stepMacro(-1)} icon={<ChevronLeft size={16} />} />
                                <ControlBtn onClick={toggleReplay} active={isReplaying} icon={isReplaying ? <Square size={14} /> : <Play size={14} />} />
                                <ControlBtn onClick={() => stepMacro(1)} icon={<ChevronRight size={16} />} />
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={Math.max(0, macroHistory.length - 1)}
                                value={macroIndex}
                                onChange={(e) => {
                                    setMacroIndex(Number(e.target.value));
                                    setMicroIndex(-1);
                                    setIsReplaying(false);
                                }}
                                className="flex-1 accent-blue-500 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-[10px] font-mono text-zinc-500 w-16 text-right">
                                {macroIndex + 1} / {macroHistory.length || 1}
                            </span>
                        </div>
                    </div>

                    {/* Console Output */}
                    <div className="h-24 border-t border-white/10 flex flex-col bg-black/50 z-30">
                        <div className="h-6 border-b border-white/5 flex items-center px-3 bg-zinc-900/30">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">System Output</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 font-mono text-xs custom-scrollbar">
                            {logs.length === 0 ? (
                                <span className="text-zinc-600 italic">Awaiting execution...</span>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="text-zinc-300 pl-2 py-0.5 border-l-2 border-transparent hover:border-green-500">
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Xwrapper>
    );
};

const ControlBtn = ({ icon, onClick, active }: any) => (
    <button
        onClick={onClick}
        className={`p-1.5 rounded transition-all ${active
            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-transparent'
            }`}
    >
        {icon}
    </button>
);

export default VisualizerPage;
