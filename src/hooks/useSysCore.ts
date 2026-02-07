import { useState, useCallback } from 'react';
import { sysCoreApi } from '../api/syscore';
import { supabase } from '../lib/supabase';

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
    info?: any; // For GC
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
            // Assuming response is string (jobId) or object { output: jobId, status: "success" }
            // The current sysCoreApi.execute implementation likely returns the output string
            // I should check sysCoreApi implementation. Assuming it returns jobId based on my backend change.
            const jobId = response;

            setState(prev => ({ ...prev, jobId }));

            // 2. Fetch Trace from Supabase
            const { data, error } = await supabase
                .from('execution_traces')
                .select('trace_data')
                .eq('job_id', jobId)
                .single();

            if (error) {
                console.error("Supabase trace fetch error:", error);
                setState(prev => ({ ...prev, logs: [...prev.logs, `Error fetching trace: ${error.message}`], isExecuting: false }));
                return;
            }

            if (data && data.trace_data) {
                const events = data.trace_data as TraceEvent[];
                const logs: string[] = [];
                const history: TraceEvent[] = [];

                events.forEach((e, i) => {
                    if (e.type === 'Trace') {
                        // Calculate duration from previous event's process_time
                        if (i > 0) {
                            const prev = events[i - 1];
                            if (prev.process_time && e.process_time) {
                                // Assign duration to the PREVIOUS event (as it took that long to reach current event)
                                // We need to find the previous Trace event in our history array to update it
                                // But here we are iterating 'events' which includes Stdout/Stderr.
                                // Simplification: Just calculate delta from previous event in the raw list.
                                const duration = e.process_time - prev.process_time;
                                // We want to associate this duration with the code that WAS executing.
                                // If prev was Line 1, and now we are at Line 2, then Line 1 took duration.
                                // So we attach 'duration' to the previous TRACE event in our 'history' list.
                                if (history.length > 0) {
                                    history[history.length - 1].duration = duration;
                                }
                            }
                        }
                        history.push(e);
                    } else if (e.type === 'GC') {
                        // Push GC events to history for timeline visualization
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
                    // Set final metrics from last frame
                    metrics: history.length > 0 ? {
                        cpu: 0,
                        memory: history[history.length - 1].memory_curr || 0
                    } : { cpu: 0, memory: 0 }
                }));
            } else {
                setState(prev => ({ ...prev, logs: ["No trace data found."], isExecuting: false }));
            }

        } catch (e: any) {
            console.error("Execution failed:", e);
            setState(prev => ({ ...prev, logs: [...prev.logs, `Error: ${e.message || e}`], isExecuting: false }));
        }
    }, []);

    return {
        ...state,
        executeCode
    };
};
