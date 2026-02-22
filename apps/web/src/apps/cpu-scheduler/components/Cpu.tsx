import React from 'react';
import { Process } from '../../../core/types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    runningProcesses: (Process | undefined)[];
}

// Single core chip component
const CoreChip: React.FC<{ process: Process | undefined; coreIndex: number; compact: boolean }> = ({ process, coreIndex, compact }) => {
    return (
        <div className={`h-full w-full flex items-center justify-center bg-black border border-zinc-800 rounded-lg shadow-inner overflow-hidden relative ${compact ? 'p-1' : 'p-4'}`}>
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-black to-black"></div>

            {/* Core label */}
            <div className={`absolute top-1 left-2 z-20 font-mono font-bold text-zinc-600 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
                CORE {coreIndex}
            </div>

            {/* The SOCKET */}
            <div className={`aspect-square h-full w-auto relative flex items-center justify-center bg-zinc-900/50 rounded-xl border border-zinc-800/50 ${compact ? 'max-h-full' : 'max-h-[400px]'}`}>

                {/* Pins - only show on non-compact */}
                {!compact && (
                    <>
                        <div className="absolute -left-1 top-8 bottom-8 flex flex-col justify-between py-4 w-4 z-0">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-600 to-yellow-500 rounded-l-full opacity-80"></div>
                            ))}
                        </div>
                        <div className="absolute -right-1 top-8 bottom-8 flex flex-col justify-between py-4 w-4 z-0">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="h-1 w-full bg-gradient-to-l from-transparent via-yellow-600 to-yellow-500 rounded-r-full opacity-80"></div>
                            ))}
                        </div>
                        <div className="absolute -top-1 left-8 right-8 flex justify-between px-4 h-4 z-0">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="w-1 h-full bg-gradient-to-b from-transparent via-yellow-600 to-yellow-500 rounded-t-full opacity-80"></div>
                            ))}
                        </div>
                        <div className="absolute -bottom-1 left-8 right-8 flex justify-between px-4 h-4 z-0">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="w-1 h-full bg-gradient-to-t from-transparent via-yellow-600 to-yellow-500 rounded-b-full opacity-80"></div>
                            ))}
                        </div>
                    </>
                )}

                {/* Compact pins */}
                {compact && (
                    <>
                        <div className="absolute -left-0.5 top-3 bottom-3 flex flex-col justify-between py-1 w-2 z-0">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-0.5 w-full bg-gradient-to-r from-transparent via-yellow-600 to-yellow-500 rounded-l-full opacity-60"></div>
                            ))}
                        </div>
                        <div className="absolute -right-0.5 top-3 bottom-3 flex flex-col justify-between py-1 w-2 z-0">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-0.5 w-full bg-gradient-to-l from-transparent via-yellow-600 to-yellow-500 rounded-r-full opacity-60"></div>
                            ))}
                        </div>
                        <div className="absolute -top-0.5 left-3 right-3 flex justify-between px-1 h-2 z-0">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="w-0.5 h-full bg-gradient-to-b from-transparent via-yellow-600 to-yellow-500 rounded-t-full opacity-60"></div>
                            ))}
                        </div>
                        <div className="absolute -bottom-0.5 left-3 right-3 flex justify-between px-1 h-2 z-0">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="w-0.5 h-full bg-gradient-to-t from-transparent via-yellow-600 to-yellow-500 rounded-b-full opacity-60"></div>
                            ))}
                        </div>
                    </>
                )}

                {/* The CHIP */}
                <div className={`${compact ? 'w-[85%] h-[85%]' : 'w-[90%] h-[90%]'} relative z-10`}>
                    <AnimatePresence mode='wait'>
                        {process ? (
                            <motion.div
                                layoutId={`process-${process.id}`}
                                key={process.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`w-full h-full bg-zinc-900 border-2 rounded-lg shadow-2xl overflow-hidden flex flex-col justify-between ${compact ? 'p-2' : 'p-5'}`}
                                style={{
                                    borderColor: process.color,
                                    boxShadow: `0 0 50px -10px ${process.color}30`
                                }}
                            >
                                {/* Header */}
                                <div className={`flex justify-between items-start border-b border-white/5 ${compact ? 'pb-1' : 'pb-1 md:pb-2'}`}>
                                    <div className="flex flex-col">
                                        <span className={`text-zinc-500 font-bold tracking-widest uppercase ${compact ? 'text-[6px]' : 'text-[8px] md:text-[9px]'}`}>ID</span>
                                        <span className={`font-mono text-white tracking-widest font-bold leading-none mt-0.5 ${compact ? 'text-[10px]' : 'text-sm md:text-xl'}`}>
                                            {1000 + process.id}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-zinc-500 font-bold tracking-widest uppercase ${compact ? 'text-[6px]' : 'text-[8px] md:text-[9px]'}`}>PRI</span>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <div className={`rounded-full ${process.priority <= 2 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'} ${compact ? 'w-1 h-1' : 'w-1.5 h-1.5'}`}></div>
                                            <span className={`font-bold leading-none ${process.priority <= 2 ? 'text-red-500' : 'text-blue-500'} ${compact ? 'text-[9px]' : 'text-sm md:text-lg'}`}>
                                                P{process.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Core Identity */}
                                <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                                    <div className={`font-black text-white tracking-tighter truncate max-w-full ${compact ? 'text-sm' : 'text-2xl md:text-4xl'}`}>
                                        {process.name}
                                    </div>
                                    {!compact && (
                                        <div className="text-[8px] md:text-[9px] text-zinc-600 mt-1 font-mono bg-black/40 px-2 py-0.5 rounded border border-white/5 hidden sm:block">
                                            THREAD: 0x{(process.id * 1024).toString(16).toUpperCase().padStart(4, '0')}
                                        </div>
                                    )}
                                </div>

                                {/* Stats Grid */}
                                <div className={`grid grid-cols-3 gap-px bg-white/5 border border-white/5 rounded overflow-hidden ${compact ? 'mb-1' : 'mb-2 md:mb-3'}`}>
                                    <div className={`bg-zinc-900/80 text-center ${compact ? 'p-0.5' : 'p-1 md:p-2'}`}>
                                        <div className={`text-zinc-500 font-bold uppercase ${compact ? 'text-[5px]' : 'text-[7px] md:text-[8px]'}`}>AT</div>
                                        <div className={`font-mono text-zinc-300 ${compact ? 'text-[8px]' : 'text-[10px] md:text-xs'}`}>{process.arrivalTime}</div>
                                    </div>
                                    <div className={`bg-zinc-900/80 text-center ${compact ? 'p-0.5' : 'p-1 md:p-2'}`}>
                                        <div className={`text-zinc-500 font-bold uppercase ${compact ? 'text-[5px]' : 'text-[7px] md:text-[8px]'}`}>BT</div>
                                        <div className={`font-mono text-zinc-300 ${compact ? 'text-[8px]' : 'text-[10px] md:text-xs'}`}>{process.burstTime}</div>
                                    </div>
                                    <div className={`bg-zinc-900/80 text-center ${compact ? 'p-0.5' : 'p-1 md:p-2'}`}>
                                        <div className={`text-zinc-500 font-bold uppercase ${compact ? 'text-[5px]' : 'text-[7px] md:text-[8px]'}`}>REM</div>
                                        <div className={`font-mono text-white font-bold ${compact ? 'text-[8px]' : 'text-xs md:text-sm'}`}>{process.remainingTime}</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className={`${compact ? 'space-y-0.5' : 'space-y-1 md:space-y-1.5'}`}>
                                    <div className={`flex justify-between text-zinc-500 font-bold uppercase tracking-wider ${compact ? 'text-[5px]' : 'text-[7px] md:text-[8px]'}`}>
                                        <span>Exec</span>
                                        <span>{Math.round(((process.burstTime - process.remainingTime) / process.burstTime) * 100)}%</span>
                                    </div>
                                    <div className={`w-full bg-zinc-950 rounded-full overflow-hidden ${compact ? 'h-0.5' : 'h-1'}`}>
                                        <motion.div
                                            className="h-full"
                                            style={{ backgroundColor: process.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((process.burstTime - process.remainingTime) / process.burstTime) * 100}%` }}
                                            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`idle-${coreIndex}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/20`}
                            >
                                <div className={`text-zinc-800 font-black tracking-tighter opacity-30 select-none ${compact ? 'text-xl' : 'text-5xl'}`}>IDLE</div>
                                {!compact && (
                                    <div className="text-zinc-800 text-[10px] font-mono mt-2 tracking-widest opacity-40">WAITING FOR INTERRUPT</div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

const getGridCols = (numCores: number): string => {
    if (numCores <= 1) return 'grid-cols-1';
    if (numCores <= 2) return 'grid-cols-2';
    if (numCores <= 4) return 'grid-cols-2';
    if (numCores <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
};

const getGridRows = (numCores: number): string => {
    if (numCores <= 2) return 'grid-rows-1';
    if (numCores <= 4) return 'grid-rows-2';
    if (numCores <= 6) return 'grid-rows-2';
    return 'grid-rows-2';
};

export const Cpu: React.FC<Props> = ({ runningProcesses }) => {
    const numCores = runningProcesses.length;
    const compact = numCores > 1;

    if (numCores <= 1) {
        return <CoreChip process={runningProcesses[0]} coreIndex={0} compact={false} />;
    }

    return (
        <div className={`h-full w-full grid ${getGridCols(numCores)} ${getGridRows(numCores)} gap-1 p-1`}>
            {runningProcesses.map((proc, i) => (
                <CoreChip key={i} process={proc} coreIndex={i} compact={compact} />
            ))}
        </div>
    );
};