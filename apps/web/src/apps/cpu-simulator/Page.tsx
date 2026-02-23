import React from 'react';
import { useSimulator } from './hooks/useSimulator';
import { TerminalLogs } from './components/TerminalLogs';
import { SimulatorControls } from './components/SimulatorControls';
import { Cpu, Server, ServerCrash, CpuIcon, Activity, Key, Lock } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { SimMutex } from '../../syscore/cpu-simulator/types';
// Removed unused PREDEFINED_SCENARIOS import

export const CPUSimulatorPage: React.FC = () => {
    const { engine, state, logs, loadScenario } = useSimulator();

    if (!state || !engine) {
        return <div className="h-screen bg-zinc-950 text-green-400 font-mono p-4">Booting Kernel...</div>;
    }

    const handleAddProcess = (arrivalTime: number, burstTime: number) => {
        engine.addProcess({
            id: `P${state.processes.size + 1}`,
            name: `Process ${state.processes.size + 1}`,
            color: ['#4ade80', '#60a5fa', '#facc15', '#f87171', '#c084fc'][state.processes.size % 5],
            arrivalTime,
            burstTime,
        });
    };

    const handleSystemAction = (type: string, value: string) => {
        if (type === 'SET_CORES') {
            engine.setCoreCount(parseInt(value, 10));
        } else if (type === 'CREATE_MUTEX') {
            engine.addMutex(value.toUpperCase().replace(/\s+/g, '_'), value);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 flex flex-col gap-6 pt-24">

                {/* Header Section */}
                <header className="mb-4">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <Cpu className="text-green-400" />
                        Core Simulator <span className="text-sm font-mono text-zinc-500 border border-zinc-800 rounded px-2 py-0.5 bg-zinc-900">v1.0.0</span>
                    </h1>
                    <p className="text-zinc-400 max-w-2xl text-sm">
                        An advanced visualization bridging CPU Scheduling and Mutex concurrency concepts.
                        Watch threads get executed continuously across multiple cores. Observe how contending for
                        locks forces them onto the explicit Blocked Queue.
                    </p>
                </header>

                {/* Scenario Selector & Controls */}
                <div className="flex flex-col gap-4">
                    <SimulatorControls
                        state={state}
                        onStart={() => engine.start()}
                        onPause={() => engine.pause()}
                        onStep={() => engine.step()}
                        onSpeedChange={(s) => engine.setSpeed(s)}
                        onAddProcess={handleAddProcess}
                        onRequestMutex={(pid, mid) => engine.requestMutex(pid, mid)}
                        onReleaseMutex={(pid, mid) => engine.releaseMutex(pid, mid)}
                        onSystemAction={handleSystemAction}
                        loadScenario={loadScenario}
                    />
                </div>

                {/* Main Vis Area */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1">

                    {/* Left Column: Queues & Lock Viz */}
                    <div className="space-y-6 xl:col-span-1">

                        {/* Ready Queue */}
                        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4 backdrop-blur-md">
                            <h2 className="text-sm font-mono text-zinc-400 mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
                                <Activity size={16} /> READY_QUEUE
                            </h2>
                            <div className="flex flex-col gap-2 min-h-[100px]">
                                {state.readyQueue.length === 0 && <div className="text-zinc-600 font-mono text-xs italic">Empty...</div>}
                                {state.readyQueue.map((pid: string) => {
                                    const p = state.processes.get(pid);
                                    if (!p) return null;
                                    return (
                                        <div key={pid} className="bg-zinc-800 border-l-4 border-green-400 rounded p-2 flex justify-between items-center text-sm font-mono shadow-sm animate-fade-in">
                                            <span>{p.id} <span className="text-zinc-500 text-xs">({p.burstTime}ms total)</span></span>
                                            <span className="text-green-400 bg-green-400/10 px-1 rounded">{p.remainingTime}ms</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mutex Statuses */}
                        <div className="bg-zinc-900 border border-white/10 rounded-lg p-4 backdrop-blur-md">
                            <h2 className="text-sm font-mono text-zinc-400 mb-3 flex items-center gap-2 border-b border-white/5 pb-2">
                                <Key size={16} /> SYSTEM_MUTEXES
                            </h2>
                            <div className="grid gap-3">
                                {(Array.from(state.mutexes.values()) as SimMutex[]).map(m => (
                                    <div key={m.id} className={`p-3 rounded border font-mono text-sm transition-colors ${m.state === 'LOCKED' ? 'bg-red-950/30 border-red-500/30' : 'bg-green-950/20 border-green-500/20'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold flex items-center gap-1">
                                                <Lock size={14} className={m.state === 'LOCKED' ? 'text-red-400' : 'text-green-400'} /> {m.id}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${m.state === 'LOCKED' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {m.state}
                                            </span>
                                        </div>
                                        <div className="text-xs text-zinc-400">Owner: {m.ownerId || 'None'}</div>
                                        <div className="text-xs text-zinc-500 mt-1">Wait Queue: {m.waitQueue.length > 0 ? m.waitQueue.join(', ') : 'Empty'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Center Columns: CPU Cores */}
                    <div className="xl:col-span-2 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                            {state.cores.map(core => (
                                <div key={core.id} className="bg-zinc-900 border border-white/10 rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md min-h-[250px] shadow-lg shadow-black/50">
                                    <div className="absolute top-4 left-4 text-xs font-mono text-zinc-500 flex items-center gap-1">
                                        <Server size={14} /> CORE_{core.id}
                                    </div>
                                    <div className="absolute top-4 right-4 text-xs font-mono text-green-400 flex items-center gap-2">
                                        <span className="animate-pulse h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                                    </div>

                                    {core.activeProcessId ? (
                                        <div className="text-center animate-fade-in w-full">
                                            <CpuIcon size={56} className="mx-auto mb-4 animate-bounce" style={{ color: state.processes.get(core.activeProcessId)?.color || '#60a5fa' }} />
                                            <div className="text-2xl font-mono text-white mb-2">{core.activeProcessId}</div>

                                            <div className="flex flex-col gap-1 items-center justify-center">
                                                <div className="text-sm font-mono px-3 py-1 rounded inline-block bg-white/5 border border-white/10">
                                                    EXEC <span className="text-blue-400">{state.processes.get(core.activeProcessId)?.remainingTime}ms</span> left
                                                </div>

                                                {/* Educational indicator of locks held */}
                                                {(state.processes.get(core.activeProcessId)?.holdingMutexes.length || 0) > 0 && (
                                                    <div className="mt-2 text-xs text-zinc-400 font-mono flex items-center gap-1 justify-center bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                                                        <Lock size={12} className="text-purple-400" /> Holds: {state.processes.get(core.activeProcessId)?.holdingMutexes.join(', ')}
                                                    </div>
                                                )}

                                                {/* Lookahead for scripts */}
                                                {state.processes.get(core.activeProcessId)?.script.map((s, idx) => (
                                                    <div key={idx} className="mt-1 text-[10px] text-zinc-500 font-mono">
                                                        [{s.type === 'REQUEST_MUTEX' ? 'Will Request' : 'Will Release'} {s.mutexId} @ {s.triggerRemainingTime}ms]
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center opacity-50">
                                            <CpuIcon size={56} className="text-zinc-600 mx-auto mb-4" />
                                            <div className="text-xl font-mono text-zinc-500">IDLE</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Terminal Logs appended below cores */}
                        <div className="flex-1 flex flex-col min-h-[300px]">
                            <TerminalLogs logs={logs} />
                        </div>
                    </div>

                    {/* Right Column: Blocked & Info */}
                    <div className="space-y-6 lg:col-span-1 flex flex-col">

                        <div className="bg-zinc-900 border border-blue-500/20 rounded-lg p-5 backdrop-blur-md shadow-inner text-sm">
                            <h2 className="text-sm font-bold text-blue-400 mb-2 font-mono border-b border-blue-500/10 pb-2 flex items-center justify-between">
                                SYS_INFO
                                <span className="bg-zinc-950 px-2 py-0.5 rounded text-zinc-500 border border-white/5">T={state.time}s</span>
                            </h2>
                            <div className="text-zinc-300 leading-relaxed font-sans mt-3">
                                Select a scenario on the left to initialize the execution context. When processes contend for Mutexes, the engine must block one thread to ensure mutual exclusion, creating wait queues.
                            </div>
                        </div>

                        {/* Blocked Queue */}
                        <div className="bg-zinc-900 border border-red-500/20 rounded-lg p-4 backdrop-blur-md">
                            <h2 className="text-sm font-mono text-red-400 mb-3 flex items-center gap-2 border-b border-red-500/10 pb-2">
                                <ServerCrash size={16} /> BLOCKED_QUEUE
                            </h2>
                            <div className="flex flex-col gap-2 overflow-y-auto max-h-[180px]">
                                {state.blockedQueue.length === 0 && <div className="text-zinc-600 font-mono text-xs italic">System Clear...</div>}
                                {state.blockedQueue.map((pid: string) => {
                                    const p = state.processes.get(pid);
                                    if (!p) return null;
                                    return (
                                        <div key={pid} className="bg-red-950/30 border-l-4 border-red-500 rounded p-2 flex justify-between items-center text-sm font-mono shadow-sm animate-fade-in">
                                            <div className="flex flex-col">
                                                <span className="text-red-200">{p.id}</span>
                                                <span className="text-zinc-500 text-xs mt-1">Wait: {p.waitingForMutex}</span>
                                            </div>
                                            <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-xs animate-pulse">HALTED</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
};
