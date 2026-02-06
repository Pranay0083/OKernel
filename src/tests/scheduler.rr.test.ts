import { describe, it, expect } from 'vitest';
import { nextTick } from '../core/scheduler';
import { SimulationState, Process } from '../core/types';

const createProcess = (id: number, arrivalTime: number, burstTime: number): Process => ({
  id,
  name: `P${id}`,
  color: '#000',
  arrivalTime,
  burstTime,
  remainingTime: burstTime,
  startTime: null,
  completionTime: null,
  turnaroundTime: 0,
  waitingTime: 0,
  state: 'WAITING',
  priority: 0,
});

const initialState = (processes: Process[], timeQuantum: number = 2): SimulationState => ({
  processes,
  readyQueue: [],
  currentTime: 0,
  runningProcessId: null,
  completedProcessIds: [],
  ganttChart: [],
  algorithm: 'RR',
  timeQuantum,
  quantumRemaining: timeQuantum,
  isPlaying: true,
  speed: 1000,
});

describe('Round Robin Scheduler (Integration)', () => {

  it('should execute a single process without preemption', () => {
    // P1: Arrival 0, Burst 3. TQ = 2.
    // T0: P1 runs (rem=2, Q=1)
    // T1: P1 runs (rem=1, Q=0) -> Preempts self? No, queue empty?
    // Let's see behavior. If queue empty, it should keep running.
    
    const p1 = createProcess(1, 0, 3);
    let state = initialState([p1], 2);

    // Tick 1 (T0 -> T1)
    state = nextTick(state);
    expect(state.currentTime).toBe(1);
    expect(state.runningProcessId).toBe(1);
    expect(state.quantumRemaining).toBe(1);
    expect(state.processes[0].remainingTime).toBe(2);

    // Tick 2 (T1 -> T2)
    state = nextTick(state);
    expect(state.currentTime).toBe(2);
    expect(state.runningProcessId).toBe(1); 
    // Quantum hit 0 (Input 1 -> Decr 0 -> Check < 0 False -> Run -> Return 0)
    expect(state.quantumRemaining).toBe(0);
    expect(state.processes[0].remainingTime).toBe(1);

    // Tick 3 (T2 -> T3)
    // Input 0 -> Decr -1 -> Check < 0 True -> Preempt -> Re-select P1 -> Q=1 -> Run -> Return 1
    state = nextTick(state);
    expect(state.currentTime).toBe(3);
    // Should be completed now
    expect(state.completedProcessIds).toContain(1);
    expect(state.runningProcessId).toBe(null);
    expect(state.processes[0].state).toBe('COMPLETED');
  });

  it('should preempt and rotate processes correctly', () => {
    // P1: Arr 0, Burst 4
    // P2: Arr 1, Burst 2
    // TQ = 2
    const p1 = createProcess(1, 0, 4);
    const p2 = createProcess(2, 1, 2);
    let state = initialState([p1, p2], 2);

    // T0 -> T1: P1 runs. P2 arrives at T1 (end of tick 0 logic? No, arrival check is start of tick)
    // nextTick logic: 1. Check Arrival (T=0). P1 ready. P2 not ready (Arr=1 > T=0? No, Arr=1 > 0).
    // P2 arrives when T >= 1.
    state = nextTick(state); // T becomes 1. P1 runs. Rem=3. Q=1.
    expect(state.runningProcessId).toBe(1);
    expect(state.processes[0].remainingTime).toBe(3);
    expect(state.readyQueue).not.toContain(2); // P2 not ready yet at start of T0

    // T1 -> T2: P1 runs. P2 arrives.
    // Start of tick: T=1. P2 arrives. Queue: [P2].
    // Exec: P1 runs. Rem=2. Q=0.
    // Preemption Check: Input Q=1 -> 0. Check < 0? False. P1 continues.
    state = nextTick(state); // T becomes 2.
    expect(state.currentTime).toBe(2);
    expect(state.processes[1].state).toBe('READY'); // P2 is ready
    
    // P1 is still running (finishing its quantum)
    expect(state.runningProcessId).toBe(1);
    expect(state.quantumRemaining).toBe(0); 

    // T2 -> T3: Preemption happens now.
    // Input Q=0 -> -1. Check < 0? True. Switch to P2.
    state = nextTick(state); // T becomes 3.
    expect(state.runningProcessId).toBe(2);
    expect(state.readyQueue).toEqual([1]); // P1 in queue
    expect(state.processes[1].remainingTime).toBe(1);

    // T3 -> T4: P2 runs. Finishes (Burst 2).
    state = nextTick(state); // T becomes 4.
    expect(state.completedProcessIds).toContain(2);
    // P1 should be picked next?
    // Logic: P2 finishes. `activeProcessId` becomes null (or next?).
    // In scheduler: if completed, activeProcessId=null. 
    // Then Selection Logic (line 72) runs?
    // No, Selection Logic only runs `if (!activeProcessId)`.
    // If P2 was active at start of tick, it runs, then completes.
    // activeProcessId becomes null.
    // Does it select P1 immediately for the *next* tick?
    // The `nextTick` function doesn't seem to select immediately after completion in the same tick 
    // unless the structure allows it.
    // Let's check line 86 EXECUTION.
    // If completed (line 103), `activeProcessId = null`.
    // The function returns. Next tick (T4), `runningProcessId` is null.
    // So T4->T5 will start with selection.
    expect(state.runningProcessId).toBe(null); 
    
    // T4 -> T5: Select P1.
    state = nextTick(state); // T becomes 5.
    expect(state.runningProcessId).toBe(1);
    // Logic: Select P1 -> Q set to TQ-1 (1) -> Run -> Return 1
    expect(state.quantumRemaining).toBe(1);
  });

});
