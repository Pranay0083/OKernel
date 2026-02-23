import { MutexSimState, MutexThread } from './types';

// ── Helpers ─────────────────────────────────────────────────────────

const addEvent = (state: MutexSimState, threadId: number, action: string, detail: string): void => {
    const thread = state.threads.find(t => t.id === threadId);
    if (!thread) return;
    state.events.push({
        step: state.currentStep,
        threadId,
        threadName: thread.name,
        action,
        detail,
        color: thread.color,
    });
    // Keep last 100 events
    if (state.events.length > 100) {
        state.events = state.events.slice(-100);
    }
};

const cloneThread = (t: MutexThread): MutexThread => ({ ...t });

// ── Peterson's Algorithm (2 threads) ────────────────────────────────

const tickPeterson = (state: MutexSimState, targetThreadId?: number): void => {
    for (let i = 0; i < state.threads.length && i < 2; i++) {
        const t = state.threads[i];
        if (targetThreadId !== undefined && t.id !== targetThreadId) continue;
        const other = 1 - i;

        switch (t.state) {
            case 'IDLE': {
                if (Math.random() < 0.3 || targetThreadId !== undefined) {
                    state.threads[i] = { ...t, state: 'WANTING', waitTicks: 0, currentLine: 1 };
                    addEvent(state, t.id, 'WANT_CS', `Thread wants to enter critical section`);
                } else {
                    state.threads[i] = { ...t, currentLine: undefined };
                }
                break;
            }
            case 'WANTING': {
                state.shared.flags[i] = true;
                state.shared.turn = other;
                state.threads[i] = { ...t, state: 'ENTERING', currentLine: 3 };
                addEvent(state, t.id, 'SET_FLAG', `flag[${i}]=true, turn=${other}`);
                break;
            }
            case 'ENTERING': {
                if (state.shared.flags[other] && state.shared.turn === other) {
                    state.threads[i] = { ...t, waitTicks: t.waitTicks + 1, currentLine: 4 };
                    addEvent(state, t.id, 'SPIN', `Waiting... flag[${other}]=${state.shared.flags[other]}, turn=${state.shared.turn}`);
                } else {
                    state.threads[i] = {
                        ...t, state: 'IN_CS',
                        csRemaining: t.csExecutionTime,
                        csCount: t.csCount + 1,
                        totalWaitTicks: t.totalWaitTicks + t.waitTicks,
                        currentLine: 6
                    };
                    state.activeThreadIds.push(t.id);
                    addEvent(state, t.id, 'ENTER_CS', `Entered critical section (waited ${t.waitTicks} ticks)`);
                }
                break;
            }
            case 'IN_CS': {
                if (t.csRemaining <= 1) {
                    state.threads[i] = { ...t, state: 'EXITING', csRemaining: 0, currentLine: 7 };
                } else {
                    state.threads[i] = { ...t, csRemaining: t.csRemaining - 1, currentLine: 6 };
                }
                break;
            }
            case 'EXITING': {
                state.shared.flags[i] = false;
                state.threads[i] = { ...t, state: 'IDLE', currentLine: undefined };
                state.activeThreadIds = state.activeThreadIds.filter(id => id !== t.id);
                addEvent(state, t.id, 'EXIT_CS', `flag[${i}]=false — Released`);
                break;
            }
        }
    }
};

// ── Dekker's Algorithm (2 threads) ──────────────────────────────────

const tickDekker = (state: MutexSimState, targetThreadId?: number): void => {
    for (let i = 0; i < state.threads.length && i < 2; i++) {
        const t = state.threads[i];
        if (targetThreadId !== undefined && t.id !== targetThreadId) continue;
        const other = 1 - i;

        switch (t.state) {
            case 'IDLE': {
                if (Math.random() < 0.3 || targetThreadId !== undefined) {
                    state.threads[i] = { ...t, state: 'WANTING', waitTicks: 0, currentLine: 1 };
                    addEvent(state, t.id, 'WANT_CS', `Thread wants to enter critical section`);
                } else {
                    state.threads[i] = { ...t, currentLine: undefined };
                }
                break;
            }
            case 'WANTING': {
                state.shared.flags[i] = true;
                state.threads[i] = { ...t, state: 'ENTERING', currentLine: 2 };
                addEvent(state, t.id, 'SET_FLAG', `flag[${i}]=true`);
                break;
            }
            case 'ENTERING': {
                if (state.shared.flags[other]) {
                    if (state.shared.turn !== i) {
                        state.shared.flags[i] = false;
                        state.threads[i] = { ...t, waitTicks: t.waitTicks + 1, currentLine: 5 };
                        if (state.shared.turn === i) {
                            state.shared.flags[i] = true;
                        }
                        addEvent(state, t.id, 'BACKOFF', `Not my turn, backing off (turn=${state.shared.turn})`);
                    } else {
                        state.threads[i] = { ...t, waitTicks: t.waitTicks + 1, currentLine: 2 };
                        addEvent(state, t.id, 'SPIN', `flag[${other}]=true but my turn, waiting...`);
                    }
                } else {
                    state.threads[i] = {
                        ...t, state: 'IN_CS',
                        csRemaining: t.csExecutionTime,
                        csCount: t.csCount + 1,
                        totalWaitTicks: t.totalWaitTicks + t.waitTicks,
                        currentLine: 9
                    };
                    state.activeThreadIds.push(t.id);
                    addEvent(state, t.id, 'ENTER_CS', `Entered critical section`);
                }
                break;
            }
            case 'IN_CS': {
                if (t.csRemaining <= 1) {
                    state.threads[i] = { ...t, state: 'EXITING', csRemaining: 0, currentLine: 10 };
                } else {
                    state.threads[i] = { ...t, csRemaining: t.csRemaining - 1, currentLine: 9 };
                }
                break;
            }
            case 'EXITING': {
                state.shared.turn = other;
                state.shared.flags[i] = false;
                state.threads[i] = { ...t, state: 'IDLE', currentLine: undefined };
                state.activeThreadIds = state.activeThreadIds.filter(id => id !== t.id);
                addEvent(state, t.id, 'EXIT_CS', `turn=${other}, flag[${i}]=false — Released`);
                break;
            }
        }
    }
};

// ── Bakery Algorithm (N threads) ────────────────────────────────────

const tickBakery = (state: MutexSimState, targetThreadId?: number): void => {
    for (let i = 0; i < state.threads.length; i++) {
        const t = state.threads[i];
        if (targetThreadId !== undefined && t.id !== targetThreadId) continue;

        switch (t.state) {
            case 'IDLE': {
                if (Math.random() < 0.25 || targetThreadId !== undefined) {
                    state.threads[i] = { ...t, state: 'WANTING', waitTicks: 0, currentLine: 1 };
                    addEvent(state, t.id, 'WANT_CS', `Thread wants to enter critical section`);
                } else {
                    state.threads[i] = { ...t, currentLine: undefined };
                }
                break;
            }
            case 'WANTING': {
                state.shared.choosing[i] = true;
                const maxTicket = Math.max(0, ...state.shared.tickets);
                state.shared.tickets[i] = maxTicket + 1;
                state.shared.choosing[i] = false;
                state.threads[i] = { ...t, state: 'ENTERING', currentLine: 6 };
                addEvent(state, t.id, 'TAKE_TICKET', `ticket[${i}]=${maxTicket + 1}`);
                break;
            }
            case 'ENTERING': {
                let canEnter = true;
                for (let j = 0; j < state.threads.length; j++) {
                    if (j === i) continue;
                    if (state.shared.choosing[j]) {
                        canEnter = false;
                        break;
                    }
                    const myTicket = state.shared.tickets[i];
                    const theirTicket = state.shared.tickets[j];
                    if (theirTicket !== 0 && (theirTicket < myTicket || (theirTicket === myTicket && j < i))) {
                        canEnter = false;
                        break;
                    }
                }

                if (canEnter) {
                    state.threads[i] = {
                        ...t, state: 'IN_CS',
                        csRemaining: t.csExecutionTime,
                        csCount: t.csCount + 1,
                        totalWaitTicks: t.totalWaitTicks + t.waitTicks,
                        currentLine: 12
                    };
                    state.activeThreadIds.push(t.id);
                    addEvent(state, t.id, 'ENTER_CS', `Ticket #${state.shared.tickets[i]} — Entered CS`);
                } else {
                    state.threads[i] = { ...t, waitTicks: t.waitTicks + 1, currentLine: 9 };
                    addEvent(state, t.id, 'SPIN', `Waiting for lower ticket holders`);
                }
                break;
            }
            case 'IN_CS': {
                if (t.csRemaining <= 1) {
                    state.threads[i] = { ...t, state: 'EXITING', csRemaining: 0, currentLine: 13 };
                } else {
                    state.threads[i] = { ...t, csRemaining: t.csRemaining - 1, currentLine: 12 };
                }
                break;
            }
            case 'EXITING': {
                state.shared.tickets[i] = 0;
                state.threads[i] = { ...t, state: 'IDLE', currentLine: undefined };
                state.activeThreadIds = state.activeThreadIds.filter(id => id !== t.id);
                addEvent(state, t.id, 'EXIT_CS', `ticket[${i}]=0 — Released`);
                break;
            }
        }
    }
};

// ── Test-And-Set (TAS) ──────────────────────────────────────────────

const tickTAS = (state: MutexSimState, targetThreadId?: number): void => {
    for (let i = 0; i < state.threads.length; i++) {
        const t = state.threads[i];
        if (targetThreadId !== undefined && t.id !== targetThreadId) continue;

        switch (t.state) {
            case 'IDLE': {
                if (Math.random() < 0.3 || targetThreadId !== undefined) {
                    state.threads[i] = { ...t, state: 'WANTING', waitTicks: 0, currentLine: 1 };
                    addEvent(state, t.id, 'WANT_CS', `Thread wants to enter critical section`);
                } else {
                    state.threads[i] = { ...t, currentLine: undefined };
                }
                break;
            }
            case 'WANTING':
            case 'ENTERING': {
                const oldLock = state.shared.lock;
                state.shared.lock = true;
                if (!oldLock) {
                    state.threads[i] = {
                        ...t, state: 'IN_CS',
                        csRemaining: t.csExecutionTime,
                        csCount: t.csCount + 1,
                        totalWaitTicks: t.totalWaitTicks + t.waitTicks,
                        currentLine: 4
                    };
                    state.activeThreadIds.push(t.id);
                    addEvent(state, t.id, 'TAS_SUCCESS', `testAndSet() returned false → Entered CS`);
                } else {
                    state.threads[i] = { ...t, state: 'ENTERING', waitTicks: t.waitTicks + 1, currentLine: 2 };
                    addEvent(state, t.id, 'TAS_FAIL', `testAndSet() returned true → Spinning`);
                }
                break;
            }
            case 'IN_CS': {
                if (t.csRemaining <= 1) {
                    state.threads[i] = { ...t, state: 'EXITING', csRemaining: 0, currentLine: 5 };
                } else {
                    state.threads[i] = { ...t, csRemaining: t.csRemaining - 1, currentLine: 4 };
                }
                break;
            }
            case 'EXITING': {
                state.shared.lock = false;
                state.threads[i] = { ...t, state: 'IDLE', currentLine: undefined };
                state.activeThreadIds = state.activeThreadIds.filter(id => id !== t.id);
                addEvent(state, t.id, 'RELEASE', `lock=false — Released`);
                break;
            }
        }
    }
};

// ── Compare-And-Swap (CAS) ──────────────────────────────────────────

const tickCAS = (state: MutexSimState, targetThreadId?: number): void => {
    for (let i = 0; i < state.threads.length; i++) {
        const t = state.threads[i];
        if (targetThreadId !== undefined && t.id !== targetThreadId) continue;

        switch (t.state) {
            case 'IDLE': {
                if (Math.random() < 0.3 || targetThreadId !== undefined) {
                    state.threads[i] = { ...t, state: 'WANTING', waitTicks: 0, currentLine: 1 };
                    addEvent(state, t.id, 'WANT_CS', `Thread wants to enter critical section`);
                } else {
                    state.threads[i] = { ...t, currentLine: undefined };
                }
                break;
            }
            case 'WANTING':
            case 'ENTERING': {
                if (!state.shared.lock) {
                    state.shared.lock = true;
                    state.threads[i] = {
                        ...t, state: 'IN_CS',
                        csRemaining: t.csExecutionTime,
                        csCount: t.csCount + 1,
                        totalWaitTicks: t.totalWaitTicks + t.waitTicks,
                        currentLine: 4
                    };
                    state.activeThreadIds.push(t.id);
                    addEvent(state, t.id, 'CAS_SUCCESS', `CAS(lock, false, true) → Success`);
                } else {
                    state.threads[i] = { ...t, state: 'ENTERING', waitTicks: t.waitTicks + 1, currentLine: 2 };
                    addEvent(state, t.id, 'CAS_FAIL', `CAS(lock, false, true) → Failed, lock=true`);
                }
                break;
            }
            case 'IN_CS': {
                if (t.csRemaining <= 1) {
                    state.threads[i] = { ...t, state: 'EXITING', csRemaining: 0, currentLine: 5 };
                } else {
                    state.threads[i] = { ...t, csRemaining: t.csRemaining - 1, currentLine: 4 };
                }
                break;
            }
            case 'EXITING': {
                state.shared.lock = false;
                state.threads[i] = { ...t, state: 'IDLE', currentLine: undefined };
                state.activeThreadIds = state.activeThreadIds.filter(id => id !== t.id);
                addEvent(state, t.id, 'RELEASE', `lock=false — Released`);
                break;
            }
        }
    }
};

// ── Semaphore ───────────────────────────────────────────────────────

const tickSemaphore = (state: MutexSimState, targetThreadId?: number): void => {
    for (let i = 0; i < state.threads.length; i++) {
        const t = state.threads[i];
        if (targetThreadId !== undefined && t.id !== targetThreadId) continue;

        switch (t.state) {
            case 'IDLE': {
                if (Math.random() < 0.3 || targetThreadId !== undefined) {
                    state.threads[i] = { ...t, state: 'WANTING', waitTicks: 0, currentLine: 1 };
                    addEvent(state, t.id, 'WANT_CS', `Thread calls wait(S)`);
                } else {
                    state.threads[i] = { ...t, currentLine: undefined };
                }
                break;
            }
            case 'WANTING':
            case 'ENTERING': {
                if (state.shared.semaphore > 0) {
                    state.shared.semaphore--;
                    state.threads[i] = {
                        ...t, state: 'IN_CS',
                        csRemaining: t.csExecutionTime,
                        csCount: t.csCount + 1,
                        totalWaitTicks: t.totalWaitTicks + t.waitTicks,
                        currentLine: 5
                    };
                    state.activeThreadIds.push(t.id);
                    addEvent(state, t.id, 'WAIT_OK', `wait(S): S=${state.shared.semaphore} → Entered CS`);
                } else {
                    state.threads[i] = { ...t, state: 'ENTERING', waitTicks: t.waitTicks + 1, currentLine: 2 };
                    addEvent(state, t.id, 'WAIT_BLOCK', `wait(S): S=0 → Blocked`);
                }
                break;
            }
            case 'IN_CS': {
                if (t.csRemaining <= 1) {
                    state.threads[i] = { ...t, state: 'EXITING', csRemaining: 0, currentLine: 7 };
                } else {
                    state.threads[i] = { ...t, csRemaining: t.csRemaining - 1, currentLine: 5 };
                }
                break;
            }
            case 'EXITING': {
                state.shared.semaphore++;
                state.threads[i] = { ...t, state: 'IDLE', currentLine: undefined };
                state.activeThreadIds = state.activeThreadIds.filter(id => id !== t.id);
                addEvent(state, t.id, 'SIGNAL', `signal(S): S=${state.shared.semaphore} — Released`);
                break;
            }
        }
    }
};

// ── Main Tick Dispatchers ───────────────────────────────────────────

const runTickCycle = (state: MutexSimState, targetThreadId?: number): MutexSimState => {
    const newState: MutexSimState = {
        ...state,
        threads: state.threads.map(cloneThread),
        shared: {
            ...state.shared,
            flags: [...state.shared.flags],
            tickets: [...state.shared.tickets],
            choosing: [...state.shared.choosing],
        },
        events: [...state.events],
        activeThreadIds: [...state.activeThreadIds],
    };

    switch (newState.algorithm) {
        case 'PETERSON': tickPeterson(newState, targetThreadId); break;
        case 'DEKKER': tickDekker(newState, targetThreadId); break;
        case 'BAKERY': tickBakery(newState, targetThreadId); break;
        case 'TAS': tickTAS(newState, targetThreadId); break;
        case 'CAS': tickCAS(newState, targetThreadId); break;
        case 'SEMAPHORE': tickSemaphore(newState, targetThreadId); break;
    }

    if (targetThreadId === undefined) {
        newState.currentStep++;
    }
    return newState;
};

export const mutexTick = (state: MutexSimState): MutexSimState => {
    return runTickCycle(state, undefined);
};

export const mutexTickThread = (state: MutexSimState, targetThreadId: number): MutexSimState => {
    return runTickCycle(state, targetThreadId);
};
