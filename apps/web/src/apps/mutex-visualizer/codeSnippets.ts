import { MutexAlgorithm } from "../../syscore/mutex/types";

export interface CodeSnippet {
    lineLines: string[];
}

export const ALGORITHM_CODE: Record<MutexAlgorithm, string[]> = {
    PETERSON: [
        "// Thread i, Other Thread j",
        "flag[i] = true;",
        "turn = j;",
        "while (flag[j] && turn == j) {",
        "    // Spin",
        "}",
        "// --- CRITICAL SECTION ---",
        "flag[i] = false;"
    ],
    DEKKER: [
        "// Thread i, Other Thread j",
        "flag[i] = true;",
        "while (flag[j]) {",
        "    if (turn != i) {",
        "        flag[i] = false;",
        "        while (turn != i) { /* Spin */ }",
        "        flag[i] = true;",
        "    }",
        "}",
        "// --- CRITICAL SECTION ---",
        "turn = j;",
        "flag[i] = false;"
    ],
    BAKERY: [
        "// Thread i, Threads 0 to N-1",
        "choosing[i] = true;",
        "ticket[i] = max(ticket[0..N-1]) + 1;",
        "choosing[i] = false;",
        "for (j = 0; j < N; j++) {",
        "    while (choosing[j]) { /* Spin */ }",
        "    while (ticket[j] != 0 &&",
        "           (ticket[j] < ticket[i] || ",
        "           (ticket[j] == ticket[i] && j < i))) {",
        "        // Spin",
        "    }",
        "}",
        "// --- CRITICAL SECTION ---",
        "ticket[i] = 0;"
    ],
    TAS: [
        "// Atomic TestAndSet(lock)",
        "while (TestAndSet(&lock) == true) {",
        "    // Spin",
        "}",
        "// --- CRITICAL SECTION ---",
        "lock = false;"
    ],
    CAS: [
        "// Atomic CompareAndSwap(lock, expected, new)",
        "while (CompareAndSwap(&lock, false, true) == false) {",
        "    // Spin",
        "}",
        "// --- CRITICAL SECTION ---",
        "lock = false;"
    ],
    SEMAPHORE: [
        "// Wait(S)",
        "wait(S) {",
        "    while (S <= 0) { /* Block */ }",
        "    S--;",
        "}",
        "// --- CRITICAL SECTION ---",
        "// Signal(S)",
        "signal(S) {",
        "    S++;",
        "}"
    ]
};
