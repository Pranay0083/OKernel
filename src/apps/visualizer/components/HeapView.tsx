import React from 'react';

interface HeapObject {
    id: string;       // Memory address
    type: string;     // Object type
    value: string;    // String representation
    size: number;     // Size in bytes
    refs?: string[];  // Addresses this object references (for containers)
}

interface HeapViewProps {
    objects: HeapObject[];
    highlightId?: string;
    onObjectClick?: (id: string) => void;
    changedIds?: Set<string>;
}

const HeapView: React.FC<HeapViewProps> = ({ objects, highlightId, onObjectClick, changedIds }) => {
    if (objects.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-zinc-600 text-sm italic">
                No heap objects allocated
            </div>
        );
    }

    // Color mapping for types
    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'list': 'border-blue-500/50 bg-blue-500/10',
            'dict': 'border-purple-500/50 bg-purple-500/10',
            'str': 'border-green-500/50 bg-green-500/10',
            'int': 'border-yellow-500/50 bg-yellow-500/10',
            'float': 'border-orange-500/50 bg-orange-500/10',
            'NoneType': 'border-zinc-500/50 bg-zinc-500/10',
            'bool': 'border-pink-500/50 bg-pink-500/10',
        };
        return colors[type] || 'border-cyan-500/50 bg-cyan-500/10';
    };

    const renderValue = (obj: HeapObject) => {
        // Special rendering for different types
        if (obj.type === 'list' && obj.value.startsWith('[')) {
            try {
                const items = JSON.parse(obj.value.replace(/'/g, '"'));
                return (
                    <div className="flex gap-0.5 mt-1">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {items.map((item: any, i: number) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-[8px] text-zinc-500">{i}</span>
                                <div className="px-2 py-1 bg-zinc-800 rounded text-xs border border-zinc-700">
                                    {String(item)}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            } catch {
                return <span className="text-xs text-zinc-300 truncate max-w-[120px]">{obj.value}</span>;
            }
        }

        if (obj.type === 'dict') {
            try {
                // Heuristic parsing for dict string representation
                // Clean up string: "{'a': 1, 'b': 2}" -> "{"a": 1, "b": 2}"
                const jsonStr = obj.value.replace(/'/g, '"').replace(/True/g, 'true').replace(/False/g, 'false').replace(/None/g, 'null');
                const items = JSON.parse(jsonStr);
                return (
                    <div className="flex flex-col gap-1 mt-1">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {Object.entries(items).map(([k, v]: [string, any], i) => (
                            <div key={i} className="flex items-center gap-1 text-[10px]">
                                <span className="text-purple-300">{k}:</span>
                                <span className="text-zinc-400 bg-zinc-800/50 px-1 rounded">{String(v)}</span>
                            </div>
                        ))}
                    </div>
                );
            } catch {
                return <span className="text-xs text-zinc-300 font-mono">{obj.value}</span>;
            }
        }

        return <span className="text-sm text-zinc-200 font-mono">{obj.value}</span>;
    };

    return (
        <div className="h-full overflow-auto p-3 custom-scrollbar">
            <div className="flex flex-wrap gap-3">
                {objects.map((obj) => (
                    <div
                        key={obj.id}
                        id={`heap-${obj.id}`}
                        onClick={() => onObjectClick?.(obj.id)}
                        className={`
                            relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                            hover:scale-105 hover:shadow-lg hover:shadow-white/5
                            ${getTypeColor(obj.type)}
                            ${highlightId === obj.id ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-zinc-900' : ''}
                            ${changedIds?.has(obj.id) ? 'shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-105 border-yellow-500/50' : ''}
                        `}
                    >
                        {/* Type Badge */}
                        <div className="absolute -top-2 left-2 px-1.5 py-0.5 bg-zinc-900 rounded text-[9px] font-mono text-zinc-400 border border-white/10">
                            {obj.type}
                        </div>

                        {/* Value */}
                        <div className="mt-2 min-w-[60px]">
                            {renderValue(obj)}
                        </div>

                        {/* Address & Size Footer */}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10 text-[9px] font-mono text-zinc-500">
                            <span className="truncate max-w-[80px]" title={obj.id}>
                                {obj.id.length > 10 ? `...${obj.id.slice(-8)}` : obj.id}
                            </span>
                            <span>{obj.size}B</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeapView;
