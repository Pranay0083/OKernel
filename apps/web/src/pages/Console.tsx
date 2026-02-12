import React, { useRef, useEffect } from 'react';
import { useTerminal } from '../hooks/useTerminal';

// const KERNEL_LOGS = [
//     "> BOOT_LOADER_INIT...",
//     "> VERIFYING_KERNEL_SIGNATURE... VALID",
//     "> LOADING_SHELL_KERNEL_PID_1...",
//     "> MOUNTING_ROOT_FS... OK"
// ];

export const Console = () => {

    const { history, input, setInput, handleKeyDown, bottomRef } = useTerminal();
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input on mount and clicks
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Keep focus
    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div
            className="fixed inset-0 w-screen h-screen bg-black font-mono text-sm p-4 overflow-hidden flex flex-col items-start justify-start cursor-text"
            onClick={handleContainerClick}
        >
            {/* CRT Scanlines Overlay - keeping the vibe */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>

            {/* Terminal Content */}
            <div className="w-full h-full overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-0">
                {history.map((entry, i) => (
                    <div key={i} className="leading-relaxed">
                        {entry.type === 'command' && (
                            <div className="flex items-center gap-2 text-zinc-100">
                                <span className="text-green-500 font-bold">root@os:~#</span>
                                <span>{entry.content as React.ReactNode}</span>
                            </div>
                        )}
                        {entry.type === 'response' && (
                            <div className="text-zinc-300 ml-4 py-1 whitespace-pre-wrap">
                                {entry.content as React.ReactNode}
                            </div>
                        )}
                        {entry.type === 'error' && (
                            <div className="text-red-400 ml-4">
                                {entry.content as React.ReactNode}
                            </div>
                        )}
                        {entry.type === 'system' && (
                            <div className="text-blue-400 font-bold italic opacity-80 py-1">
                                [SYSCORE] {entry.content as React.ReactNode}
                            </div>
                        )}
                    </div>
                ))}

                {/* Interactive Input Row */}
                <div className="flex items-center gap-2 text-white mt-4">
                    <span className="text-green-500 font-bold shrink-0">root@os:~#</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent border-none outline-none flex-1 text-white caret-green-500 font-bold"
                        autoFocus
                        autoComplete="off"
                        spellCheck="false"
                    />
                </div>
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
