import React, { useMemo } from 'react';

export interface TraceEvent {
    type: string;
    line?: number;
    function?: string;
    stack_depth?: number;
    duration?: number;
    timestamp?: number;
}

interface FlameGraphProps {
    history: TraceEvent[];
}

export const FlameGraph: React.FC<FlameGraphProps> = ({ history }) => {
    // Alternative: Just render a "Timeline Flame Chart"

    // Alternative: Just render a "Timeline Flame Chart"
    // X-axis: Time (0 to Total Duration)
    // Y-axis: Stack Depth
    // Blocks: Function Name

    const { blocks, totalTime } = useMemo(() => {
        const items: { name: string, start: number, duration: number, depth: number, color: string }[] = [];
        let totalTime = 0;

        history.forEach((event) => {
            if (event.type !== 'Trace' || !event.duration) return;

            // Random color generator based on function name
            const hue = (event.function?.split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 0) % 360;

            items.push({
                name: `${event.function}:${event.line} `,
                start: totalTime,
                duration: event.duration,
                depth: event.stack_depth || 1,
                color: `hsla(${hue}, 70 %, 50 %, 0.6)`
            });

            totalTime += event.duration;
        });

        return { blocks: items, totalTime };
    }, [history]);

    if (blocks.length === 0) return <div className="text-zinc-500 p-4 font-mono text-xs text-center mt-10">Running code... Waiting for CPU profile.</div>;

    const formatDuration = (ns: number) => {
        if (!ns) return '0s';
        if (ns < 1000) return `${ns} ns`;
        if (ns < 1000000) return `${(ns / 1000).toFixed(1)} µs`;
        if (ns < 1000000000) return `${(ns / 1000000).toFixed(1)} ms`;
        return `${(ns / 1000000000).toFixed(2)} s`;
    };

    return (
        <div className="flex flex-col h-full bg-zinc-900 rounded-lg overflow-hidden relative">
            <div className="bg-zinc-900 border-b border-white/5 px-4 py-3 flex justify-between items-center bg-gradient-to-r from-orange-500/10 to-transparent">
                <span className="text-xs font-mono font-bold text-orange-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                    CPU FLAME GRAPH
                </span>
                <span className="text-xs font-mono text-zinc-400 bg-black/40 px-2 py-1 rounded border border-white/5">{formatDuration(totalTime)} Total Time</span>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden relative p-4 custom-scrollbar bg-black/20">
                <div
                    className="relative h-full"
                    style={{ width: '100%', minWidth: '800px' }}
                >
                    {blocks.map((block, i) => (
                        <div
                            key={i}
                            className="absolute border-r border-white/5 flex items-center justify-center overflow-hidden hover:brightness-125 transition-all cursor-pointer group rounded-sm"
                            style={{
                                left: `${(block.start / totalTime) * 100}% `,
                                width: `${(block.duration / totalTime) * 100}% `,
                                bottom: `${(block.depth - 1) * 24} px`,
                                height: '22px',
                                backgroundColor: block.color,
                            }}
                        >
                            <span className="text-[10px] text-white/90 font-mono truncate px-1 pointer-events-none drop-shadow-md">
                                {block.duration > (totalTime * 0.05) ? block.name : ''}
                            </span>

                            {/* Tooltip */}
                            <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 shadow-xl pointer-events-none">
                                <div className="font-bold text-orange-400">{block.name}</div>
                                <div className="text-zinc-400">Duration: <span className="text-zinc-200">{formatDuration(block.duration)}</span></div>
                                <div className="text-zinc-500 text-[9px] mt-0.5">{(block.duration / totalTime * 100).toFixed(1)}% of total</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend or X-axis */}
            <div className="h-6 border-t border-white/5 bg-zinc-900 flex items-center justify-between px-4">
                <span className="text-[10px] text-zinc-500 font-mono">0s</span>
                <span className="text-[10px] text-zinc-500 font-mono">TIME ➔</span>
                <span className="text-[10px] text-zinc-500 font-mono">{formatDuration(totalTime)}</span>
            </div>
        </div>
    );
};


