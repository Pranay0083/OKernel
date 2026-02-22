import React from 'react';

export const WikiSemaphores = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
      {/* Header Section */}
      <div className="border-b border-zinc-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-mono rounded-full border border-purple-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          CS 401: ADVANCED SYNCHRONIZATION
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
          Semaphores & Classic Problems
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed font-light">
          A rigorous examination of Dijkstra's Semaphore, spinlock avoidance via wait queues, and the formal solutions to the Bounded-Buffer and Readers-Writers multi-process problems.
        </p>
      </div>

      {/* Section 1: Formal Definition */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. Semaphore Formal Definition</h2>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          A mutex lock is generally considered the simplest synchronization tool. A more robust tool that can behave similarly to a mutex lock but can also provide more sophisticated ways for processes to synchronize their activities is a <strong>Semaphore</strong>.
        </p>

        <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800">
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">
            A semaphore <code>S</code> is an integer variable that, apart from initialization, is accessed only through two standard atomic operations: <code>wait()</code> and <code>signal()</code>. (Originally termed <code>P()</code> and <code>V()</code> from the Dutch words *proberen* (to test) and *verhogen* (to increment) by E. W. Dijkstra).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-black p-6 rounded-lg border border-purple-500/30 text-sm font-mono text-zinc-400">
              <h4 className="text-purple-400 mb-4 border-b border-zinc-800 pb-2">Definition of wait(S)</h4>
              <span className="text-yellow-300">wait</span>(S) {"{"}<br />
              <span className="text-pink-400 pl-4">while</span> (S {`<=`} <span className="text-orange-400">0</span>)<br />
              <span className="text-zinc-500 pl-8">; /* busy wait */</span><br />
              <span className="pl-4">S--;</span><br />
              {"}"}
            </div>
            <div className="bg-black p-6 rounded-lg border border-blue-500/30 text-sm font-mono text-zinc-400">
              <h4 className="text-blue-400 mb-4 border-b border-zinc-800 pb-2">Definition of signal(S)</h4>
              <span className="text-yellow-300">signal</span>(S) {"{"}<br />
              <span className="pl-4">S++;</span><br />
              {"}"}
            </div>
          </div>
          <div className="mt-4 p-4 border-l-4 border-l-orange-500 bg-orange-500/5 text-orange-200 text-xs">
            <strong>Atomicity Requirement:</strong> All modifications to the integer value of the semaphore in the <code>wait()</code> and <code>signal()</code> operations must be executed indivisibly using the hardware <code>compare_and_swap</code> primitive defined in the previous chapter.
          </div>
        </div>
      </section>

      {/* Section 2: Implementation without Busy Waiting */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">2. Implementation: Avoiding Spinlocks</h2>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          The main disadvantage of the basic semaphore definition given above is that it requires <em>busy waiting</em>. While a process is in its critical section, any other process that tries to enter its critical section must loop continuously in the entry code. This continually wastes CPU cycles.
        </p>

        <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
          <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
            <span>semaphore_impl.c</span>
            <span>OS Internal Implementation</span>
          </div>
          <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed">
            <pre className="text-zinc-300">
              <span className="text-blue-400">typedef struct</span> {"{"}<br />
              <span className="text-blue-400 pl-4">int</span> value;<br />
              <span className="text-blue-400 pl-4">struct</span> process *list; <span className="text-zinc-500">/* Linked-list Queue of PCBs */</span><br />
              {"}"} <span className="text-yellow-300">semaphore</span>;<br />
              <br />
              <span className="text-blue-400">void</span> <span className="text-yellow-300">wait</span>(<span className="text-yellow-300">semaphore</span> *S) {"{"}<br />
              <span className="pl-4">S{`->`}value--;</span><br />
              <span className="text-pink-400 pl-4">if</span> (S{`->`}value {`<`} <span className="text-orange-400">0</span>) {"{"}<br />
              <span className="pl-8 text-zinc-500">/* Add this process PCB to S{`->`}list */</span><br />
              <span className="pl-8"><span className="text-yellow-300">add_to_queue</span>(S{`->`}list, current_process);</span><br />
              <span className="pl-8 text-zinc-500">/* Yield the CPU to the Short-Term Scheduler */</span><br />
              <span className="pl-8"><span className="text-yellow-300">block</span>();</span><br />
              <span className="pl-4">{"}"}</span><br />
              {"}"}<br />
              <br />
              <span className="text-blue-400">void</span> <span className="text-yellow-300">signal</span>(<span className="text-yellow-300">semaphore</span> *S) {"{"}<br />
              <span className="pl-4">S{`->`}value++;</span><br />
              <span className="text-pink-400 pl-4">if</span> (S{`->`}value {`<=`} <span className="text-orange-400">0</span>) {"{"}<br />
              <span className="pl-8 text-zinc-500">/* Remove a process P from S{`->`}list */</span><br />
              <span className="pl-8"><span className="text-blue-400">struct</span> process *P = <span className="text-yellow-300">pop_from_queue</span>(S{`->`}list);</span><br />
              <span className="pl-8 text-zinc-500">/* Move it from Waiting State to Ready State */</span><br />
              <span className="pl-8"><span className="text-yellow-300">wakeup</span>(P);</span><br />
              <span className="pl-4">{"}"}</span><br />
              {"}"}
            </pre>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="bg-zinc-900/40 p-6 rounded border border-zinc-800">
            <strong className="text-green-400 block mb-2 text-base">Mathematical Property of Negative Values</strong>
            <p className="text-zinc-500">
              In this implementation, the semaphore value can become strictly negative. If a semaphore value is negative, its magnitude is the exact mathematical count of the number of processes currently blocked and waiting on that semaphore's queue.
            </p>
          </div>
          <div className="bg-zinc-900/40 p-6 rounded border border-zinc-800">
            <strong className="text-blue-400 block mb-2 text-base">Binary vs Counting Semaphores</strong>
            <p className="text-zinc-500">
              A <strong>Counting Semaphore</strong> is initialized to N (where N {`>`} 1) and is used to control access to a given resource consisting of N instances. A <strong>Binary Semaphore</strong> is initialized to exactly 1. A binary semaphore behaves identically to a standard Mutex Lock.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: The Bounded-Buffer Problem */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">3. The Bounded-Buffer (Producer-Consumer) Problem</h2>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          This problem is commonly used to illustrate the power of synchronization primitives. We have a pool of <code>n</code> buffers, each capable of holding one item. The producer produces full buffers for the consumer, and the consumer produces empty buffers for the producer.
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-4">
            <h4 className="text-xl font-bold text-zinc-200 border-b border-zinc-800 pb-2">Shared Data Structures</h4>
            <ul className="text-sm font-mono text-zinc-400 space-y-3">
              <li><span className="text-blue-400">semaphore</span> mutex = <span className="text-orange-400">1</span>;</li>
              <li><span className="text-blue-400">semaphore</span> empty = n;</li>
              <li><span className="text-blue-400">semaphore</span> full = <span className="text-orange-400">0</span>;</li>
            </ul>
            <p className="text-xs text-zinc-500 mt-4 pt-4 border-t border-zinc-800">
              <code>mutex</code> protects the buffer array from concurrent writes. <code>empty</code> ensures the producer sleeps if all <i>n</i> buffers are full. <code>full</code> ensures the consumer sleeps if all <i>n</i> buffers are completely empty.
            </p>
          </div>

          <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Producer */}
            <div className="bg-black p-4 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300">
              <h4 className="text-green-400 mb-2 border-b border-zinc-800 pb-2 text-sm">Producer Process</h4>
              <span className="text-pink-400">while</span> (<span className="text-orange-400">true</span>) {"{"}<br />
              <span className="pl-4 text-zinc-500">/* Produce an item in next_produced */</span><br />
              <br />
              <span className="pl-4 text-yellow-300">wait</span>(empty);<br />
              <span className="pl-4 text-yellow-300">wait</span>(mutex);<br />
              <br />
              <span className="pl-4 text-zinc-500">/* Add next_produced to buffer */</span><br />
              <br />
              <span className="pl-4 text-yellow-300">signal</span>(mutex);<br />
              <span className="pl-4 text-yellow-300">signal</span>(full);<br />
              {"}"}
            </div>

            {/* Consumer */}
            <div className="bg-black p-4 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300">
              <h4 className="text-blue-400 mb-2 border-b border-zinc-800 pb-2 text-sm">Consumer Process</h4>
              <span className="text-pink-400">while</span> (<span className="text-orange-400">true</span>) {"{"}<br />
              <span className="pl-4 text-yellow-300">wait</span>(full);<br />
              <span className="pl-4 text-yellow-300">wait</span>(mutex);<br />
              <br />
              <span className="pl-4 text-zinc-500">/* Remove an item into next_consumed */</span><br />
              <br />
              <span className="pl-4 text-yellow-300">signal</span>(mutex);<br />
              <span className="pl-4 text-yellow-300">signal</span>(empty);<br />
              <br />
              <span className="pl-4 text-zinc-500">/* Consume the item in next_consumed */</span><br />
              {"}"}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Readers-Writers */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">4. The Readers-Writers Problem</h2>

        <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
          Suppose a database is to be shared among several concurrent processes. Some of these processes may want only to read the database, whereas others may want to update (read and write) the database. We distinguish between these two types of processes by referring to them as <strong>readers</strong> and <strong>writers</strong>.
        </p>
        <div className="p-4 bg-black border-l-4 border-l-purple-500 border border-zinc-800 rounded text-sm text-zinc-400 max-w-4xl">
          <strong className="text-purple-400">The Constraint:</strong> If two readers access the shared data simultaneously, no adverse effects will result. However, if a writer and some other process (either a reader or a writer) access the database simultaneously, chaos may ensue.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl h-full">
            <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
              <span>writer.c</span>
            </div>
            <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed h-full">
              <pre className="text-zinc-300">
                <span className="text-pink-400">while</span> (<span className="text-orange-400">true</span>) {"{"}<br />
                <span className="text-zinc-500 pl-4">/* Writer must acquire absolute lock */</span><br />
                <span className="pl-4"><span className="text-yellow-300">wait</span>(rw_mutex);</span><br />
                <br />
                <span className="text-red-400 pl-4">/* -- PERFORM WRITING ISOLATED -- */</span><br />
                <br />
                <span className="text-zinc-500 pl-4">/* Writer releases absolute lock */</span><br />
                <span className="pl-4"><span className="text-yellow-300">signal</span>(rw_mutex);</span><br />
                {"}"}
              </pre>
            </div>
          </div>

          <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl h-full">
            <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
              <span>reader.c</span>
            </div>
            <div className="p-6 overflow-x-auto text-xs font-mono leading-relaxed h-full">
              <pre className="text-zinc-300">
                <span className="text-pink-400">while</span> (<span className="text-orange-400">true</span>) {"{"}<br />
                <span className="pl-4"><span className="text-yellow-300">wait</span>(mutex);</span><br />
                <span className="pl-4">read_count++;</span><br />
                <span className="text-pink-400 pl-4">if</span> (read_count == <span className="text-orange-400">1</span>)<br />
                <span className="text-zinc-500 pl-8">/* 1st reader locks out ANY writers */</span><br />
                <span className="pl-8"><span className="text-yellow-300">wait</span>(rw_mutex);</span><br />
                <span className="pl-4"><span className="text-yellow-300">signal</span>(mutex);</span><br />
                <br />
                <span className="text-green-400 pl-4">/* -- PERFORM READING CONCURRENTLY -- */</span><br />
                <br />
                <span className="pl-4"><span className="text-yellow-300">wait</span>(mutex);</span><br />
                <span className="pl-4">read_count--;</span><br />
                <span className="text-pink-400 pl-4">if</span> (read_count == <span className="text-orange-400">0</span>)<br />
                <span className="text-zinc-500 pl-8">/* Last reader out unlocks for writers */</span><br />
                <span className="pl-8"><span className="text-yellow-300">signal</span>(rw_mutex);</span><br />
                <span className="pl-4"><span className="text-yellow-300">signal</span>(mutex);</span><br />
                {"}"}
              </pre>
            </div>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center text-zinc-500 italic text-sm">
          This implementation solves the First Readers-Writers Problem, meaning no reader is kept waiting unless a writer has already obtained permission to use the shared object (potentially causing Writer Starvation).
        </div>
      </section>

    </div>
  );
};
