# OKernel: The Story So Far

> "To understand the machine, you must see it think."

OKernel began as a simple idea: **What if you could see inside the CPU while your code runs?** Not just a debugger, but a visualizer that exposes the hidden mechanics of computing—Stack frames, Heap allocations, Branch predictions, and Context switches.

Today, OKernel v1.1.0 is a comprehensive **OS & Runtime Simulator**. Here is the story of its features.

---

## 🚀 The Core Experience

### 1. The Code Editor (Your Cockpit)
It starts here. A professional-grade editor (Monaco) with syntax highlighting for **Python** and **C++**. But this isn't a normal editor.
-   **Heatmap Integration**: As your code runs, the gutter glows. Red lines are hot (CPU intensive), blue lines are cool. You instantly see where your code spends its time.
-   **Live Execution**: Hit `CMD+ENTER`. No waiting for compile chains. The system feels instantaneous.

### 2. The Visualizer (The "Matrix" View)
When execution begins, the screen transforms.
-   **The Timeline**: A scrolling graph at the bottom tracks **Memory Pressure** (Green) and **CPU Intensity** (Orange) over time. You can scrub back and forth like a video editor.
-   **The Stack**: On the left, stack frames push and pop in real-time. You see recursion happen visually.
-   **The Heap**: On the right, objects appear. Arrays, Dictionaries, Classes.
-   **The Connections**: Green laser-lines connect your Stack variables to their Heap objects. You finally understand *pointers* and *references*.

### 3. "Sympathy" Mode (Hardware Inspector)
Switch tabs to `/dev/sympathy:hardware`, and you go deeper.
-   **The Chip**: See the ALU, Control Unit, and Registers light up.
-   **The Pipeline**: Watch instructions flow through Fetch-Decode-Execute.
-   **Branch Prediction**: See how your `if` statements stress the CPU. Too many jumps? The "Misprediction" counters spike. This teaches you to write branch-free code.

---

## 🌲 The Recursion Tree

One of our most requested features. When running recursive algorithms (like Fibonacci or DFS), the stack view can get overwhelming.
-   **The Tree View**: Switch to the **Recursion Tab**. Your execution is transformed into a beautiful, auto-balancing tree graph.
-   **Interactive**: Click on a node. It expands to show the **Local Variables** at that specific depth.
-   **Noise Canceling**: We filter out system noise (like wrappers and main loops) so you only see *your* algorithm.

---

## ⚡ SysCore: The Engine Room

Behind the beautiful UI lies **SysCore**, a beast written in **Rust**.
-   **Safety First**: Every user code runs in a disposable, fire-walled Docker container.
-   **Micro-Tracing**: We don't just run code; we *instrument* it. We capture opcode-level events without slowing down execution significantly.
-   **Polyglot**: Whether it's the dynamic nature of Python or the raw pointers of C++, SysCore normalizes the data into a standard trace format.

---

## 🛠 Admin & Power Tools

For the operators (you), we built a Linux-themed Admin Panel (`/root`).
-   **Dashboard**: Real-time system health, active containers, and memory usage.
-   **SQL Editor**: Direct access to the Supabase backend to query execution history.
-   **Sponsor Manager**: A way to manage the community that keeps OKernel alive.

---

## 🔮 What's Next?
OKernel is evolving. We are looking at **Collaborative Debugging**, **WASM Support**, and deeper **Kernel Simulation** (Virtual Filesystems, Process Scheduling).

Welcome to OKernel v1.1.0.
*Execute. Observe. Understand.*
