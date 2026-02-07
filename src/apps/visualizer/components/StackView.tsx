import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StackFrame {
    name: string;           // Function name
    locals: Record<string, {
        value: string;
        address: string;
        type: string;
        size: number;
    }>;
    isActive: boolean;      // Is this the current frame?
    depth: number;          // Stack depth (0 = global)
}

interface StackViewProps {
    frames: StackFrame[];
    onVariableHover?: (address: string | null) => void;
    onVariableClick?: (address: string) => void;
    changedVars?: Set<string>;
}

const StackView: React.FC<StackViewProps> = ({ frames, onVariableHover, onVariableClick, changedVars }) => {
    if (frames.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-zinc-600 text-sm italic">
                <span>No stack frames</span>
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto p-2 custom-scrollbar flex flex-col-reverse gap-2">
            <AnimatePresence>
                {frames.map((frame, index) => (
                    <motion.div
                        key={`${frame.name}-${frame.depth}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className={`
                            rounded-lg border overflow-hidden
                            ${frame.isActive
                                ? 'border-green-500/50 bg-green-500/5 shadow-[0_0_10px_rgba(74,222,128,0.15)]'
                                : 'border-white/10 bg-zinc-900/50'}
                        `}
                    >
                        {/* Frame Header */}
                        <div className={`
                            px-3 py-2 flex items-center justify-between border-b
                            ${frame.isActive ? 'border-green-500/30 bg-green-500/10' : 'border-white/5 bg-zinc-800/50'}
                        `}>
                            <div className="flex items-center gap-2">
                                {frame.isActive && (
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                )}
                                <span className="font-mono text-sm font-medium">
                                    {frame.name === '<module>' ? (
                                        <span className="text-zinc-400">&lt;module&gt;</span>
                                    ) : (
                                        <span className={frame.isActive ? 'text-green-400' : 'text-zinc-300'}>
                                            {frame.name}()
                                        </span>
                                    )}
                                </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono">
                                depth: {frame.depth}
                            </span>
                        </div>

                        {/* Frame Locals */}
                        <div className="p-2 space-y-1">
                            {Object.keys(frame.locals).length === 0 ? (
                                <div className="text-[10px] text-zinc-600 italic px-1">
                                    No local variables
                                </div>
                            ) : (
                                Object.entries(frame.locals).map(([name, data]) => (
                                    <div
                                        key={name}
                                        id={`stack-var-${data.address}`}
                                        className={`flex items-center gap-2 px-2 py-1 rounded transition-colors cursor-pointer group
                                            ${changedVars?.has(name)
                                                ? 'bg-yellow-500/20 border border-yellow-500/30'
                                                : 'bg-zinc-800/50 hover:bg-zinc-700/50'}
                                        `}
                                        onMouseEnter={() => onVariableHover?.(data.address)}
                                        onMouseLeave={() => onVariableHover?.(null)}
                                        onClick={() => onVariableClick?.(data.address)}
                                    >
                                        <span className="text-blue-400 font-mono text-xs font-medium">
                                            {name}
                                        </span>
                                        <span className="text-zinc-600 text-xs">=</span>
                                        <span className="text-yellow-200 font-mono text-xs truncate flex-1">
                                            {data.value}
                                        </span>
                                        {/* Arrow indicator (will connect to heap) */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg width="12" height="12" viewBox="0 0 12 12" className="text-green-400">
                                                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default StackView;
