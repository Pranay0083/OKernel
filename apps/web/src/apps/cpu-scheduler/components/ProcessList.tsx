import React, { useState } from 'react';
import { Process } from '../../../core/types';

interface ProcessListProps {
    processes: Process[];
    addProcess: (process: Omit<Process, 'id' | 'state' | 'color' | 'remainingTime' | 'startTime' | 'completionTime' | 'waitingTime' | 'turnaroundTime'>) => void;
    onClear: () => void;
    currentTime: number;
}

export const ProcessList: React.FC<ProcessListProps> = ({ processes, addProcess, onClear }) => {
    const [newProcess, setNewProcess] = useState({ name: '', arrivalTime: 0, burstTime: 1, priority: 1 });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addProcess({
            name: newProcess.name || `P${processes.length + 1}`,
            arrivalTime: Number(newProcess.arrivalTime),
            burstTime: Number(newProcess.burstTime),
            priority: Number(newProcess.priority),
        });
        setNewProcess(prev => ({ ...prev, name: '', burstTime: Math.floor(Math.random() * 10) + 1, priority: Math.floor(Math.random() * 5) + 1 }));
    };

    return (
        <div className="h-full flex flex-col font-mono text-xs bg-black border border-zinc-800 rounded-lg overflow-hidden">

            {/* Header Bar */}
            <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center select-none">
                <span className="text-zinc-400">PROCESS_TABLE</span>
                <button
                    onClick={onClear}
                    className="text-zinc-600 hover:text-red-500 transition-colors flex items-center gap-1"
                    title="Flush Table"
                >
                    [ FLUSH ]
                </button>
            </div>

            {/* CLI Input Form */}
            <div className="p-3 border-b border-zinc-800 bg-zinc-950">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <span className="text-primary flex-shrink-0">&gt;</span>
                    <div className="grid grid-cols-12 gap-2 flex-1 relative">
                        <input
                            type="text"
                            placeholder="NAME"
                            className="col-span-3 bg-transparent border-b border-zinc-800 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary h-6"
                            value={newProcess.name}
                            onChange={e => setNewProcess({ ...newProcess, name: e.target.value })}
                        />
                        <input
                            type="number"
                            min="0"
                            placeholder="AT"
                            className="col-span-2 bg-transparent border-b border-zinc-800 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary h-6"
                            value={newProcess.arrivalTime}
                            onChange={e => setNewProcess({ ...newProcess, arrivalTime: parseInt(e.target.value) || 0 })}
                        />
                        <input
                            type="number"
                            min="1"
                            placeholder="BT"
                            className="col-span-2 bg-transparent border-b border-zinc-800 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary h-6"
                            value={newProcess.burstTime}
                            onChange={e => setNewProcess({ ...newProcess, burstTime: parseInt(e.target.value) || 1 })}
                        />
                        <div className="col-span-2 relative group">
                            <input
                                type="number"
                                min="1"
                                placeholder="PRI"
                                className="w-full bg-transparent border-b border-zinc-800 text-white placeholder:text-zinc-700 focus:outline-none focus:border-primary h-6"
                                value={newProcess.priority}
                                onChange={e => setNewProcess({ ...newProcess, priority: parseInt(e.target.value) || 1 })}
                            />
                            <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-zinc-800 text-zinc-300 text-[9px] px-1 py-0.5 rounded whitespace-nowrap">
                                1 = High
                            </div>
                        </div>

                        <button type="submit" className="col-span-3 border border-zinc-700 text-zinc-400 hover:text-primary hover:border-primary transition-colors flex items-center justify-center">
                            ADD +
                        </button>
                    </div>
                </form>
            </div>

            {/* Raw Process List */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="text-zinc-600 sticky top-0 bg-black z-10">
                        <tr>
                            <th className="px-3 py-2 font-normal">ID</th>
                            <th className="px-3 py-2 font-normal">AT</th>
                            <th className="px-3 py-2 font-normal">BT</th>
                            <th className="px-3 py-2 font-normal">PRI</th>
                            <th className="px-3 py-2 font-normal text-right">STATUS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                        {processes.map(p => (
                            <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                                <td className="px-3 py-2">
                                    <span style={{ color: p.color }} className="font-bold">{p.name}</span>
                                </td>
                                <td className="px-3 py-2 text-zinc-400">{p.arrivalTime}</td>
                                <td className="px-3 py-2 text-zinc-400">{p.burstTime}</td>
                                <td className="px-3 py-2 text-zinc-400">{p.priority}</td>
                                <td className="px-3 py-2 text-right">
                                    <span className={`px-1 rounded-sm ${p.state === 'RUNNING' ? 'text-black bg-green-500' :
                                        p.state === 'READY' ? 'text-yellow-500' :
                                            p.state === 'COMPLETED' ? 'text-zinc-600' : 'text-zinc-600'
                                        }`}>
                                        {p.state.substring(0, 4)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {processes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-zinc-800">
                                    // table_empty
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
