import React from 'react';
import { MutexSimState } from '../../../syscore/mutex/types';
import { ALGORITHM_CODE } from '../codeSnippets';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    state: MutexSimState;
}

export const CodeTracePanel: React.FC<Props> = ({ state }) => {
    const codeLines = ALGORITHM_CODE[state.algorithm] || [];

    return (
        <div className="h-full w-full flex flex-col bg-zinc-950/80 border-l border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-zinc-900/50 backdrop-blur-sm z-10">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Instruction Trace</span>
                <span className="text-[9px] text-zinc-600 font-mono">
                    {state.algorithm}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-xs relative z-0">
                {codeLines.map((line, idx) => {
                    // Find all threads currently at this instruction pointer
                    const threadsAtLine = state.threads.filter(t => t.currentLine === idx);

                    // Check if this is the critical section comment to highlight it differently
                    const isCS = line.includes("CRITICAL SECTION");
                    const isComment = line.trim().startsWith("//");

                    return (
                        <div key={idx} className={`relative flex items-center min-h-[24px] pl-10 pr-2 rounded transition-colors duration-200 group ${threadsAtLine.length > 0 ? 'bg-zinc-800/40' : 'hover:bg-zinc-900/40'}`}>

                            {/* Line Number */}
                            <span className="absolute left-2 top-1 text-[10px] text-zinc-700 select-none w-6 text-right">
                                {idx}
                            </span>

                            {/* Thread Markers */}
                            <div className="absolute left-10 flex -space-x-1.5 -translate-x-full pr-3 z-10 transition-all duration-300">
                                <AnimatePresence>
                                    {threadsAtLine.map((t, i) => (
                                        <motion.div
                                            key={`${t.id}-${state.currentStep}`}
                                            initial={{ opacity: 0, scale: 0.5, x: -10 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
                                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black tracking-tighter"
                                            style={{
                                                backgroundColor: t.color,
                                                color: '#000',
                                                boxShadow: `0 0 10px ${t.color}60`,
                                                zIndex: 10 - i
                                            }}
                                            title={`Thread ${t.name} is executing this line`}
                                        >
                                            {t.id}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Code Text */}
                            <pre className={`m-0 flex-1 whitespace-pre-wrap ${isCS ? 'text-green-500 font-bold' : isComment ? 'text-zinc-500 italic' : 'text-zinc-300'} transition-all duration-200`}>
                                {line}
                            </pre>

                            {/* Active Line Highlight Border */}
                            {threadsAtLine.length > 0 && (
                                <motion.div
                                    className="absolute left-0 top-0 bottom-0 w-0.5"
                                    style={{ backgroundColor: threadsAtLine[0].color }}
                                    layoutId="activeLineBorder"
                                    transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Faded overlay at bottom to look nice */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none z-10" />
        </div>
    );
};
