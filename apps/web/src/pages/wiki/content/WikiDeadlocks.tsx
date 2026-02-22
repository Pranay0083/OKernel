import React from 'react';

export const WikiDeadlocks = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
            {/* Header Section */}
            <div className="border-b border-zinc-800 pb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 text-xs font-mono rounded-full border border-red-500/20 mb-6">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    CS 401: DEADLOCKS
                </div>
                <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
                    Deadlock Architectures
                </h1>
                <p className="text-xl text-zinc-400 leading-relaxed font-light">
                    A rigorous examination of Deadlock conditions, Resource-Allocation Graphs (RAG), and Djikstra's Banker's Algorithm for dynamic deadlock avoidance.
                </p>
            </div>

            {/* Section 1: Formal Definition */}
            <section className="space-y-6">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. The Deadlock Problem</h2>

                <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                    In a multiprogramming environment, several processes may compete for a finite number of resources. A process requests resources; if the resources are not available at that time, the process enters a waiting state. Sometimes, a waiting process is never again able to change state, because the resources it has requested are held by other waiting processes. This situation is called a <strong>deadlock</strong>.
                </p>

                <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800">
                    <h3 className="text-xl font-bold text-zinc-200 mb-4 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Necessary Conditions</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                        A deadlock situation can arise if and only if the following four conditions hold simultaneously in a system (Coffman conditions):
                    </p>
                    <ul className="space-y-4 text-sm text-zinc-400">
                        <li><strong className="text-red-400 block">1. Mutual Exclusion:</strong> At least one resource must be held in a non-sharable mode; that is, only one process at a time can use the resource.</li>
                        <li><strong className="text-orange-400 block">2. Hold and Wait:</strong> A process must be holding at least one resource and waiting to acquire additional resources that are currently being held by other processes.</li>
                        <li><strong className="text-yellow-400 block">3. No Preemption:</strong> Resources cannot be preempted; that is, a resource can be released only voluntarily by the process holding it, after that process has completed its task.</li>
                        <li><strong className="text-green-400 block">4. Circular Wait:</strong> There must exist a set {`$\\{P_0, P_1, ..., P_n\\}$`} of waiting processes such that $P_0$ is waiting for a resource held by $P_1$, $P_1$ is waiting for a resource held by $P_2$, ..., {`$P_{n - 1}$`} is waiting for a resource held by $P_n$, and $P_n$ is waiting for a resource held by $P_0$.</li>
                    </ul>
                </div>
            </section>

            {/* Section 2: Resource Allocation Graphs */}
            <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
                <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">2. Resource-Allocation Graphs (RAG)</h2>

                <p className="text-lg text-zinc-400 leading-relaxed mb-6">
                    Deadlocks can be described more precisely in terms of a directed graph called a system resource-allocation graph. The graph consists of a set of vertices $V$ and a set of edges $E$.
                </p>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-1/2 bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-4">
                        <h4 className="text-xl font-bold text-zinc-200 border-b border-zinc-800 pb-2">Graph Vertex Theory</h4>
                        <ul className="text-sm text-zinc-400 space-y-3 list-disc list-inside">
                            <li>$P = {`\\{P_1, P_2, ..., P_n\\}`}$, the set consisting of all the active processes in the system. (Represented as Circles).</li>
                            <li>$R = {`\\{R_1, R_2, ..., R_m\\}`}$, the set consisting of all resource types in the system. (Represented as Rectangles).</li>
                            <li><strong>Request Edge</strong>: A directed edge $P_i \rightarrow R_j$. Process $P_i$ has requested an instance of resource type $R_j$ and is currently waiting for that resource.</li>
                            <li><strong>Assignment Edge</strong>: A directed edge $R_j \rightarrow P_i$. An instance of resource type $R_j$ has been allocated to process $P_i$.</li>
                        </ul>
                    </div>

                    <div className="w-full lg:w-1/2 grid flex flex-col gap-4">
                        <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/30 text-sm">
                            <h4 className="text-red-400 mb-2 font-bold font-mono">Fundamental Graph Theorem 1</h4>
                            <p className="text-zinc-300">
                                If a resource-allocation graph does not have a cycle, then the system is definitely NOT in a deadlocked state.
                            </p>
                        </div>
                        <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/30 text-sm">
                            <h4 className="text-orange-400 mb-2 font-bold font-mono">Fundamental Graph Theorem 2</h4>
                            <p className="text-zinc-300">
                                If there is a cycle in the RAG, and each resource type has exactly <strong>one instance</strong>, then a deadlock has occurred. The cycle is a necessary and sufficient condition.
                            </p>
                        </div>
                        <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/30 text-sm">
                            <h4 className="text-yellow-400 mb-2 font-bold font-mono">Fundamental Graph Theorem 3</h4>
                            <p className="text-zinc-300">
                                If there is a cycle in the RAG, and each resource type has <strong>multiple instances</strong>, a deadlock <em>may or may not</em> exist. The cycle is a necessary condition, but not a sufficient condition.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Banker's Algorithm */}
            <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <h2 className="text-3xl font-bold text-zinc-100">3. Banker's Algorithm (Deadlock Avoidance)</h2>
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded font-mono text-xs">DIJKSTRA (1965)</span>
                </div>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
                    The resource-allocation-graph algorithm is not applicable to a system with multiple instances of each resource type. The Banker's architecture is a deadlock avoidance algorithm. When a new process enters the system, it must declare the maximum number of instances of each resource type that it may need.
                </p>

                <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
                    When a user requests a set of resources, the system must determine whether the allocation of these resources will leave the system in a <strong>safe state</strong>. If it will, the resources are allocated; otherwise, the process must wait until some other process releases enough resources.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* Data Structures */}
                    <div className="space-y-4 text-zinc-400 text-sm border-r border-zinc-800 pr-8">
                        <h4 className="font-bold text-zinc-200">Data Structure Definitions</h4>
                        <p>Let $n$ be the number of processes in the system and $m$ be the number of resource types.</p>
                        <ul className="space-y-4 mt-4">
                            <li><strong className="text-blue-400 font-mono">Available:</strong> A vector of length $m$. If <code>Available[j] == k</code>, there are $k$ instances of resource type $R_j$ available.</li>
                            <li><strong className="text-green-400 font-mono">Max:</strong> An $n \times m$ matrix. If <code>Max[i][j] == k</code>, process $P_i$ may request at most $k$ instances of resource $R_j$.</li>
                            <li><strong className="text-orange-400 font-mono">Allocation:</strong> An $n \times m$ matrix. If <code>Allocation[i][j] == k</code>, $P_i$ is currently allocated $k$ instances of $R_j$.</li>
                            <li><strong className="text-red-400 font-mono">Need:</strong> An $n \times m$ matrix. Mathematical definition: <code>Need[i][j] = Max[i][j] - Allocation[i][j]</code>.</li>
                        </ul>
                    </div>

                    {/* The Safety Algorithm */}
                    <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl h-full">
                        <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
                            <span>safety_algorithm.c</span>
                        </div>
                        <div className="p-6 overflow-x-auto text-xs font-mono leading-relaxed h-full">
                            <pre className="text-zinc-300">
                                <span className="text-blue-400">int</span> work[m]; <span className="text-zinc-500">/* Clone of Available vector */</span><br />
                                <span className="text-blue-400">bool</span> finish[n]; <span className="text-zinc-500">/* Tracks completed processes */</span><br />
                                <br />
                                <span className="text-zinc-500">/* 1. Initialization */</span><br />
                                <span className="text-pink-400">for</span> (<span className="text-blue-400">int</span> i = <span className="text-orange-400">0</span>; i {`<`} m; i++) work[i] = Available[i];<br />
                                <span className="text-pink-400">for</span> (<span className="text-blue-400">int</span> i = <span className="text-orange-400">0</span>; i {`<`} n; i++) finish[i] = <span className="text-orange-400">false</span>;<br />
                                <br />
                                <span className="text-zinc-500">/* 2. Find an index i such that the process hasn't finished */</span><br />
                                <span className="text-zinc-500">/* AND its Needs are less than or equal to current Work pool */</span><br />
                                find_i:<br />
                                <span className="text-blue-400">int</span> found = <span className="text-orange-400">-1</span>;<br />
                                <span className="text-pink-400">for</span> (<span className="text-blue-400">int</span> i = <span className="text-orange-400">0</span>; i {`<`} n; i++) {"{"}<br />
                                <span className="text-pink-400 pl-4">if</span> (!finish[i] && Need[i] {`<=`} work) {"{"}<br />
                                <span className="pl-8">found = i;</span><br />
                                <span className="text-pink-400 pl-8">break</span>;<br />
                                <span className="pl-4">{"}"}</span><br />
                                {"}"}<br />
                                <br />
                                <span className="text-pink-400">if</span> (found != <span className="text-orange-400">-1</span>) {"{"}<br />
                                <span className="text-zinc-500 pl-4">/* 3. Pretend to allocate and then let it FINISH. */</span><br />
                                <span className="text-zinc-500 pl-4">/* Once it finishes, it returns its ALLOCATED resources to the pool */</span><br />
                                <span className="pl-4">work = work + Allocation[found];</span><br />
                                <span className="pl-4">finish[found] = <span className="text-orange-400">true</span>;</span><br />
                                <span className="text-pink-400 pl-4">goto</span> find_i;<br />
                                {"}"}<br />
                                <br />
                                <span className="text-zinc-500">/* 4. If all processes could theoretically finish, state is SAFE */</span><br />
                                <span className="text-blue-400">bool</span> is_safe = <span className="text-orange-400">true</span>;<br />
                                <span className="text-pink-400">for</span> (<span className="text-blue-400">int</span> i = <span className="text-orange-400">0</span>; i {`<`} n; i++)<br />
                                <span className="text-pink-400 pl-4">if</span> (!finish[i]) is_safe = <span className="text-orange-400">false</span>;<br />
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl mt-8 flex flex-col items-center justify-center text-center">
                    <h4 className="font-bold text-blue-400 mb-2 uppercase tracking-widest text-lg border-b border-blue-500/30 pb-2">The Resource-Request Algorithm</h4>
                    <p className="text-sm text-zinc-400 max-w-2xl mt-2">
                        When a process makes an actual request, the system checks if the request is less than its `Need` and less than `Available`. If so, the OS temporarily subtracts the request from `Available` and adds it to the process's `Allocation`. <br /><br />
                        The OS then runs the <strong>Safety Algorithm</strong> above. If the resulting theoretical state is SAFE, the real hardware allocation is granted. If the resulting state is UNSAFE, the theoretical allocation is rolled back, the allocation is denied, and the process is put to sleep.
                    </p>
                </div>
            </section>

        </div>
    );
};
