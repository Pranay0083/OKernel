import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Square, Activity, Database, Server, Clock, ChevronLeft, ChevronRight, Cpu, GitGraph } from 'lucide-react';
import { useNavigate, useSearchParams, useParams, useOutletContext } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import HeapView from './components/HeapView';
import StackView from './components/StackView';
import { StatsView } from './components/StatsView';
import { FlameGraph } from './components/FlameGraph';
import { RecursionTree } from './components/RecursionTree';



import { useSysCore } from '../../hooks/useSysCore';
import { Persistence, UserSession } from '../../services/persistence';
import { AreaChart, Area, ResponsiveContainer, ReferenceLine } from 'recharts';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';

interface LocalVar {
    value: string;
    type: string;
    address?: string;
    size?: number;
}
interface FrameData {
    locals?: Record<string, LocalVar>;
    function?: string;
    stack_depth?: number;
    line?: number;
    event?: string;
    type?: string;
    duration?: number;
    bytecode?: { opcode: string };
    content?: string;
    phase?: string;
    memory_curr?: number;
    cpu_usage?: number;
}

interface ControlBtnProps {
    icon: React.ReactNode;
    onClick: () => void;
    active?: boolean;
}

interface HeapObject {
    id: string;
    type: string;
    value: string;
    size: number;
}

const VisualizerPage: React.FC = () => {
    const { mode } = useParams<{ mode: string }>();
    const { isConnected, isExecuting, logs, executeCode, jobId, history, fetchTrace } = useSysCore();
    const updateXarrow = useXarrow();
    const navigate = useNavigate();
    
    // Get Session Context (Settings)
    const { session } = useOutletContext<{ session: UserSession }>();

    // Parse View Mode from URL
    const viewMode = useMemo(() => {
        if (mode === 'cpu') return 'cpu';
        if (mode === 'mem') return 'mem';
        if (mode === 'hardware') return 'hardware';
        if (mode === 'recursion') return 'recursion';
        return 'default';
    }, [mode]);

    const setViewMode = (newMode: 'default' | 'cpu' | 'mem' | 'compare' | 'hardware' | 'recursion') => {
        if (newMode === 'default') navigate('/platform/execution');
        else if (newMode === 'compare') navigate('/platform/compare');
        else navigate(`/platform/${newMode}`);
    };

    // Load Job from URL
    const [searchParams] = useSearchParams();

    // Resizing State
    const [leftPanelWidth, setLeftPanelWidth] = useState(40); // %
    const [stackPanelWidth, setStackPanelWidth] = useState(33); // %
    const [bottomPanelHeight, setBottomPanelHeight] = useState(352); // px (256 + 96)
    
    const resizingRef = useRef<{
        active: boolean;
        type: 'main-split' | 'stack-split' | 'bottom-split';
        startPos: number;
        startSize: number;
    } | null>(null);

    // Initial State Logic
    const loadJobId = searchParams.get('loadJob');
    const autoRun = searchParams.get('autoRun') === 'true';
    const existingJob = useMemo(() => loadJobId ? Persistence.getJob(loadJobId) : null, [loadJobId]);

    const [code, setCode] = useState<string>('l = [1, 2, 3]\nimport gc\nprint("Address:", hex(id(l)))\nl = None\ngc.collect()');
    const [input, setInput] = useState<string>('');
    const [showInput, setShowInput] = useState(false);
    const [language, setLanguage] = useState<'python' | 'cpp'>('python');

    // Load existing job details into Editor state when job changes
    useEffect(() => {
        if (existingJob) {
            setCode(existingJob.code);
            setInput(existingJob.input || '');
            setLanguage(existingJob.language);
            setShowInput(!!existingJob.input);
        }
    }, [existingJob]);

    // Handle AutoRun OR Just Loading History
    // Using a ref to prevent double-execution/fetching on re-renders
    const hasLoadedRef = useRef<string | null>(null);

    useEffect(() => {
        if (loadJobId && hasLoadedRef.current !== loadJobId) {
            hasLoadedRef.current = loadJobId;

            if (autoRun && existingJob) {
                 // Run fresh execution
                 // Slight delay to ensure state is ready
                 setTimeout(() => {
                    executeCode(existingJob.language, existingJob.code, existingJob.input);
                 }, 100);
            } else {
                // Just load the trace history without re-running
                fetchTrace(loadJobId);
            }
        }
    }, [loadJobId, autoRun, existingJob, executeCode, fetchTrace]);

    // ... (rest of the file)
    
    // Resize Handlers (Moved down to fix scope)
    const startResize = (e: React.MouseEvent, type: 'main-split' | 'stack-split' | 'bottom-split') => {
        e.preventDefault();
        const startPos = type === 'bottom-split' ? e.clientY : e.clientX;
        const startSize = type === 'main-split' ? leftPanelWidth 
            : type === 'stack-split' ? stackPanelWidth 
            : bottomPanelHeight;

        resizingRef.current = { active: true, type, startPos, startSize };
        document.body.style.cursor = type === 'bottom-split' ? 'row-resize' : 'col-resize';
        document.body.style.userSelect = 'none';
    };

    const onMouseMove = React.useCallback((e: MouseEvent) => {
        if (!resizingRef.current?.active) return;
        const { type, startPos, startSize } = resizingRef.current;

        if (type === 'main-split') {
            const delta = ((e.clientX - startPos) / window.innerWidth) * 100;
            const newWidth = Math.min(80, Math.max(20, startSize + delta));
            setLeftPanelWidth(newWidth);
        } else if (type === 'stack-split') {
            const rightPanelRatio = (100 - leftPanelWidth) / 100;
            const delta = ((e.clientX - startPos) / (window.innerWidth * rightPanelRatio)) * 100;
            const newWidth = Math.min(80, Math.max(20, startSize + delta));
            setStackPanelWidth(newWidth);
        } else if (type === 'bottom-split') {
            const delta = startPos - e.clientY; 
            const newHeight = Math.min(600, Math.max(100, startSize + delta));
            setBottomPanelHeight(newHeight);
        }
        
        updateXarrow(); 
    }, [leftPanelWidth, updateXarrow]);

    const onMouseUp = React.useCallback(() => {
        if (resizingRef.current?.active) {
            resizingRef.current = null;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            updateXarrow();
        }
    }, [updateXarrow]);

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [onMouseMove, onMouseUp]);

    // Force update arrows on scroll or resize
    useEffect(() => {
        setTimeout(() => updateXarrow(), 100);
        window.addEventListener('resize', updateXarrow);
        return () => window.removeEventListener('resize', updateXarrow);
    }, [updateXarrow]);


    // Group History into Macro Steps (Lines)
    const macroHistory = useMemo(() => {
        const groups: { main: FrameData; micros: FrameData[] }[] = [];
        let currentGroup: { main: FrameData; micros: FrameData[] } | null = null;

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
    const [highlightedAddress, setHighlightedAddress] = useState<string | null>(null);
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
            // We want to verify if this is actually causing issues. 
            // The warning suggests cascades. 
            // However, this effect depends on `macroHistory.length`, which changes when execution updates.
            // Setting state here is intended to "follow" the head.
            // To satisfy lint, we can wrap in a requestAnimationFrame or similar to decouple from render cycle,
            // OR ignore if we accept the behavior.
            // Better: Updating `macroIndex` is a side effect of `macroHistory` growing during execution.

            const targetIndex = Math.max(0, macroHistory.length - 1);
            if (macroIndex !== targetIndex) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setMacroIndex(targetIndex);
                setMicroIndex(-1);
            }
        }
    }, [macroHistory.length, isExecuting, isReplaying, macroIndex]);

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
    }, [macroIndex, microIndex, macroHistory, frameToRender, currentMacro]);

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
        const objects: HeapObject[] = [];
        const seen = new Set<string>();

        Object.values(frameToRender.locals).forEach((local: LocalVar) => {
            if (local.address && !seen.has(local.address)) {
                seen.add(local.address);
                objects.push({
                    id: local.address,
                    type: local.type,
                    value: local.value,
                    size: local.size || 0,
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

    const getEventLabel = (frame: FrameData | null) => {
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

        Object.values(frameToRender.locals).forEach((local: LocalVar) => {
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
                        zIndex={100}
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
                {/* LEFT: Code Editor */}
                <div 
                    style={{ width: `${leftPanelWidth}%` }}
                    className="flex flex-col border-r border-white/10 bg-zinc-950/50 backdrop-blur-sm relative z-10 transition-none"
                >
                    <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50 shrink-0">
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
                            options={{
                                readOnly: session?.editorConfig?.readOnly,
                                minimap: { enabled: session?.editorConfig?.minimap },
                                wordWrap: session?.editorConfig?.wordWrap ? 'on' : 'off',
                                quickSuggestions: session?.editorConfig?.autoComplete,
                            }}
                        />

                        <div className="absolute bottom-6 right-6 flex gap-3 z-10">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as 'python' | 'cpp')}
                                className="bg-zinc-900 border border-white/10 text-xs rounded px-3 py-2 outline-none focus:border-green-500 text-gray-300"
                            >
                                <option value="python">Python 3.11</option>
                                <option value="cpp">C++ (GCC)</option>
                            </select>
                            <button
                                onClick={() => executeCode(language, code, input)}
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

                    {/* Input Panel (Collapsible) */}
                    <div className={`border-t border-white/10 bg-zinc-900/30 transition-all duration-300 ${showInput ? 'h-32' : 'h-8'}`}>
                        <div
                            onClick={() => setShowInput(!showInput)}
                            className="h-8 flex items-center justify-between px-4 cursor-pointer hover:bg-white/5"
                        >
                            <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2">
                                <span className={showInput ? 'rotate-90 transition-transform' : 'transition-transform'}>▶</span>
                                Standard Input (Stdin)
                            </span>
                            {input && !showInput && <span className="text-[10px] text-zinc-600 truncate max-w-[150px]">{input}</span>}
                        </div>
                        {showInput && (
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter input for your program here..."
                                className="w-full h-[calc(100%-2rem)] bg-zinc-950/50 p-3 text-sm font-mono text-zinc-300 outline-none resize-none"
                            />
                        )}
                    </div>
                </div>

                {/* Main Splitter */}
                <div
                    onMouseDown={(e) => startResize(e, 'main-split')}
                    className="w-1 bg-zinc-900 hover:bg-blue-500 cursor-col-resize transition-colors z-50 flex items-center justify-center"
                >
                    <div className="h-8 w-0.5 bg-zinc-700 rounded-full" />
                </div>

                {/* RIGHT: Visualizations */}
                <div 
                    style={{ width: `${100 - leftPanelWidth}%` }}
                    className="flex flex-col bg-zinc-950 z-10"
                >

                    {/* Header Bar */}
                    <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50 shrink-0">
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
                                <button
                                    onClick={() => setViewMode('recursion')}
                                    className={`px-2 py-0.5 text-[10px] rounded flex items-center gap-1 ${viewMode === 'recursion' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                                >
                                    <GitGraph size={10} /> RECURSION
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
                        <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                            <span className="text-[10px] text-zinc-600 font-mono uppercase">Job ID</span>
                            <span className="text-xs text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-white/5">
                                {jobId ? jobId.substring(0, 8) : '---'}
                            </span>
                        </div>
                    </div>

                    {/* Main Visualization Area */}
                    <div className="flex-1 flex min-h-0 relative">
                        {/* HARDWARE VIEW */}
                        {viewMode === 'hardware' && (
                            <div className="flex-1 bg-zinc-950 overflow-hidden">
                                <StatsView history={history} />
                            </div>
                        )}

                        {/* RECURSION VIEW */}
                        {viewMode === 'recursion' && (
                            <div className="flex-1 bg-zinc-950 overflow-hidden">
                                <RecursionTree history={history} />
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
                                    <>
                                        <div 
                                            style={{ width: `${stackPanelWidth}%` }}
                                            className="flex flex-col z-20 bg-zinc-950"
                                        >
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

                                        {/* Stack Splitter */}
                                        <div
                                            onMouseDown={(e) => startResize(e, 'stack-split')}
                                            className="w-1 bg-zinc-900 hover:bg-blue-500 cursor-col-resize transition-colors z-50 flex items-center justify-center border-l border-r border-zinc-900"
                                        >
                                            <div className="h-6 w-0.5 bg-zinc-700 rounded-full" />
                                        </div>
                                    </>
                                )}

                                {/* Heap Objects Panel */}
                                <div 
                                    style={{ width: viewMode === 'mem' ? '100%' : `${100 - stackPanelWidth}%` }}
                                    className="flex flex-col z-20 bg-zinc-950"
                                >
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

                    {/* Bottom Splitter */}
                    <div
                        onMouseDown={(e) => startResize(e, 'bottom-split')}
                        className="h-1 bg-zinc-900 hover:bg-blue-500 cursor-row-resize transition-colors z-50 flex items-center justify-center border-t border-b border-zinc-900"
                    >
                         <div className="w-8 h-0.5 bg-zinc-700 rounded-full" />
                    </div>

                    {/* Timeline & Controls */}
                    <div 
                        style={{ height: `${bottomPanelHeight}px` }}
                        className="flex flex-col bg-zinc-900/50 z-30 min-h-[100px] max-h-[80vh]"
                    >
                        <div className="flex-1 p-3 flex flex-col gap-2 min-h-0">
                            {/* Charts Container */}
                            <div className="flex-1 flex gap-2 min-h-0">
                                {/* Memory Chart */}
                                <div className="flex-1 bg-zinc-900/30 rounded border border-white/5 overflow-hidden relative flex flex-col">
                                    <span className="absolute top-1 left-2 text-[9px] font-mono text-zinc-500 uppercase z-10">Memory Usage</span>
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                        <AreaChart data={history.map((h, i) => ({
                                            time: i,
                                            usage: (h.memory_curr || 0) / 1024 / 1024,
                                            isGC: h.type === 'GC'
                                        }))}>
                                            <defs>
                                                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="usage" stroke="#4ade80" fill="url(#colorMem)" strokeWidth={1.5} isAnimationActive={false} />
                                            {/* Cursor Line */}
                                            <ReferenceLine x={macroIndex} stroke="#ffffff" strokeOpacity={0.2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* CPU Chart */}
                                <div className="flex-1 bg-zinc-900/30 rounded border border-white/5 overflow-hidden relative flex flex-col">
                                    <span className="absolute top-1 left-2 text-[9px] font-mono text-zinc-500 uppercase z-10">CPU Intensity</span>
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                        <AreaChart data={history.map((h, i) => ({
                                            time: i,
                                            usage: (h as FrameData).cpu_usage || 0
                                        }))}>
                                            <defs>
                                                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="usage" stroke="#f97316" fill="url(#colorCpu)" strokeWidth={1.5} isAnimationActive={false} />
                                            {/* Cursor Line */}
                                            <ReferenceLine x={macroIndex} stroke="#ffffff" strokeOpacity={0.2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Playback Controls */}
                            <div className="flex items-center gap-4 h-8 shrink-0">
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
                        <div className="h-24 border-t border-white/10 flex flex-col bg-black/50 z-30 shrink-0">
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
            </div>
        </Xwrapper>
    );
};

const ControlBtn = ({ icon, onClick, active }: ControlBtnProps) => (
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
