import { useState, useEffect, useMemo } from 'react';
import { SimulatorEngine, PREDEFINED_SCENARIOS } from '../../../syscore/cpu-simulator/engine';
import { SimState, CpuEvent, Scenario } from '../../../syscore/cpu-simulator/types';

export function useSimulator() {
    const engine = useMemo(() => {
        const e = new SimulatorEngine();
        e.addMutex('M1', 'Database Lock');
        e.addMutex('M2', 'File System Lock');
        return e;
    }, []);

    const [state, setState] = useState<SimState | null>(null);
    const [logs, setLogs] = useState<CpuEvent[]>([]);

    useEffect(() => {
        if (!engine) return;

        const unsubscribe = engine.subscribe((newState: SimState, newEvents: CpuEvent[]) => {
            const parsedState: SimState = {
                ...newState,
                processes: new Map(newState.processes),
                mutexes: new Map(newState.mutexes),
                readyQueue: [...newState.readyQueue],
                blockedQueue: [...newState.blockedQueue]
            };

            setState(parsedState);

            if (newEvents.length > 0) {
                setLogs(prev => [...prev, ...newEvents].slice(-50)); // Keep last 50 logs
            }
        });

        return () => unsubscribe();
    }, [engine]);

    const loadScenario = (scenarioId: string) => {
        const scenario = PREDEFINED_SCENARIOS.find((s: Scenario) => s.id === scenarioId);
        if (scenario && engine) {
            engine.loadScenario(scenario);
            setLogs([]); // clear logs on scenario switch
        }
    };

    return { engine, state, logs, loadScenario };
}
