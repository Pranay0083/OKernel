import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

interface LoaderProps {
    logs?: string[];
    onComplete?: () => void;
}

export const Loader = ({ logs = [], onComplete }: LoaderProps) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('INITIALIZING_KERNEL');

    const defaultLogs = [
        "> MOUNTING_VIRTUAL_FS... OK",
        "> ALLOCATING_STACK_MEMORY... 1MB OK",
        "> LOADING_SCHEDULER_MODULES... OK",
        "> STARTING_SHELL_PROCESS_PID_1..."
    ];

    const displayLogs = logs.length > 0 ? logs : defaultLogs;

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    setStatus('SYSTEM_READY');
                    clearInterval(interval);
                    if (onComplete) setTimeout(onComplete, 200); // Small buffer before unmount
                    return 100;
                }
                // Random jumps for "real" feel
                return Math.min(p + Math.random() * 15, 100);
            });
        }, 150); // Slightly faster to fit 2s better with buffers

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center text-green-500 font-mono">
            <div className="w-full max-w-md p-6 space-y-6">
                <div className="flex items-center gap-3 text-xl font-bold animate-pulse">
                    <Terminal size={24} />
                    <span>SYSCORE_BOOT_SEQUENCE</span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-2 bg-zinc-900 rounded overflow-hidden border border-zinc-800">
                    <div
                        className="h-full bg-green-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex justify-between text-xs text-zinc-500 uppercase tracking-widest">
                    <span>{status}...</span>
                    <span>{Math.floor(progress)}%</span>
                </div>

                <div className="text-xs text-zinc-600 font-mono space-y-1 h-16 overflow-hidden">
                    {displayLogs.map((log, i) => (
                        <div key={i} style={{ opacity: progress > (i * (100 / displayLogs.length)) ? 1 : 0 }}>{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};
