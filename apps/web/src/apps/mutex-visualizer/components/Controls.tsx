import React from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';
import { MutexSimState, MutexAlgorithm } from '../../../syscore/mutex/types';

interface Props {
    state: MutexSimState;
    setState: React.Dispatch<React.SetStateAction<MutexSimState>>;
    onReset: () => void;
    onAlgorithmChange: (algo: MutexAlgorithm) => void;
    onThreadCountChange: (n: number) => void;
    onSemaphoreChange: (v: number) => void;
}

const ALGO_LABELS: Record<MutexAlgorithm, string> = {
    PETERSON: "Peterson's Algorithm",
    DEKKER: "Dekker's Algorithm",
    BAKERY: "Bakery (Lamport)",
    TAS: "Test-And-Set",
    CAS: "Compare-And-Swap",
    SEMAPHORE: "Semaphore",
};

const ALGO_CATEGORIES: Record<MutexAlgorithm, 'SOFTWARE' | 'HARDWARE'> = {
    PETERSON: 'SOFTWARE',
    DEKKER: 'SOFTWARE',
    BAKERY: 'SOFTWARE',
    TAS: 'HARDWARE',
    CAS: 'HARDWARE',
    SEMAPHORE: 'HARDWARE',
};

export const Controls: React.FC<Props> = ({ state, setState, onReset, onAlgorithmChange, onThreadCountChange, onSemaphoreChange }) => {
    const isTwoThreadOnly = state.algorithm === 'PETERSON' || state.algorithm === 'DEKKER';
    const maxThreads = isTwoThreadOnly ? 2 : 8;

    return (
        <div className="flex flex-wrap items-center gap-4 w-full font-mono text-xs">
            {/* Playback Controls */}
            <div className="flex items-center -space-x-px">
                <button
                    onClick={() => setState(s => ({ ...s, isPlaying: !s.isPlaying }))}
                    className={`h-8 px-4 flex items-center justify-center border transition-colors ${state.isPlaying
                        ? 'bg-zinc-900 border-yellow-700 text-yellow-500 hover:bg-yellow-900/20'
                        : 'bg-zinc-900 border-green-800 text-green-500 hover:bg-green-900/20'
                        }`}
                >
                    {state.isPlaying ? '[ PAUSE ]' : '[ RUN ]'}
                </button>
                <button
                    onClick={onReset}
                    className="h-8 px-3 flex items-center justify-center border border-zinc-700 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    title="Reset Simulation"
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block"></div>

            {/* Algorithm Selector */}
            <div className="flex items-center gap-2">
                <span className="text-zinc-500 select-none">MUTEX:</span>
                <div className="relative group">
                    <select
                        value={state.algorithm}
                        onChange={e => onAlgorithmChange(e.target.value as MutexAlgorithm)}
                        className="appearance-none bg-black border border-zinc-700 text-white h-8 pl-3 pr-8 focus:outline-none focus:border-primary cursor-pointer hover:border-zinc-500 transition-colors uppercase text-[11px]"
                        disabled={state.isPlaying}
                    >
                        <optgroup label="Software Mutex">
                            <option value="PETERSON">Peterson's Algorithm</option>
                            <option value="DEKKER">Dekker's Algorithm</option>
                            <option value="BAKERY">Bakery (Lamport)</option>
                        </optgroup>
                        <optgroup label="Hardware Mutex">
                            <option value="TAS">Test-And-Set</option>
                            <option value="CAS">Compare-And-Swap</option>
                            <option value="SEMAPHORE">Semaphore</option>
                        </optgroup>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-white transition-colors" />
                </div>
            </div>

            {/* Category Tag */}
            <span className={`text-[9px] px-2 py-0.5 rounded border ${ALGO_CATEGORIES[state.algorithm] === 'SOFTWARE'
                ? 'text-cyan-400 border-cyan-800 bg-cyan-900/20'
                : 'text-amber-400 border-amber-800 bg-amber-900/20'
                }`}>
                {ALGO_CATEGORIES[state.algorithm]}
            </span>

            {/* Thread Count */}
            <div className="flex items-center gap-2">
                <span className="text-zinc-500 select-none">THREADS:</span>
                <input
                    type="number"
                    value={state.algorithm === 'PETERSON' || state.algorithm === 'DEKKER' ? 2 : state.numThreads}
                    onChange={e => onThreadCountChange(Number(e.target.value))}
                    className="bg-black border border-zinc-700 text-white h-8 w-14 px-2 focus:outline-none focus:border-primary text-center"
                    min={2}
                    max={maxThreads}
                    disabled={state.isPlaying}
                />
            </div>

            {/* Semaphore Value (only for Semaphore algo) */}
            {state.algorithm === 'SEMAPHORE' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <span className="text-zinc-500 select-none">S_MAX:</span>
                    <input
                        type="number"
                        value={state.shared.semaphoreMax}
                        onChange={e => onSemaphoreChange(Number(e.target.value))}
                        className="bg-black border border-zinc-700 text-white h-8 w-14 px-2 focus:outline-none focus:border-primary text-center"
                        min={1}
                        max={state.numThreads}
                        disabled={state.isPlaying}
                    />
                </div>
            )}

            <div className="flex-1"></div>

            {/* Speed Control */}
            <div className="flex items-center gap-4">
                <span className="text-zinc-500 select-none hidden sm:inline">TICK_RATE:</span>
                <div className="flex items-center gap-2">
                    <span className="text-zinc-600">SLOW</span>
                    <input
                        type="range"
                        min="100"
                        max="2000"
                        step="100"
                        value={2100 - state.speed}
                        onChange={e => setState(s => ({ ...s, speed: 2100 - Number(e.target.value) }))}
                        className="w-24 h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary"
                    />
                    <span className="text-zinc-600">FAST</span>
                </div>
            </div>

            {/* Step Counter */}
            <div className="flex items-center gap-2 border border-zinc-800 bg-black h-8 px-3 min-w-[100px] justify-between">
                <span className="text-zinc-600">STEP=</span>
                <span className="text-primary font-bold">{state.currentStep}</span>
            </div>
        </div>
    );
};
