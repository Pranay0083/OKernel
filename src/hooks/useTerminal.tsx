import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TerminalOutput } from '../syscore/terminal/types';

// Type guard for SystemAction
interface SystemAction {
    action: string;
    path?: string;
    message?: string;
}

interface ComponentData {
    component: string;
    data?: { description: string; mathematics: string; code: string };
}

const isSystemAction = (content: unknown): content is SystemAction => {
    return typeof content === 'object' && content !== null && 'action' in content;
};

const isComponentData = (content: unknown): content is ComponentData => {
    return typeof content === 'object' && content !== null && 'component' in content;
};

const COMMANDS = ['help', 'applications', 'init cpu_scheduler', 'init shell', 'about', 'curr', 'clear', 'exit'];

// Force HMR update
import { execute } from '../syscore/terminal';

export const useTerminal = () => {
    const getInitialHistory = (): TerminalOutput[] => [
        { type: 'system', content: 'BOOTING SYSCORE ENGINE v1.0.1...', timestamp: Date.now() },
        { type: 'system', content: 'Type "help" for a list of commands.', timestamp: Date.now() + 100 }
    ];
    const [history, setHistory] = useState<TerminalOutput[]>(getInitialHistory);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [input, setInput] = useState('');
    const navigate = useNavigate();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on history change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const executeCommand = (cmdStr: string) => {
        const trimmed = cmdStr.trim();
        if (!trimmed) return;

        // Add to history state
        const newHistory: TerminalOutput[] = [...history, { type: 'command', content: trimmed }];

        // Add to command recall history
        setCommandHistory(prev => [trimmed, ...prev]);
        setHistoryIndex(-1);

        // Execute via SysCore Engine
        if (trimmed.toLowerCase() === 'clear') {
            setHistory([{ type: 'system', content: 'Console Cleared.' }]);
            setInput('');
            return;
        }

        const result = execute(trimmed);

        if (result) {
            // Check for navigation actions
            if (result.type === 'system' && isSystemAction(result.content) && result.content.action === 'navigate') {
                const navPath = result.content.path || '/';
                newHistory.push({ type: 'system', content: result.content.message || 'Navigating...' });
                setHistory(newHistory);
                setTimeout(() => navigate(navPath), 800);
                setInput('');
                return;
            }

            // Check for Component Responses
            if (isComponentData(result.content)) {
                const compData = result.content;
                let renderedContent: React.ReactNode = null;

                // Mapper
                switch (compData.component) {
                    case 'HelpResponse':
                        renderedContent = (
                            <div className="space-y-1 text-zinc-400">
                                <p>Available Commands:</p>
                                <ul className="list-disc list-inside pl-2">
                                    <li><strong className="text-primary">help</strong>: Show this help message</li>
                                    <li><strong className="text-primary">applications</strong>: List installed modules</li>
                                    <li><strong className="text-primary">init &lt;app_name&gt;</strong>: Launch an application (e.g. init shell)</li>
                                    <li><strong className="text-primary">about</strong>: System information</li>
                                    <li><strong className="text-primary">curr</strong>: Current roadmap status</li>
                                    <li><strong className="text-primary">syscore.ver</strong>: Engine version</li>
                                    <li><strong className="text-primary">syscore</strong>: SysCore CLI Help</li>
                                    <li><strong className="text-primary">clear</strong>: Clear the terminal</li>
                                    <li><strong className="text-primary">exit</strong>: Shutdown and return Home</li>
                                </ul>
                            </div>
                        );
                        break;
                    case 'ApplicationsList':
                        renderedContent = (
                            <div className="space-y-1">
                                <p className="text-zinc-400">INSTALLED MODULES:</p>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-4">
                                        <span className="text-green-400 font-bold">cpu_scheduler</span>
                                        <span className="text-zinc-600 text-xs">// Process Scheduling Visualizer</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-green-400 font-bold">shell_maker</span>
                                        <span className="text-zinc-600 text-xs">// SysCore 2.0 C-Shell Kernel</span>
                                    </div>
                                </div>
                            </div>
                        );
                        break;
                    case 'RoadmapStatus':
                        renderedContent = (
                            <div className="space-y-2">
                                <div>
                                    <strong className="text-green-400">CURRENT FEATURE:</strong>
                                    <p className="text-zinc-400">Terminal Interface (Console) & SysCore Scheduler v1.0.1</p>
                                </div>
                                <div>
                                    <strong className="text-yellow-400">ROADMAP:</strong>
                                    <ul className="list-disc list-inside pl-2 text-zinc-500">
                                        <li>Memory Management Visualizer (Paging/Segmentation)</li>
                                        <li>Deadlock Simulation</li>
                                        <li>File System Explorer</li>
                                    </ul>
                                </div>
                            </div>
                        );
                        break;
                    case 'CpuInfo':
                        renderedContent = (
                            <div className="text-zinc-400 text-xs font-mono">
                                <div>ARCH: x86_64_SIM</div>
                                <div>CORES: 1 (Virtual)</div>
                                <div>SCHEDULER: Round Robin / SJF / FCFS</div>
                            </div>
                        );
                        break;
                    case 'AlgoInfo': {
                        const info = compData.data;
                        if (info) {
                            renderedContent = (
                                <div className="space-y-2 p-2 border border-zinc-700 bg-zinc-900/50 rounded text-xs font-mono">
                                    <div><strong className="text-green-400">DESCRIPTION:</strong> <span className="text-zinc-300">{info.description}</span></div>
                                    <div><strong className="text-blue-400">MATH:</strong> <pre className="text-zinc-400 mt-1 whitespace-pre-wrap">{info.mathematics}</pre></div>
                                    <div><strong className="text-yellow-400">CODE:</strong>
                                        <pre className="bg-black p-2 mt-1 text-zinc-500 overflow-x-auto">{info.code}</pre>
                                    </div>
                                </div>
                            );
                        }
                        break;
                    }
                    default:
                        renderedContent = JSON.stringify(result.content);
                }

                newHistory.push({ type: result.type as TerminalOutput['type'], content: renderedContent });
            } else {
                newHistory.push({ type: result.type as TerminalOutput['type'], content: result.content as React.ReactNode });
            }
        }

        setHistory(newHistory);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            executeCommand(input);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (!input) return;

            const match = COMMANDS.find(cmd => cmd.startsWith(input.toLowerCase()));
            if (match) {
                setInput(match);
            }
        }
    };

    return {
        history,
        input,
        setInput,
        handleKeyDown,
        bottomRef
    };
};
