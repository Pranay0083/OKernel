import React from 'react';

export const WikiProcesses = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
      {/* Header Section */}
      <div className="border-b border-zinc-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-mono rounded-full border border-green-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          CS 401: PROCESS MANAGEMENT
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
          The Process Concept & IPC
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed font-light">
          A rigorous examination of process states, the Process Control Block (PCB), Context Switching overhead, and POSIX Inter-Process Communication (IPC).
        </p>
      </div>

      {/* Section 1: Formal Definition */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. The Process Concept</h2>

        <p className="text-lg text-zinc-400 leading-relaxed">
          A Program is a passive entity, such as a file containing a list of instructions stored on disk (often called an executable file). In contrast, a <strong>Process</strong> is an active, dynamic entity. It is an instance of a computer program that is currently being executed.
        </p>

        <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800 mt-6">
          <h3 className="text-xl font-bold text-zinc-200 mb-4 uppercase tracking-widest font-mono text-sm">Memory Layout of a Process</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            When a program is loaded into memory, it becomes a process. It is allocated a specific address space governed by the Memory Management Unit (MMU). The standard memory topology consists of heavily segregated logical sections:
          </p>

          {/* Code Visual Diagram */}
          <div className="flex flex-col md:flex-row items-center gap-8 bg-zinc-950 p-6 rounded-lg border border-zinc-800">
            {/* The Stack visual */}
            <div className="w-full md:w-1/3 flex flex-col font-mono text-xs">
              <div className="border border-b-0 border-zinc-700 p-3 text-center bg-blue-500/10 text-blue-400 relative group">
                <span className="absolute -left-[4.5rem] text-zinc-600 top-2">MAX addr</span>
                Stack
                <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-black border border-zinc-700 text-zinc-300 text-[10px] top-1/2 left-full ml-4 shadow-xl">
                  Contains temporary data (local variables, function parameters, return addresses). Shrinks and grows automatically.
                </div>
              </div>
              <div className="border-x border-zinc-700 h-8 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_8px)] flex items-center justify-center">
                <span className="text-zinc-500">↓</span>
              </div>
              <div className="border-x border-zinc-700 p-4 text-center text-zinc-600 italic">Free Space</div>
              <div className="border-x border-zinc-700 h-8 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_8px)] flex items-center justify-center">
                <span className="text-zinc-500">↑</span>
              </div>
              <div className="border border-t-0 border-b-0 border-zinc-700 p-3 text-center bg-purple-500/10 text-purple-400 relative group">
                Heap
                <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-black border border-zinc-700 text-zinc-300 text-[10px] top-1/2 left-full ml-4 shadow-xl">
                  Memory dynamically allocated during runtime (e.g., using `malloc()` in C or `new` in Java).
                </div>
              </div>
              <div className="border border-b-0 border-zinc-700 p-3 text-center bg-green-500/10 text-green-400 relative group">
                Data Section
                <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-black border border-zinc-700 text-zinc-300 text-[10px] top-1/2 left-full ml-4 shadow-xl">
                  Contains global and static variables initialized by the programmer.
                </div>
              </div>
              <div className="border border-zinc-700 p-3 text-center bg-red-500/10 text-red-500 relative group">
                <span className="absolute -left-[4.5rem] text-zinc-600 top-2">0x000000</span>
                Text (Code)
                <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-black border border-zinc-700 text-zinc-300 text-[10px] top-1/2 left-full ml-4 shadow-xl">
                  The compiled machine code instructions read directly from the executable file. Read-only to prevent self-modification.
                </div>
              </div>
            </div>

            <div className="flex-1 text-sm text-zinc-400 space-y-4">
              <p><strong>Note on Vulnerabilities:</strong> The Stack and the Heap grow toward each other. If a programmer writes infinite recursion, the stack will grow until it overwrites the heap, causing a <strong>Stack Overflow</strong>.</p>
              <p>Similarly, writing past the boundaries of a buffer on the stack (Buffer Overflow) can overwrite the Function Return Address, allowing malicious code execution. Modern OSes use <em>ASLR (Address Space Layout Randomization)</em> to mitigate this by randomizing starting addresses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Process State & PCB */}
      <section className="space-y-8 pt-8 border-t border-zinc-900 mt-12">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">2. Implementation: The PCB</h2>

        <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
          The operating system represents each process internally using a C language <code>struct</code> called the Process Control Block (PCB), or Task Control Block in Linux architectures.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* State Diagram text */}
          <div className="space-y-6">
            <h4 className="font-bold text-zinc-200">The 5-State Process Model</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex gap-4"><span className="w-24 text-blue-400 font-mono flex-shrink-0">NEW:</span> The process is being created (memory allocated, PCB initialized).</li>
              <li className="flex gap-4"><span className="w-24 text-yellow-400 font-mono flex-shrink-0">READY:</span> The process is waiting in the Ready Queue to be assigned to a processor.</li>
              <li className="flex gap-4"><span className="w-24 text-green-400 font-mono flex-shrink-0">RUNNING:</span> Instructions are actively being executed by the ALU.</li>
              <li className="flex gap-4"><span className="w-24 text-orange-400 font-mono flex-shrink-0">WAITING:</span> The process is blocked waiting for some event (e.g., Disk I/O, receiving a network packet).</li>
              <li className="flex gap-4"><span className="w-24 text-red-500 font-mono flex-shrink-0">TERMINATED:</span> The process has finished execution and OS is deallocating its resources.</li>
            </ul>
          </div>

          {/* Code Snippet for PCB */}
          <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
              <span>linux/sched.h (Simplified)</span>
              <span>C Struct</span>
            </div>
            <div className="p-6 overflow-x-auto text-xs font-mono leading-relaxed">
              <pre className="text-zinc-300">
                <span className="text-blue-400">struct</span> <span className="text-yellow-300">task_struct</span> {"{"}<br />
                <span className="text-zinc-500">{"/* State: -1 unrunnable, 0 runnable, >0 stopped */"}</span><br />
                <span className="text-blue-400 pl-4">volatile long</span> state;<br />
                <br />
                <span className="text-zinc-500">{"/* Process ID */"}</span><br />
                <span className="text-blue-400 pl-4">pid_t</span> pid;<br />
                <br />
                <span className="text-zinc-500">{"/* CPU Architecture specific hardware context (Registers, Program Counter) */"}</span><br />
                <span className="text-blue-400 pl-4">struct</span> thread_struct thread;<br />
                <br />
                <span className="text-zinc-500">{"/* Memory Management Info (Page Directory pointers) */"}</span><br />
                <span className="text-blue-400 pl-4">struct</span> mm_struct *mm;<br />
                <br />
                <span className="text-zinc-500">{"/* Open File Descriptor Table */"}</span><br />
                <span className="text-blue-400 pl-4">struct</span> files_struct *files;<br />
                <br />
                <span className="text-zinc-500">{"/* Scheduling Information (Priority, Timeslice) */"}</span><br />
                <span className="text-blue-400 pl-4">int</span> prio, static_prio, normal_prio;<br />
                <span className="text-blue-400 pl-4">struct</span> sched_entity se;<br />
                <br />
                <span className="text-zinc-500">{"/* Parent process */"}</span><br />
                <span className="text-blue-400 pl-4">struct</span> task_struct *parent;<br />
                {"}"};
              </pre>
            </div>
          </div>
        </div>

        {/* Context Switching */}
        <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-xl mt-8">
          <h3 className="text-xl font-bold text-red-400 mb-4 uppercase tracking-widest font-mono text-sm inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            The Context Switch Overhead
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            When an interrupt occurs (e.g., a hardware timer expires), the system must save the current context of the running process so it can be restored later, and then load the context of the newly scheduled process.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4 font-bold border-l-2 border-red-500 pl-4">
            Context-switch time is pure overhead, because the system does no useful work while switching. Its speed is highly dependent on memory speed, the number of registers that must be copied, and the architecture of the MMU (invalidating TLB caches).
          </p>
        </div>
      </section>

      {/* Section 3: Process Creation API */}
      <section className="space-y-8 pt-8 border-t border-zinc-900 mt-12">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <h2 className="text-3xl font-bold text-zinc-100">3. Process Creation (fork / exec)</h2>
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded font-mono text-xs">UNIX POSIX STANDARD</span>
        </div>

        <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
          In UNIX/Linux systems, processes are created using the <code>fork()</code> system call. This creates a new process (the child) that consists of a <strong>bitwise exact copy</strong> of the address space of the original process (the parent).
        </p>

        <div className="grid grid-cols-1 gap-8 mt-8">
          {/* fork() Code Example */}
          <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
              <span>fork_example.c</span>
              <span>C Programming Language</span>
            </div>
            <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed">
              <pre className="text-zinc-300">
                <span className="text-pink-400">#include</span> <span className="text-green-300">&lt;sys/types.h&gt;</span><br />
                <span className="text-pink-400">#include</span> <span className="text-green-300">&lt;sys/wait.h&gt;</span><br />
                <span className="text-pink-400">#include</span> <span className="text-green-300">&lt;stdio.h&gt;</span><br />
                <span className="text-pink-400">#include</span> <span className="text-green-300">&lt;unistd.h&gt;</span><br />
                <br />
                <span className="text-blue-400">int</span> <span className="text-yellow-300">main</span>() {"{"}<br />
                <span className="text-blue-400 pl-4">pid_t</span> pid;<br />
                <br />
                <span className="text-zinc-500 pl-4">{"/* Fork a child process. After this line, TWO processes execute the next line! */"}</span><br />
                <span className="pl-4">pid = <span className="text-yellow-300">fork</span>();</span><br />
                <br />
                <span className="text-pink-400 pl-4">if</span> (pid {`<`} <span className="text-orange-400">0</span>) {"{"}<br />
                <span className="pl-8 text-zinc-500">{"/* Error occurred */"}</span><br />
                <span className="pl-8"><span className="text-yellow-300">fprintf</span>(stderr, <span className="text-green-300">"Fork Failed"</span>);</span><br />
                <span className="text-pink-400 pl-8">return</span> <span className="text-orange-400">1</span>;<br />
                <span className="pl-4">{"}"}</span><br />
                <span className="text-pink-400 pl-4">else if</span> (pid == <span className="text-orange-400">0</span>) {"{"}<br />
                <span className="pl-8 text-zinc-500">{"/* This block executes ONLY in the CHILD process */"}</span><br />
                <span className="pl-8 text-zinc-500">{"/* Replace the child's memory space with a brand new program */"}</span><br />
                <span className="pl-8"><span className="text-yellow-300">execlp</span>(<span className="text-green-300">"/bin/ls"</span>, <span className="text-green-300">"ls"</span>, <span className="text-blue-400">NULL</span>);</span><br />
                <span className="pl-4">{"}"}</span><br />
                <span className="text-pink-400 pl-4">else</span> {"{"}<br />
                <span className="pl-8 text-zinc-500">{"/* This block executes ONLY in the PARENT process */"}</span><br />
                <span className="pl-8 text-zinc-500">{"/* The parent waits for the child to finish executing */"}</span><br />
                <span className="pl-8"><span className="text-yellow-300">wait</span>(<span className="text-blue-400">NULL</span>);</span><br />
                <span className="pl-8"><span className="text-yellow-300">printf</span>(<span className="text-green-300">"Child Complete"</span>);</span><br />
                <span className="pl-4">{"}"}</span><br />
                <br />
                <span className="text-pink-400 pl-4">return</span> <span className="text-orange-400">0</span>;<br />
                {"}"}
              </pre>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-zinc-400">
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-lg">
            <strong className="text-blue-400 font-mono text-base block mb-2">The return value of fork()</strong>
            When <code>fork()</code> completes successfully, it returns twice—once to the parent, returning the target PID of the newly spawned child. It returns a second time inside the clone itself, returning exactly <code>0</code>. This zero identifier allows the code to branch logic using standard C <code>if/else</code> statements.
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-lg">
            <strong className="text-purple-400 font-mono text-base block mb-2">The exec() system call</strong>
            <code>fork()</code> only creates clones. If you want to load a completely different program (like Google Chrome), the child process immediately calls <code>exec()</code>. This destroys the child's current memory space and overwrites the Text, Data, Heap, and Stack segments with the binary data of the new executable pulled from disk.
          </div>
        </div>
      </section>
    </div>
  );
};
