import React, { useMemo } from 'react';
import { MutexSimState } from '../../../syscore/mutex/types';
import { motion } from 'framer-motion';

interface Props {
    state: MutexSimState;
}

export const WaitGraphPanel: React.FC<Props> = ({ state }) => {
    // Determine wait-for edges based on algorithm and thread state
    const edges = useMemo(() => {
        const result: { from: number, to: number, label: string }[] = [];

        // Find threads holding the resource
        const csThreads = state.threads.filter(t => t.state === 'IN_CS' || t.state === 'EXITING');

        state.threads.forEach(t => {
            if (t.state === 'ENTERING') {
                // Determine who they are waiting for
                csThreads.forEach(csT => {
                    if (t.id !== csT.id) {
                        result.push({
                            from: t.id,
                            to: csT.id,
                            label: 'waits-for'
                        });
                    }
                });

                // For Bakker's, they might also be waiting on someone with a lower ticket in ENTERING state
                if (state.algorithm === 'BAKERY') {
                    const myTicket = state.shared.tickets[t.id];
                    state.threads.forEach(otherT => {
                        if (otherT.id !== t.id && (otherT.state === 'WANTING' || otherT.state === 'ENTERING')) {
                            const theirTicket = state.shared.tickets[otherT.id];
                            if (theirTicket !== 0 && (theirTicket < myTicket || (theirTicket === myTicket && otherT.id < t.id))) {
                                result.push({
                                    from: t.id,
                                    to: otherT.id,
                                    label: 'waits-for'
                                });
                            }
                        }
                    });
                }
            }
        });

        return result;
    }, [state.threads, state.algorithm, state.shared.tickets]);

    // Simple circular layout calculation
    const radius = 60;
    const center = { x: 120, y: 120 };

    // Position calculation for thread nodes
    const getPos = (id: number, total: number) => {
        if (total === 1) return { x: center.x, y: center.y };
        if (total === 2) return {
            x: center.x + (id === 0 ? -radius : radius),
            y: center.y
        };
        const angle = (id / total) * Math.PI * 2 - Math.PI / 2;
        return {
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius
        };
    };

    return (
        <div className="h-full w-full flex flex-col bg-zinc-950/80 rounded-xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-zinc-900/50 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Wait-For Graph (RAG)</span>
                <span className="text-[9px] text-zinc-600 font-mono">
                    {edges.length > 0 ? `${edges.length} Dependencies` : 'No Contention'}
                </span>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4">
                {state.threads.length > 0 ? (
                    <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" opacity="0.8" />
                            </marker>
                        </defs>

                        {/* Dynamic Edges */}
                        {edges.map((edge, i) => {
                            const p1 = getPos(edge.from, state.numThreads);
                            const p2 = getPos(edge.to, state.numThreads);

                            // Calculate a slight curve if bidirectional or just to look nice
                            const dx = p2.x - p1.x;
                            const dy = p2.y - p1.y;
                            const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;

                            // M startX,startY A rx,ry x-axis-rotation large-arc-flag,sweep-flag endX,endY
                            const path = `M ${p1.x},${p1.y} A ${dr},${dr} 0 0,1 ${p2.x},${p2.y}`;

                            return (
                                <g key={`${edge.from}-${edge.to}`}>
                                    <motion.path
                                        d={path}
                                        fill="none"
                                        stroke="#ef4444"
                                        strokeWidth="2"
                                        strokeDasharray="4 4"
                                        markerEnd="url(#arrowhead)"
                                        opacity={0.8}
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.8 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    {/* Small wait label in middle of curve approximated */}
                                    <text
                                        x={(p1.x + p2.x) / 2}
                                        y={(p1.y + p2.y) / 2 - 10}
                                        fill="#ef4444"
                                        fontSize="8"
                                        textAnchor="middle"
                                        className="font-mono font-bold"
                                    >
                                        waits
                                    </text>
                                </g>
                            );
                        })}

                        {/* Thread Nodes */}
                        {state.threads.map(t => {
                            const pos = getPos(t.id, state.numThreads);
                            const isWaiting = t.state === 'ENTERING';
                            const isHolding = t.state === 'IN_CS' || t.state === 'EXITING';

                            return (
                                <motion.g
                                    key={t.id}
                                    initial={{ scale: 0, x: pos.x, y: pos.y }}
                                    animate={{ scale: 1, x: pos.x, y: pos.y }}
                                    transition={{ type: "spring" }}
                                >
                                    {/* Pulse ring if in CS or Wanting */}
                                    {(isWaiting || isHolding) && (
                                        <motion.circle
                                            r="24"
                                            fill="none"
                                            stroke={t.color}
                                            strokeWidth="2"
                                            initial={{ scale: 0.8, opacity: 0.5 }}
                                            animate={{ scale: 1.2, opacity: 0 }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        />
                                    )}

                                    <circle
                                        r="20"
                                        fill={isHolding ? `${t.color}30` : isWaiting ? '#3f3f46' : '#18181b'}
                                        stroke={t.color}
                                        strokeWidth={isHolding ? "3" : isWaiting ? "2" : "1"}
                                        strokeDasharray={isWaiting ? "4 2" : "none"}
                                        style={{ transition: 'all 0.3s' }}
                                    />
                                    <text
                                        textAnchor="middle"
                                        dy="4"
                                        fill="#fff"
                                        fontSize="12"
                                        fontWeight="bold"
                                        className="font-mono"
                                    >
                                        T{t.id}
                                    </text>
                                </motion.g>
                            );
                        })}
                    </svg>
                ) : (
                    <div className="text-zinc-600 text-xs font-mono">No threads initialized</div>
                )}
            </div>
        </div>
    );
};
