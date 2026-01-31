import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditorWindow } from './components/EditorWindow';
import { LiveTerminal } from './components/LiveTerminal';
import { ShellKernel } from './logic/ShellKernel';
import { ArrowLeft, Maximize2, Terminal } from 'lucide-react';

const DEFAULT_CODE = `#include <syscore.h>

// User Configurations
#define PROMPT_COLOR "\\x1b[32m" // Green
#define ERROR_COLOR "\\x1b[31m"  // Red
#define TEXT_COLOR "\\x1b[36m"   // Cyan
#define RESET "\\x1b[0m"

// Define your shell logic here
void execute_command(char* cmd) {
    if (strcmp(cmd, "help") == 0) {
        printf("Available commands: %shelp, clear, exit%s\\n", TEXT_COLOR, RESET);
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
    printf("Type 'help' to start.\\n");
    
    char cmd[100];
    
    while(1) {
        printf("%ssyscore> %s", PROMPT_COLOR, RESET);
        get_input(cmd);
        
        if (strcmp(cmd, "exit") == 0) {
            break;
        }
        
        execute_command(cmd);
    }
    
    return 0;
}`;

export const ShellMakerPage = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState<string | undefined>(DEFAULT_CODE);
    const [logs, setLogs] = useState<string[]>([]);
    const [waitingForInput, setWaitingForInput] = useState(false);

    // Resizing State
    const [leftWidth, setLeftWidth] = useState(60); // Percentage
    const isDragging = useRef(false);

    // We keep kernel persistent ref, but we re-instantiate on "Run"
    const kernelRef = useRef<ShellKernel>(new ShellKernel());

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
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-[10px] text-blue-400 font-mono uppercase">SysCore Kernel 2.1</span>
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

                {/* Right Pane: Terminal */}
                <div style={{ width: `${100 - leftWidth}%` }} className="h-full bg-black min-w-[200px] flex flex-col">
                    <LiveTerminal
                        logs={logs}
                        onInput={handleTerminalInput}
                        waitingForInput={waitingForInput}
                    />
                </div>
            </div>
        </div>
    );
};
