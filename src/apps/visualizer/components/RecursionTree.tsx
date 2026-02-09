import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitGraph, Network, X, Box, ZoomIn, ZoomOut, Move, Maximize } from 'lucide-react';

interface TreeNode {
    name: string;
    id: string;
    depth: number;
    children: TreeNode[];
    returnValue?: string;
    status: 'active' | 'completed' | 'error';
    locals?: Record<string, any>;
}

export function RecursionTree({ history }: { history: any[] }) {
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    // --- Tree Construction & Filtering ---
    const tree = useMemo(() => {
        const root: TreeNode = {
            name: 'Root',
            id: 'root',
            depth: 0,
            children: [],
            status: 'active'
        };

        const nodeStack: TreeNode[] = [root];

        history.forEach((event, index) => {
            const currentDepth = event.stack_depth || 1;
            if (currentDepth > nodeStack.length - 1) {
                const parent = nodeStack[nodeStack.length - 1];
                const newNode: TreeNode = {
                    name: event.function || `unknown`,
                    id: `node-${index}`,
                    depth: currentDepth,
                    children: [],
                    status: 'active',
                    locals: event.locals
                };
                parent.children.push(newNode);
                nodeStack.push(newNode);
            } else if (currentDepth < nodeStack.length - 1) {
                while (nodeStack.length - 1 > currentDepth) {
                    const popped = nodeStack.pop();
                    if (popped) popped.status = 'completed';
                }
            }
            if (event.type === 'Error') {
                nodeStack[nodeStack.length - 1].status = 'error';
            }
        });

        while (nodeStack.length > 1) {
            const popped = nodeStack.pop();
            if (popped) popped.status = 'completed';
        }

        // Recursively find the first meaningful node (skip <module>, main wrappers)
        const findUserRoot = (nodes: TreeNode[]): TreeNode[] => {
            let result: TreeNode[] = [];
            for (const node of nodes) {
                const isNoise = node.name === '<module>' || node.name === 'Root';
                if (isNoise) {
                    result = [...result, ...findUserRoot(node.children)];
                } else {
                    // Start preserving from here, but we still need to process children 
                    // in case they have noise wrapper (unlikely for user code but possible)
                    // Actually, once we hit user code, we usually keep structure.
                    // But let's be safe and just recursively map.
                    const cleanChildren = (n: TreeNode): TreeNode => {
                        // Simple pass-through for now, assuming user code structure is valid
                        return { ...n, children: n.children.map(cleanChildren) };
                    }
                    result.push(cleanChildren(node));
                }
            }
            return result;
        };

        const roots = findUserRoot(root.children);
        if (roots.length === 0) return null;
        if (roots.length === 1) return roots[0];

        // Virtual root for multiple top-level calls
        return {
            name: 'Global Scope',
            id: 'virtual-root',
            depth: 0,
            children: roots,
            status: 'completed'
        };
    }, [history]);

    // --- Pan & Zoom Handlers ---
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const s = Math.exp(-e.deltaY * 0.001);
            setTransform(t => ({
                ...t,
                scale: Math.min(Math.max(0.1, t.scale * s), 4)
            }));
        } else {
            setTransform(t => ({ ...t, x: t.x - e.deltaX, y: t.y - e.deltaY }));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) { // Left click
            isDragging.current = true;
            lastMouse.current = { x: e.clientX, y: e.clientY };
            containerRef.current!.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (containerRef.current) containerRef.current.style.cursor = 'default';
    };

    // Center on mount
    useEffect(() => {
        if (tree && containerRef.current) {
            const { clientWidth, clientHeight } = containerRef.current;
            // Rough center assumption
            setTransform({ x: clientWidth / 2 - 100, y: 50, scale: 1 });
        }
    }, [tree]);


    if (!tree) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-zinc-500 gap-4 bg-[#050505]">
                <div className="p-4 rounded-full bg-zinc-900 border border-white/5">
                    <Network size={32} className="opacity-50" />
                </div>
                <div className="text-center">
                    <p className="text-sm text-zinc-400">No recursion detected</p>
                    <p className="text-xs opacity-50">Global execution only.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[#050505] relative overflow-hidden flex">
            {/* Canvas */}
            <div
                ref={containerRef}
                className="flex-1 h-full relative cursor-grab active:cursor-grabbing bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    className="absolute top-0 left-0 origin-top-left transition-transform duration-75 ease-out"
                    style={{
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`
                    }}
                >
                    <TreeNodeView node={tree} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
                </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-4 flex gap-2">
                <div className="bg-zinc-900/90 border border-white/10 rounded-lg p-1 flex items-center gap-1 shadow-xl backdrop-blur">
                    <button onClick={() => setTransform(t => ({ ...t, scale: t.scale * 1.2 }))} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white">
                        <ZoomIn size={16} />
                    </button>
                    <span className="text-[10px] w-12 text-center font-mono text-zinc-500">{Math.round(transform.scale * 100)}%</span>
                    <button onClick={() => setTransform(t => ({ ...t, scale: t.scale / 1.2 }))} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white">
                        <ZoomOut size={16} />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button onClick={() => setTransform({ x: containerRef.current?.offsetWidth! / 2 - 100 || 0, y: 50, scale: 1 })} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white" title="Reset View">
                        <Maximize size={16} />
                    </button>
                </div>
            </div>

            {/* Side Panel (Context Aware) */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-[350px] border-l border-white/10 bg-zinc-950/95 backdrop-blur shadow-2xl z-20 absolute right-0 top-0 bottom-0 overflow-y-auto flex flex-col"
                    >
                        {/* Header */}
                        <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50">
                            <span className="font-mono font-bold text-zinc-400 text-xs uppercase tracking-wider">
                                Stack Frame Inspector
                            </span>
                            <button onClick={() => setSelectedNode(null)} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-6">
                            {/* Identity */}
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg border ${selectedNode.status === 'completed' ? 'bg-zinc-900 border-zinc-700' : 'bg-green-500/10 border-green-500/30'}`}>
                                    <GitGraph size={20} className={selectedNode.status === 'completed' ? 'text-zinc-500' : 'text-green-400'} />
                                </div>
                                <div>
                                    <div className="font-mono font-bold text-lg text-zinc-200">{selectedNode.name}()</div>
                                    <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                                        Frame Depth: {selectedNode.depth}
                                    </div>
                                </div>
                            </div>

                            {/* Locals */}
                            <div>
                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Local Variables</div>

                                {selectedNode.locals && Object.keys(selectedNode.locals).length > 0 ? (
                                    <div className="space-y-2">
                                        {Object.entries(selectedNode.locals).map(([key, val]: [string, any]) => (
                                            <div key={key} className="bg-zinc-900/50 rounded border border-white/5 p-2 flex items-center justify-between group hover:border-white/10 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-blue-400">{key}</span>
                                                    <span className="text-zinc-600 text-xs">=</span>
                                                </div>
                                                <div className="font-mono text-xs text-yellow-500/90 truncate max-w-[150px]">
                                                    {String(val.value)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center border border-dashed border-zinc-800 rounded text-zinc-600 text-xs">
                                        No variables in scope
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Recursive Node View with Orthogonal Connectors ---
const TreeNodeView = ({ node, onSelect, selectedId }: { node: TreeNode, onSelect: (n: TreeNode) => void, selectedId?: string }) => {
    const isSelected = selectedId === node.id;
    const isCompleted = node.status === 'completed';

    return (
        <div className="flex flex-col items-center">
            {/* Node Card */}
            <motion.div
                layoutId={node.id}
                onClick={(e) => { e.stopPropagation(); onSelect(node); }}
                className={`
                    relative z-10 px-6 py-3 rounded-lg border-2 shadow-sm cursor-pointer transition-all duration-200
                    flex flex-col items-center min-w-[160px] select-none
                    ${isSelected
                        ? 'bg-green-500/10 border-green-500 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                        : isCompleted
                            ? 'bg-[#121212] border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                            : 'bg-zinc-900 border-green-900/50 text-green-100 hover:border-green-500/50'
                    }
                `}
            >
                <span className={`text-sm font-mono font-bold tracking-tight ${isSelected ? 'text-green-400' : ''}`}>
                    {node.name}()
                </span>

                <div className="mt-1 flex items-center gap-1.5 opacity-50">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">FRAME {node.depth}</span>
                </div>
            </motion.div>

            {/* Children & Connectors */}
            {node.children.length > 0 && (
                <div className="flex flex-col items-center">
                    {/* Vertical Drop Line from Parent */}
                    <div className="h-6 w-0.5 bg-zinc-800" />

                    {/* Horizontal Bar wrapper */}
                    <div className="flex items-start">
                        {node.children.map((child, i, arr) => (
                            <div key={child.id} className="flex flex-col items-center relative px-4">
                                {/* Top Connector Logic */}
                                {/* We need a horizontal line that spans from the first child center to the last child center */}
                                {/* But implemented individually: */}

                                {/* Horizontal Bar segments */}
                                {/* If strictly orthogonal: 
                                    - If first child: Line from center to right
                                    - If middle child: Line full width
                                    - If last child: Line from left to center
                                    - If only one child: No horizontal line needed (just vertical drop)
                                */}

                                {arr.length > 1 && (
                                    <>
                                        {/* Left half line */}
                                        <div className={`absolute top-0 left-0 w-[50%] h-0.5 bg-zinc-800 ${i === 0 ? 'opacity-0' : ''}`} />
                                        {/* Right half line */}
                                        <div className={`absolute top-0 right-0 w-[50%] h-0.5 bg-zinc-800 ${i === arr.length - 1 ? 'opacity-0' : ''}`} />
                                    </>
                                )}

                                {/* Vertical Drop to Child */}
                                <div className="h-6 w-0.5 bg-zinc-800" />

                                <TreeNodeView node={child} onSelect={onSelect} selectedId={selectedId} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
