import React from 'react';
import { CpuEvent } from '../../../syscore/cpu-simulator/types';

interface TerminalLogsProps {
    logs: CpuEvent[];
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs }) => {
    return (
        <div className="flex-1 bg-zinc-950 border border-white/10 rounded-lg p-4 font-mono text-sm overflow-y-auto min-h-[200px] shadow-inner backdrop-blur-md">
            <div className="text-green-400 mb-2 border-b border-green-400/20 pb-2">
                root@okernel:/var/log/syscore# tail -f kernel.log
            </div>
            <div className="space-y-1">
                {logs.length === 0 && <div className="text-zinc-600 italic">Waiting for events...</div>}
                {logs.map((log, idx) => {
                    let msg = '';
                    let color = 'text-zinc-400';

                    switch (log.type) {
                        case 'PROCESS_ARRIVED':
                            msg = `[${log.time}s] Process ${log.processId} booted and added to ready queue.`;
                            color = 'text-green-300';
                            break;
                        case 'PROCESS_STARTED':
                            msg = `[${log.time}s] Context switch: CPU active on Process ${log.processId}.`;
                            color = 'text-blue-300';
                            break;
                        case 'PROCESS_FINISHED':
                            msg = `[${log.time}s] Process ${log.processId} execution complete. Terminated.`;
                            color = 'text-yellow-300';
                            break;
                        case 'MUTEX_ACQUIRED':
                            msg = `[${log.time}s] Lock acquired: ${log.mutexId} by Process ${log.processId}.`;
                            color = 'text-purple-300';
                            break;
                        case 'MUTEX_BLOCKED':
                            msg = `[${log.time}s] WAIT: Process ${log.processId} blocked on Mutex ${log.mutexId}.`;
                            color = 'text-red-400';
                            break;
                        case 'MUTEX_RELEASED':
                            msg = `[${log.time}s] Lock released: ${log.mutexId} by Process ${log.processId}.`;
                            color = 'text-purple-300';
                            break;
                    }

                    return (
                        <div key={idx} className={`${color} animate-fade-in`}>
                            {msg}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
