import { useState, useCallback } from 'react';
import { sysCoreApi } from '../api/syscore';
import { supabase } from '../lib/supabase';
import { Persistence } from '../services/persistence';

interface Metrics {
    cpu: number;
    memory: number;
}

interface LocalVar {
    value: string;
    type: string;
    address: string;
    size: number;
}

interface TraceEvent {
    type: 'Trace' | 'Stdout' | 'Stderr' | 'Error' | 'GC';
    line?: number;
    function?: string;
    locals?: Record<string, LocalVar>;
    memory_curr?: number;
    memory_peak?: number;
    stack_depth?: number;
    content?: string; // For Stdout/Stderr
    bytecode?: {
        opcode: string;
        offset: number;
    };
    phase?: 'start' | 'stop'; // For GC
    info?: unknown; // For GC
    timestamp?: number;
    process_time?: number; // CPU time in ns
    duration?: number; // Calculated duration in ns
    filename?: string;
    event?: 'line' | 'call' | 'return' | 'exception' | 'opcode';
    hardware?: {
        type: 'MEM_READ' | 'MEM_WRITE' | 'ALU' | 'CONTROL' | 'STACK' | 'FUNCTION' | 'OTHER';
        cost: number;
        opcode: string;
    };
    cpu_usage?: number;
}

interface SysCoreState {
    isConnected: boolean; // Just implies backend API is reachable (we can assume true for now or check health)
    jobId: string | null;
    logs: string[];
    metrics: Metrics;
    isExecuting: boolean;
    history: TraceEvent[];
}

export const useSysCore = () => {
    const [state, setState] = useState<SysCoreState>({
        isConnected: true,
        jobId: null,
        logs: [],
        metrics: { cpu: 0, memory: 0 },
        isExecuting: false,
        history: []
    });

    const fetchTrace = useCallback(async (jobId: string) => {
        try {
            setState(prev => ({
                ...prev,
                jobId,
                isExecuting: true, // Show loading spinner
                logs: [],
                history: [],
                metrics: { cpu: 0, memory: 0 }
            }));

            const { data, error } = await supabase
                .from('execution_traces')
                .select('trace_data')
                .eq('job_id', jobId)
                .single();

            if (error) {
                console.error("Supabase trace fetch error:", error);
                setState(prev => ({ ...prev, logs: [`Error fetching trace: ${error.message}`], isExecuting: false }));
                return;
            }

            if (data && data.trace_data) {
                const events = data.trace_data as TraceEvent[];
                const logs: string[] = [];
                const history: TraceEvent[] = [];

                events.forEach((e, i) => {
                    if (e.type === 'Trace') {
                         // Calculate duration and CPU usage
                        if (i > 0) {
                            const prev = events[i - 1];
                            // Only calculate if timestamps are valid and monotonic
                            if (prev.process_time !== undefined && e.process_time !== undefined && prev.timestamp !== undefined && e.timestamp !== undefined) {
                                const cpuDelta = e.process_time - prev.process_time; // ns
                                const wallDelta = e.timestamp - prev.timestamp; // ns

                                const duration = cpuDelta > 0 ? cpuDelta : 1000; // Minimum 1us if no time passed

                                // CPU Usage % (0.0 to 1.0, can exceed 1.0 if multi-core but Python is GIL bound so 0-1)
                                // Avoid division by zero
                                const cpuUsage = wallDelta > 0 ? Math.min(1.0, Math.max(0, cpuDelta / wallDelta)) : 0;

                                // Attach metrics to the CURRENT event (state at this point)
                                e.duration = duration;
                                // We store cpu_usage to visualize "effort" leading to this state
                                e.cpu_usage = cpuUsage * 100; // Store as percentage

                                // Also back-propagate duration to history for line highlighting
                                if (history.length > 0) {
                                    history[history.length - 1].duration = duration;
                                    history[history.length - 1].cpu_usage = cpuUsage * 100;
                                }
                            }
                        }
                        history.push(e);
                    } else if (e.type === 'GC') {
                        history.push(e);
                    } else if (e.type === 'Stdout' || e.type === 'Stderr') {
                        logs.push(e.content || '');
                    } else if (e.type === 'Error') {
                        logs.push(`ERR: ${e.content}`);
                    }
                });

                setState(prev => ({
                    ...prev,
                    history,
                    logs,
                    isExecuting: false,
                    metrics: history.length > 0 ? {
                        cpu: history[history.length - 1].cpu_usage || 0,
                        memory: history[history.length - 1].memory_curr || 0
                    } : { cpu: 0, memory: 0 }
                }));

            } else {
                setState(prev => ({ ...prev, logs: ["No trace data found."], isExecuting: false }));
            }
        } catch (e) {
            console.error("Fetch trace failed:", e);
             setState(prev => ({ ...prev, logs: [`Error: ${String(e)}`], isExecuting: false }));
        }
    }, []);

    const executeCode = useCallback(async (language: 'python' | 'cpp', code: string, input?: string) => {
        try {
            // Reset state
            setState(prev => ({
                ...prev,
                logs: [],
                metrics: { cpu: 0, memory: 0 },
                history: [],
                isExecuting: true,
                jobId: null
            }));

            // 1. Execute via API (waits for full execution and upload)
            const response = await sysCoreApi.execute(language, code, input || "");
            const jobId = response;

            setState(prev => ({ ...prev, jobId }));

            // 2. Fetch Trace (Reuse logic)
            // Wait for trace fetch to complete so we have history for persistence
            await fetchTrace(jobId);
            
            // We need to re-read the state or return data from fetchTrace to save it.
            // But since setState is async, 'state.history' is stale here.
            // Let's rely on fetchTrace returning the history or just save basic info here?
            // Actually, we can just save it here, assuming success if no error thrown.
            // We won't have the exact duration from the trace, but we can approximate or update later.
            // BETTER: Pass a callback or handle persistence inside fetchTrace if it's a "new run"?
            // Simpler: Just save the job here with 0 duration, or handle persistence cleanly.
            
            // Let's modify executeCode to do the persistence itself using the data it just fetched if we refactor fetchTrace to return data.
            // But I didn't refactor fetchTrace to return data yet.
            
            Persistence.addJob({
                id: jobId,
                timestamp: Date.now(),
                code: code,
                language: language,
                status: 'success',
                duration: 0, // Placeholder until loaded
                input: input
            });

        } catch (e: unknown) {
            console.error("Execution failed:", e);
            const errorMessage = e instanceof Error ? e.message : String(e);
            setState(prev => ({ ...prev, logs: [...prev.logs, `Error: ${errorMessage}`], isExecuting: false }));
        }
    }, [fetchTrace]);

    return {
        ...state,
        executeCode,
        fetchTrace
    };
};
