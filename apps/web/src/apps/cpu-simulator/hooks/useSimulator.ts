import { useState, useEffect, useRef } from 'react';
import { SimulatorEngine, PREDEFINED_SCENARIOS } from '../../../syscore/cpu-simulator/engine';
import { SimState, CpuEvent } from '../../../syscore/cpu-simulator/types';

export function useSimulator() {
    const engineRef = useRef<SimulatorEngine | null>(null);
    const [state, setState] = useState<SimState | null>(null);
    const [logs, setLogs] = useState<CpuEvent[]>([]);

    useEffect(() => {
        engineRef.current = new SimulatorEngine();

        // Initial Setup
        const engine = engineRef.current;

        // Setup a few test mutexes
        engine.addMutex('M1', 'Database Lock');
        engine.addMutex('M2', 'File System Lock');

        const unsubscribe = engine.subscribe((newState: SimState, newEvents: CpuEvent[]) => {
            // Create a shallow copy to force React to re-render when properties deep inside Maps change
            // Alternatively, convert maps to arrays here for easier React rendering
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
    }, []);

    const loadScenario = (scenarioId: string) => {
        const scenario = PREDEFINED_SCENARIOS.find((s: any) => s.id === scenarioId);
        if (scenario && engineRef.current) {
            engineRef.current.loadScenario(scenario);
            setLogs([]); // clear logs on scenario switch
        }
    };

    return { engine: engineRef.current, state, logs, loadScenario };
}
