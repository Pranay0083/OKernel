
import React, { useState, useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';

interface LiveTerminalProps {
    logs: string[];
    onInput: (input: string) => void;
    waitingForInput: boolean;
}

// Simple ANSI Parser
// Supports: red, green, yellow, blue, cyan, magenta, white, reset, bold
const parseAnsi = (text: string) => {
    // Split by ANSI escape sequences
    // Logic: \x1b[..m
    const parts = text.split(/(\x1b\[[0-9;]*m)/g);

    const elements: React.ReactNode[] = [];
    let currentStyle: React.CSSProperties = {};
    let key = 0;

    parts.forEach(part => {
        if (part.startsWith('\x1b[')) {
            // It's a code
            const codes = part.replace(/[^\d;]/g, '').split(';').map(Number);

            codes.forEach(code => {
                // Reset
                if (code === 0) currentStyle = {};
                // Bold
                else if (code === 1) currentStyle.fontWeight = 'bold';
                // Colors (30-37)
                else if (code === 30) currentStyle.color = '#525252'; // Black (Gray)
                else if (code === 31) currentStyle.color = '#ef4444'; // Red
                else if (code === 32) currentStyle.color = '#22c55e'; // Green
                else if (code === 33) currentStyle.color = '#eab308'; // Yellow
                else if (code === 34) currentStyle.color = '#3b82f6'; // Blue
                else if (code === 35) currentStyle.color = '#a855f7'; // Magenta
                else if (code === 36) currentStyle.color = '#06b6d4'; // Cyan
                else if (code === 37) currentStyle.color = '#f5f5f5'; // White
            });
        } else if (part) {
            elements.push(<span key={key++} style={{ ...currentStyle }}>{part}</span>);
        }
    });

    return elements;
};

export const LiveTerminal: React.FC<LiveTerminalProps> = ({ logs, onInput, waitingForInput }) => {
    const [inputValue, setInputValue] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        // 'auto' is instant, preventing the "jumping" animation lag
        bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, [logs, waitingForInput]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onInput(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="h-full w-full bg-black flex flex-col border-l border-zinc-800 font-mono text-sm">
            {/* Header */}
            <div className="h-8 bg-zinc-900 flex items-center px-4 border-b border-zinc-800 gap-2 shrink-0 select-none">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <div className="flex-1 text-center pr-10">
                    <span className="text-xs text-zinc-500 flex items-center justify-center gap-2">
                        <Terminal size={12} />
                        syscore-shell-emulator
                    </span>
                </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 overflow-auto text-zinc-300 font-mono text-sm">
                {/* Render History (All lines except the last one, OR all lines if not waiting) */}
                {logs.slice(0, logs.length - 1).map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap leading-tight break-all min-h-[20px]">
                        {/* Only parse if content exists, otherwise empty div for newline */}
                        {log ? parseAnsi(log) : <span>&nbsp;</span>}
                    </div>
                ))}

                {/* Active Line (Last Line) */}
                <div className="flex items-center leading-tight min-h-[20px]">
                    {/* The Prompt / Last Output */}
                    <span className="whitespace-pre-wrap mr-1 shrink-0">
                        {logs.length > 0 ? parseAnsi(logs[logs.length - 1]) : null}
                    </span>

                    {/* The Input Field (Inline) */}
                    {waitingForInput && (
                        <div className="flex-1 min-w-[10px] flex items-center">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-transparent border-none outline-none text-white w-full caret-blue-500"
                                autoFocus
                                spellCheck={false}
                                autoComplete="off"
                            />
                        </div>
                    )}
                </div>

                <div ref={bottomRef} />
            </div>
        </div>
    );
};
