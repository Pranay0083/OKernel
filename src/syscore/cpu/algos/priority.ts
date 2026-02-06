import { Process } from '../../../core/types';

export const priority = {
    name: "Priority Scheduling",
    code: "PRIORITY",
    info: {
        description: "Priority scheduling assigns a priority rank to each process. The CPU is allocated to the process with the highest priority (customarily lower number = higher priority).",
        mathematics: "Can lead to Starvation if low priority processes never get CPU time.",
        implementation: "1. Sort Ready Queue by Priority.\n2. Execute process with best priority.\n3. Preemptive or Non-Preemptive variants exist.",
        code: `
function selectProcess(queue, processes) {
  return queue.sort((a,b) => 
    processes[a].priority - processes[b].priority
  )[0];
}
        `
    },
    schedule: (queue: number[], processes: Process[]): number | null => {
        if (queue.length === 0) return null;

        const candidates = queue
            .map(id => processes.find(p => p.id === id))
            .filter((p): p is Process => p !== undefined);

        if (candidates.length === 0) return null;

        // Sort by Priority (Lower = Higher)
        candidates.sort((a, b) => {
            // Default priority to 0 if undefined
            const pA = a.priority ?? 0;
            const pB = b.priority ?? 0;

            if (pA !== pB) return pA - pB;
            return a.arrivalTime - b.arrivalTime;
        });

        return candidates[0].id;
    },
    shouldPreempt: (currentProcess: Process, queue: number[], processes: Process[], _quantum: number): boolean => {
        // Preemptive Priority: If a new process has higher priority (lower value) than current
        const candidates = queue
            .map(id => processes.find(p => p.id === id))
            .filter((p): p is Process => p !== undefined);

        const currentP = currentProcess.priority ?? 0;

        return candidates.some(c => (c.priority ?? 0) < currentP);
    }
};
