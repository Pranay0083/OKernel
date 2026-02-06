# Software Requirements Specification (SRS)

> **Project:** OKernel OS Simulator
> **Version:** 1.0.1
> **Scope:** Full-Stack Web Application

---

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive description of the **OKernel** system. It details the functional and non-functional requirements, system constraints, and the mathematical models underpinning the simulation engine. This SRS is intended for developers, system architects, and testers.

### 1.2 Product Scope
OKernel is a "Browser-based Operating System Simulation Environment". It is NOT a real OS, but it simulates the *internals* of one. It allows Computer Science students to visualize:
-   CPU Scheduling behavior under load.
-   Memory allocation strategies (First-fit, Best-fit, Stack growth).
-   Process synchronization issues (Deadlocks - planned).

---

## 2. Mathematical Models (The Specifics)

### 2.1 Scheduling Algorithms

The system MUST implement the following algorithms with the specified time complexities.

#### 2.1.1 First Come First Serve (FCFS)
-   **Logic**: Processes are executed in the exact order of `Arrival Time (AT)`.
-   **Data Structure**: FIFO Queue.
-   **Complexity**: $O(1)$ for selection.
-   **Preemptive**: No.

#### 2.1.2 Shortest Job First (SJF)
-   **Logic**: Process with the minimum `Burst Time (BT)` is selected.
-   **Tie-Breaker**: If $BT_1 = BT_2$, use FCFS ($AT_1 < AT_2$).
-   **Data Structure**: Min-Heap or Sorted Array.
-   **Complexity**: $O(N \log N)$ for sorting.
-   **Preemptive**: No.

#### 2.1.3 Shortest Remaining Time First (SRTF)
-   **Logic**: Preemptive version of SJF.
-   **Condition**: If $NewProcess.BT < CurrentProcess.RemainingBT$, Context Switch occurs.
-   **Complexity**: $O(N)$ per tick (worst case scan) or $O(\log N)$ with Heap.

#### 2.1.4 Round Robin (RR)
-   **Logic**: Each process gets a fixed `Time Quantum (Q)`.
-   **State Transition**:
    -   If $Process.ExecTime == Q$ AND $Process.Remaining > 0$: Move to Tail of Ready Queue.
-   **Complexity**: $O(1)$.

### 2.2 Memory Models

The Memory Management Unit (MMU) simulates a 32-bit address space.

-   **Addressable Units**: 8-bit Bytes.
-   **Word Size**: 32-bit (4 Bytes).
-   **Little Endian**: Byte $0$ is Least Significant.
-   **Constraint**: `0x00000000` to `0x000FFFFF` (1MB).

---

## 3. Functional Requirements

### 3.1 The "SysCore" Engine
-   **FR-CORE-01**: Access to Memory MUST be aligned to 4-byte boundaries for `read32`/`write32` operations to simulate RISC constraints (Optional strict mode).
-   **FR-CORE-02**: The Transpiler MUST detect and forbid `eval`, `Function`, `setTimeout`, and `setInterval` in user code to prevent sandbox escape.
-   **FR-CORE-03**: The SysCore `yield()` mechanism MUST ensure the UI thread is unblocked at least every 16ms (60fps target).

### 3.2 The Shell Interface
-   **FR-SHELL-01**: `stdout` (Standard Output) MUST support ANSI color codes for rich text display.
-   **FR-SHELL-02**: `stdin` (Standard Input) MUST support asynchronous waiting (`await input()`) without blocking the entire Kernel.
-   **FR-SHELL-03**: The File System MUST persist files to `localStorage` or Supabase between sessions.

### 3.3 The Visualizer
-   **FR-VIS-01**: The Gantt Chart MUST scale horizontally based on total execution time.
-   **FR-VIS-02**: Process Blocks MUST change color based on state:
    -   <span style="color:yellow">Ready</span>
    -   <span style="color:green">Running</span>
    -   <span style="color:red">Terminated</span>
-   **FR-VIS-03**: Hovering over a block MUST show detailed stats (Turnaround Time, Waiting Time).

---

## 4. Non-Functional Requirements

### 4.1 Performance Constraints
-   **NFR-01**: The Kernel Boot time (initializing 1MB ArrayBuffer) MUST be under 50ms.
-   **NFR-02**: The Scheduler Tick rate MUST be capable of running at 100Hz (Turbo Mode) without UI lag.

### 4.2 Security Constraints
-   **NFR-SEC-01**: **No Server-Side Execution**. All arbitrary user code MUST run on the client.
-   **NFR-SEC-02**: Admin Routes (`/admin`) MUST be hard-blocked at the Router level if `user.role != 'CHECK_ROOT'`.

### 4.3 Browser Compatibility
-   **NFR-COMP-01**: The application MUST run on all Chromium-based browsers (Chrome, Edge, Brave) and Firefox.
-   **NFR-COMP-02**: Mobile Viewport support for "Read-Only" mode (simulations can be watched, but coding is restricted).

---

## 5. Error Handling Specifications

### 5.1 Kernel Panic (KP)
If the SysCore encounters an unrecoverable error (e.g., SegFault, Stack Overflow):
1.  Execution STOPS immediately.
2.  The Terminal displays a "Red Screen of Death" log.
3.  The memory dump (Start of Stack/Heap) is printed to console.
4.  The User is prompted to "Reboot" (Reload Page).

### 5.2 Compiler Errors
If `Transpiler.ts` fails to parse C code:
1.  The specific line number and regex failure usage MUST be reported.
2.  The underlying JS error is suppressed in favor of a user-friendly "Syntax Error".

