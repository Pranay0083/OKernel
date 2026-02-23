import React, { useMemo, useEffect, useRef } from 'react';
import { GanttBlock, Process } from '../../../core/types';
import { motion } from 'framer-motion';

interface Props {
  ganttChart: GanttBlock[];
  processes: Process[];
  numCores: number;
}

export const GanttChart: React.FC<Props> = ({ ganttChart, processes, numCores }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const coreBlocks = useMemo(() => {
    const cores: GanttBlock[][] = Array(numCores).fill([]);
    for (let i = 0; i < numCores; i++) {
      cores[i] = ganttChart.filter(b => b.coreId === i).sort((a, b) => a.startTime - b.startTime);
    }
    return cores;
  }, [ganttChart, numCores]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [ganttChart]);

  if (ganttChart.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-zinc-500 font-mono text-xs">
        WAITING FOR EXECUTION TO START...
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="h-full w-full overflow-x-auto overflow-y-auto custom-scrollbar bg-black/20 p-4">
      <div className="flex flex-col gap-6 min-w-max">
        {coreBlocks.map((blocks, coreIndex) => (
          <div key={coreIndex} className="flex gap-4 items-center">
            <div className="text-xs font-bold font-mono text-zinc-500 w-20 shrink-0 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></div>
              CORE {coreIndex}
            </div>
            <div className="flex bg-zinc-950/50 border border-zinc-800/50 rounded-lg p-2 items-center min-w-0 min-h-[60px] shadow-inner">
              {blocks.length === 0 ? (
                <span className="text-zinc-600 text-[10px] font-mono italic px-4">Idle</span>
              ) : (
                <div className="flex items-center">
                  <span className="text-[10px] text-zinc-600 font-mono text-right w-4 mr-2">
                    {blocks[0]?.startTime || 0}
                  </span>
                  {blocks.map((block, idx) => {
                    const isContextSwitch = block.processId === -1;
                    const process = (block.processId !== null && block.processId !== -1) ? processes.find(p => p.id === block.processId) : undefined;
                    const duration = block.endTime - block.startTime;
                    const width = Math.min(Math.max(40, duration * 4), 180);

                    return (
                      <div key={idx} className="flex items-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="h-10 rounded flex flex-col items-center justify-center border border-white/10 shrink-0 relative group shadow-sm transition-colors"
                          style={{
                            width: `${width}px`,
                            backgroundColor: isContextSwitch ? '#ef444420' : (process ? `${process.color}20` : '#3f3f4620'),
                            borderColor: isContextSwitch ? '#ef444450' : (process ? `${process.color}50` : '#52525b80')
                          }}
                        >
                          {isContextSwitch ? (
                            <span className="text-red-400 text-[10px] font-bold">CS</span>
                          ) : process ? (
                            <span className="font-bold text-xs" style={{ color: process.color }}>
                              {process.name}
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-[10px]">IDLE</span>
                          )}
                          <div className="absolute -top-8 bg-zinc-800 border border-zinc-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl font-mono">
                            {isContextSwitch ? 'Context Switch' : (process ? `${process.name}` : 'Idle')} [{block.startTime}ms - {block.endTime}ms]
                          </div>
                        </motion.div>
                        <div className="flex flex-col items-center justify-center z-10 mx-1">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {block.endTime}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
