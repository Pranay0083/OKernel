import React, { useEffect, useRef } from 'react';
import { EventEntry } from '../../../syscore/mutex/types';

interface Props {
    events: EventEntry[];
    currentStep: number;
}

const ACTION_COLORS: Record<string, string> = {
    WANT_CS: '#f59e0b',
    SET_FLAG: '#3b82f6',
    SPIN: '#f97316',
    BACKOFF: '#ef4444',
    ENTER_CS: '#22c55e',
    EXIT_CS: '#a78bfa',
    TAS_SUCCESS: '#22c55e',
    TAS_FAIL: '#ef4444',
    CAS_SUCCESS: '#22c55e',
    CAS_FAIL: '#ef4444',
    WAIT_OK: '#22c55e',
    WAIT_BLOCK: '#ef4444',
    SIGNAL: '#a78bfa',
    RELEASE: '#a78bfa',
    TAKE_TICKET: '#3b82f6',
};

export const EventLog: React.FC<Props> = ({ events, currentStep }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events.length]);

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="p-2 border-b border-border bg-muted/20 flex justify-between items-center shrink-0">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sync Log</span>
                <span className="text-[10px] text-zinc-600 font-mono">/var/log/mutex.log • step {currentStep}</span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-auto custom-scrollbar bg-black/20">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-muted/30 sticky top-0 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-3 py-1.5 border-b border-white/5 w-14">Step</th>
                            <th className="px-3 py-1.5 border-b border-white/5 w-16">Thread</th>
                            <th className="px-3 py-1.5 border-b border-white/5 w-24">Action</th>
                            <th className="px-3 py-1.5 border-b border-white/5">Detail</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-3 py-4 text-center text-zinc-600 font-mono text-[10px]">
                                    No events yet. Press [ RUN ] to start the simulation.
                                </td>
                            </tr>
                        ) : (
                            events.map((e, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    <td className="px-3 py-1 text-zinc-600 font-mono">{e.step}</td>
                                    <td className="px-3 py-1 font-bold">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: e.color }} />
                                            <span style={{ color: e.color }}>{e.threadName}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-1">
                                        <span
                                            className="text-[9px] px-1.5 py-px rounded border font-bold"
                                            style={{
                                                color: ACTION_COLORS[e.action] ?? '#a1a1aa',
                                                borderColor: `${ACTION_COLORS[e.action] ?? '#a1a1aa'}30`,
                                                backgroundColor: `${ACTION_COLORS[e.action] ?? '#a1a1aa'}10`,
                                            }}
                                        >
                                            {e.action}
                                        </span>
                                    </td>
                                    <td className="px-3 py-1 text-zinc-400 font-mono text-[10px] truncate max-w-[300px]">
                                        {e.detail}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
