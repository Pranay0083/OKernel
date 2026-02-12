import React, { useEffect, useRef, useState } from 'react';

interface RamMatrixProps {
    memory: Uint8Array;
}

export const RamMatrix: React.FC<RamMatrixProps> = ({ memory }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoverInfo, setHoverInfo] = useState<{ addr: number, bytes: number[] } | null>(null);
    const [stats, setStats] = useState({ heap: 0, stack: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const render = () => {
            // Stats Calculation (Simple sampling)
            // We could optimized this, but for <1ms perf impact let's just do it in the loop or less freq.
            // Let's rely on the visual loop to just draw.

            const imgData = ctx.createImageData(256, 256);
            const data = imgData.data;

            let heapCount = 0;
            let stackCount = 0;

            for (let i = 0; i < 65536; i++) {
                const memIndex = i * 16;
                let active = false;
                // let maxVal = 0;

                // Check 16-byte block
                for (let j = 0; j < 16; j++) {
                    if (memory[memIndex + j] !== 0) {
                        active = true;
                        break;
                    }
                }

                const px = i * 4;
                if (active) {
                    if (memIndex < 0x5000) { // Data
                        data[px] = 0; data[px + 1] = 255; data[px + 2] = 0; // Green
                        heapCount++; // Count as generic data usage
                    } else if (memIndex > 0xF0000) { // Stack
                        data[px] = 255; data[px + 1] = 50; data[px + 2] = 50; // Red
                        stackCount++;
                    } else { // Heap
                        data[px] = 255; data[px + 1] = 200; data[px + 2] = 0; // Yellow
                        heapCount++;
                    }
                    data[px + 3] = 255;
                } else {
                    // Empty - Dim "Matrix" Code effect?
                    data[px] = 10; data[px + 1] = 20; data[px + 2] = 10;
                    data[px + 3] = 255;
                }
            }

            ctx.putImageData(imgData, 0, 0);

            // Draw Hover Highlight
            if (hoverInfo) {
                // Calculate pixel index
                const blockIndex = Math.floor(hoverInfo.addr / 16);
                const x = blockIndex % 256;
                const y = Math.floor(blockIndex / 256);

                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.strokeRect(x - 1, y - 1, 3, 3); // Crosshair
            }

            setStats({ heap: heapCount * 16, stack: stackCount * 16 });

            animationId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationId);
    }, [memory, hoverInfo]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        // 256x256 grid.
        // Index = y * 256 + x
        const blockIndex = y * 256 + x;
        const addr = blockIndex * 16;

        if (blockIndex >= 0 && blockIndex < 65536) {
            const bytes: number[] = [];
            for (let i = 0; i < 16; i++) {
                bytes.push(memory[addr + i]);
            }
            setHoverInfo({ addr, bytes });
        }
    };

    const handleMouseLeave = () => setHoverInfo(null);

    return (
        <div className="flex flex-col h-full bg-black border-l border-zinc-900 w-[320px]">
            {/* Header / Stats */}
            <div className="p-3 bg-zinc-950 border-b border-zinc-900">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-400">SYS_RAM_1024KB</span>
                    <span className="text-[10px] text-green-500 font-mono animate-pulse">LIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">
                        <div className="text-zinc-500">USED (HEAP)</div>
                        <div className="text-yellow-400">{(stats.heap / 1024).toFixed(1)} KB</div>
                    </div>
                    <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">
                        <div className="text-zinc-500">STACK DEPTH</div>
                        <div className="text-red-400">{(stats.stack / 1024).toFixed(1)} KB</div>
                    </div>
                </div>
            </div>

            {/* Matrix Viewer */}
            <div className="relative flex-1 p-4 flex items-center justify-center bg-black overflow-hidden group">
                {/* CRT Screen Effect Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>

                <canvas
                    ref={canvasRef}
                    width={256}
                    height={256}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="w-full max-w-[256px] pixelated border border-zinc-800 shadow-[0_0_20px_rgba(0,255,0,0.05)] cursor-crosshair z-0"
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>

            {/* Hex Inspector Panel */}
            <div className="h-48 bg-zinc-950 border-t border-zinc-900 p-3 font-mono text-xs overflow-hidden">
                <div className="text-zinc-500 mb-1 border-b border-zinc-900 pb-1 flex justify-between">
                    <span>INSPECTOR</span>
                    {hoverInfo && <span className="text-blue-400">0x{hoverInfo.addr.toString(16).padStart(6, '0').toUpperCase()}</span>}
                </div>

                {hoverInfo ? (
                    <div className="grid grid-cols-[1fr_auto] gap-4 mt-2">
                        {/* Hex View */}
                        <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-zinc-300">
                            {hoverInfo.bytes.map((b, i) => (
                                <span key={i} className={b !== 0 ? "text-green-400" : "text-zinc-700"}>
                                    {b.toString(16).padStart(2, '0').toUpperCase()}
                                </span>
                            ))}
                        </div>
                        {/* ASCII Preview */}
                        <div className="w-16 text-right break-all text-zinc-500 tracking-widest text-[10px]">
                            {hoverInfo.bytes.map((b) => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('')}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-700 italic">
                        Hover RAM to inspect
                    </div>
                )}
            </div>
        </div>
    );
};
