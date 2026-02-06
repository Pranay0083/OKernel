
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditorWindow } from './components/EditorWindow';
import { LiveTerminal } from './components/LiveTerminal';
import { ShellKernel } from '../../syscore/vm/ShellKernel';
import { ArrowLeft, Maximize2, Terminal} from 'lucide-react';
import { RamMatrix } from './components/RamMatrix';
import { Loader } from '../../components/ui/Loader';

const DEFAULT_CODE = `#include <syscore.h>

// User Configurations
#define PROMPT_COLOR "\\x1b[32m" // Green
#define ERROR_COLOR "\\x1b[31m"  // Red
#define TEXT_COLOR "\\x1b[36m"   // Cyan
#define RESET "\\x1b[0m"

// Define your shell logic here
void heap_storm() {
    printf("Starting Heap Storm! Watch MEM_DUMP area...\\n");
    int i = 0;
    while (i < 500) {
        char junk[64]; // Allocates 64 bytes on Heap
        sprintf(junk, "DATA_CHUNK_%d", i); // Writes to memory!
        printf("Allocated Heap Chunk: ."); // Minimal Log
        i++;
    }
    printf("\\n%sHeap Storm Complete. Memory Fragmented.\\n%s", TEXT_COLOR, RESET);
}

void stack_abyss(int depth) {
    int tracker = 9999; // Takes up stack space
    if (depth > 0) {
        printf("Stack Depth: %d\\n", depth);
        stack_abyss(depth - 1);
    }
}

void execute_command(char * cmd) {
    if (strcmp(cmd, "help") == 0) {
        printf("Available commands: %shelp, clear, exit, storm, stack%s\\n", TEXT_COLOR, RESET);
    }
    else if (strcmp(cmd, "storm") == 0) {
        heap_storm();
    }
    else if (strcmp(cmd, "stack") == 0) {
        printf("Diving into Stack Abyss...\\n");
        stack_abyss(50);
    }
    else if (strcmp(cmd, "clear") == 0) {
        clear();
    }
    else if (strcmp(cmd, "exit") == 0) {
        // Exit handled by main loop check (or we can return status)
        printf("Exiting...\\n");
    }
    else if (strcmp(cmd, "") == 0) {
        // Ignore empty
    }
    else {
        printf("%sError: Unknown command: %s%s\\n", ERROR_COLOR, cmd, RESET);
    }
}

// Main System Entry
int main() {
    printf("%sWelcome to SysCore Shell v2.4\\n%s", TEXT_COLOR, RESET);
    printf("Type 'help' to start. Try 'storm' or 'stack' for visuals!\\n");
    
    char cmd[100];

    while (1) {
        printf("%ssyscore> %s", PROMPT_COLOR, RESET);
        get_input(cmd);

        if (strcmp(cmd, "exit") == 0) {
            break;
        }

        execute_command(cmd);
    }

    return 0;
} `;

const BOOT_LOGS = [
    "> DETECTING_COMPILER_TOOLCHAIN...",
    "> LOADING_GCC_TRANSPILER_V9.2...",
    "> MOUNTING_SOURCE_BUFFER...",
    "> INITIALIZING_IDE_ENVIRONMENT... OK"
];

export const ShellMakerPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [code, setCode] = useState<string | undefined>(DEFAULT_CODE);
    const [logs, setLogs] = useState<string[]>([]);
    const [waitingForInput, setWaitingForInput] = useState(false);
    const [showRam, setShowRam] = useState(false); // RAM Toggle
    const [memoryData, setMemoryData] = useState<Uint8Array>(new Uint8Array()); // Memory data for RAM Matrix

    // Resizing State
    const [leftWidth, setLeftWidth] = useState(60); // Percentage
    const isDragging = useRef(false);

    // We keep kernel persistent ref, but we re-instantiate on "Run"
    const kernelRef = useRef<ShellKernel>(new ShellKernel());

    // Update memory data when showing RAM
    useEffect(() => {
        if (showRam && kernelRef.current) {
            const interval = setInterval(() => {
                setMemoryData(kernelRef.current.inspectMemory());
            }, 200);
            return () => clearInterval(interval);
        }
    }, [showRam]);

    const handleRun = () => {
        // Kill previous process if running
        kernelRef.current.kill();

        // Create new kernel instance (optional, but cleaner state)
        kernelRef.current = new ShellKernel();

        setLogs(["Compiling...", "Linking...", "Booting SysCore Kernel v2.1...", "-----------------------------------"]);

        // Boot the kernel asynchronously
        // The Kernel handles the execution loop and calls 'onUpdate' when logs or state change
        kernelRef.current.boot(code || '', (newLogs, waiting) => {
            setLogs(newLogs);
            setWaitingForInput(waiting);
        });
    };

    const handleTerminalInput = (input: string) => {
        // Send input to the running kernel process
        kernelRef.current.sendInput(input);
    };

    // Resize Logic
    const startResize = () => {
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none'; // Prevent text selection
    };

    const stopResize = () => {
        isDragging.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const newLeftWidth = (e.clientX / window.innerWidth) * 100;
        if (newLeftWidth > 20 && newLeftWidth < 80) {
            setLeftWidth(newLeftWidth);
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', stopResize);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', stopResize);
        };
    }, []);

    // Cleanup kernel on unmount
    useEffect(() => {
        return () => {
            kernelRef.current.kill();
        };
    }, []);

    if (loading) {
        return <Loader logs={BOOT_LOGS} onComplete={() => setLoading(false)} />;
    }




    return (
        <div className="h-screen w-screen flex flex-col bg-black overflow-hidden text-zinc-300 font-sans">
            {/* Custom Header (App Bar) */}
            <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-950 shrink-0 select-none">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Exit to Home"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="h-4 w-px bg-zinc-800"></div>
                    <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-blue-500" />
                        <span className="font-bold text-sm tracking-tight text-white">Shell Maker</span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-500">v1.0</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowRam(!showRam)}
                        className={`px-3 py-1 rounded text-xs font-mono font-bold border transition-all ${showRam ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                    >
                        MEM_DUMP
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-[10px] text-blue-400 font-mono uppercase">SysCore Kernel 2.4</span>
                    </div>
                    <button
                        onClick={handleRun}
                        className="px-4 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-xs font-bold font-mono transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)] hover:shadow-[0_0_25px_rgba(22,163,74,0.5)] flex items-center gap-2 active:scale-95"
                    >
                        <Maximize2 size={12} />
                        COMPILE & RUN
                    </button>
                </div>
            </div>

            {/* Resizable Work Area */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Left Pane: Editor */}
                <div style={{ width: `${leftWidth}%` }} className="h-full border-r border-zinc-800 min-w-[200px]">
                    <EditorWindow code={code || ''} onChange={setCode} />
                </div>

                {/* Resizer Handle */}
                <div
                    onMouseDown={startResize}
                    className="w-1 h-full bg-zinc-900 hover:bg-blue-500 cursor-col-resize flex items-center justify-center transition-colors z-10 shrink-0"
                >
                    <div className="h-8 w-0.5 bg-zinc-600 rounded-full"></div>
                </div>

                {/* Right Pane: Terminal + Optional RAM */}
                <div style={{ width: `${100 - leftWidth}%` }} className="h-full bg-black min-w-[200px] flex">
                    <div className="flex-1 h-full relative">
                        <LiveTerminal
                            logs={logs}
                            onInput={handleTerminalInput}
                            waitingForInput={waitingForInput}
                        />
                    </div>
                    {/* RAM Visualizer Sidebar */}
                    {showRam && (
                        <div className="w-[300px] h-full shrink-0 animate-in slide-in-from-right-10 duration-200">
                            <RamMatrix memory={memoryData} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
