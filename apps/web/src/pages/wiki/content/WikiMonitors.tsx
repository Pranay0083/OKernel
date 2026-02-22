import React from 'react';

export const WikiMonitors = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
      {/* Header Section */}
      <div className="border-b border-zinc-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-mono rounded-full border border-teal-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          CS 401: HIGH-LEVEL SYNCHRONIZATION
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
          Monitors & Condition Variables
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed font-light">
          An architectural overview of the Monitor abstraction, the necessity of condition variables to prevent busy-waiting, and native object synchronization in Java and Pthreads.
        </p>
      </div>

      {/* Section 1: Formal Definition */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. The Necessity of High-Level Abstractions</h2>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          Although semaphores provide a convenient and effective mechanism for process synchronization, their incorrect use can result in timing errors that are notoriously difficult to detect since these errors happen only if particular execution sequences take place, which are not always easily reproducible.
        </p>

        <div className="bg-zinc-900/40 p-8 rounded-xl border border-zinc-800">
          <h3 className="text-xl font-bold text-zinc-200 mb-4 font-mono uppercase tracking-widest border-b border-zinc-800 pb-2">Common Semaphore Vulnerabilities</h3>
          <div className="space-y-4 text-sm font-mono text-zinc-400">
            <div className="p-4 bg-black border border-red-500/30 rounded">
              <span className="text-red-400 mb-2 block font-bold font-sans">1. Deadlock via Reversed Operations</span>
              <span className="text-yellow-300">signal</span>(mutex);<br />
              <span className="text-zinc-500">/* CRITICAL SECTION */</span><br />
              <span className="text-yellow-300">wait</span>(mutex);<br />
              <span className="text-xs font-sans text-red-500 italic mt-2 block">If two processes execute this sequence, both will enter the critical section simultaneously, destroying mutual exclusion.</span>
            </div>
            <div className="p-4 bg-black border border-red-500/30 rounded">
              <span className="text-red-400 mb-2 block font-bold font-sans">2. Deadlock via Operation Omission</span>
              <span className="text-yellow-300">wait</span>(mutex);<br />
              <span className="text-zinc-500">/* CRITICAL SECTION */</span><br />
              <span className="text-yellow-300">wait</span>(mutex);<br />
              <span className="text-xs font-sans text-red-500 italic mt-2 block">If a programmer forgets to call signal(), or calls wait() twice, the process deadlocks itself, blocking all other processes forever.</span>
            </div>
          </div>
        </div>

        <div className="bg-teal-500/5 p-8 rounded-xl border border-teal-500/20 shadow-[0_0_50px_rgba(20,184,166,0.05)] mt-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-teal-500/10 font-bold text-9xl leading-none">ADT</div>
          <h3 className="text-2xl font-bold text-teal-400 mb-2 relative z-10">The Monitor Concept</h3>

          <p className="text-zinc-300 text-sm leading-relaxed mb-4 relative z-10">
            To deal with such errors, researchers developed high-level language constructs. A <strong>Monitor</strong> type is an Abstract Data Type (ADT) that includes a set of programmer-defined operations that are provided with mutual exclusion within the monitor.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed mb-4 relative z-10 font-bold border-l-2 border-teal-500 pl-4">
            Only one process at a time can be active within the monitor. Consequently, the programmer does not need to code this synchronization constraint explicitly. The compiler handles the locking methodology.
          </p>
        </div>
      </section>

      {/* Section 2: Condition Variables */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">2. Condition Variables</h2>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          A basic monitor construct is not sufficiently powerful for modeling all synchronization schemes. For a process to wait within a monitor for an arbitrary event to happen, we must define one or more variables of type <code>condition</code>.
        </p>

        <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
          <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
            <span>monitor_syntax.c</span>
            <span>Pseudocode Definition</span>
          </div>
          <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed">
            <pre className="text-zinc-300">
              <span className="text-blue-400">monitor</span> <span className="text-yellow-300">monitor_name</span><br />
              {"{"}<br />
              <span className="text-zinc-500 pl-4">/* Shared variables declarations */</span><br />
              <span className="text-blue-400 pl-4">condition</span> x, y;<br />
              <br />
              <span className="text-blue-400 pl-4">function</span> <span className="text-yellow-300">P1</span>(...) {"{"}<br />
              <span className="text-zinc-500 pl-8">/* Process execution suspends until signal invoked */</span><br />
              <span className="pl-8">x.wait();</span><br />
              <span className="pl-8">...</span><br />
              <span className="pl-4">{"}"}</span><br />
              <br />
              <span className="text-blue-400 pl-4">function</span> <span className="text-yellow-300">P2</span>(...) {"{"}<br />
              <span className="text-zinc-500 pl-8">/* Resumes exactly ONE suspended process waiting on x */</span><br />
              <span className="pl-8">x.signal();</span><br />
              <span className="pl-4">{"}"}</span><br />
              <br />
              <span className="text-blue-400 pl-4">init_code</span>(...) {"{"}<br />
              <span className="text-zinc-500 pl-8">/* Initialize data structures */</span><br />
              <span className="pl-4">{"}"}</span><br />
              {"}"}
            </pre>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="bg-zinc-900/40 p-6 rounded border border-zinc-800">
            <strong className="text-orange-400 block mb-2 text-base">The Spurious Wakeup Problem</strong>
            <p className="text-zinc-500 mb-2">
              When a process is awakened by an <code>x.signal()</code>, it must re-acquire the internal monitor lock before it can run. By the time it acquires the lock, the logical condition it was waiting for might have become <em>false</em> again (e.g., modified by a third process).
            </p>
            <p className="text-zinc-400 font-bold border-l-2 border-orange-500 pl-2">
              Rule: You must always wrap wait() calls in a `while` loop that continuously checks the logical condition, NEVER an `if` statement.
            </p>
          </div>
          <div className="bg-zinc-900/40 p-6 rounded border border-zinc-800">
            <strong className="text-blue-400 block mb-2 text-base">Signal and Wait vs Signal and Continue</strong>
            <p className="text-zinc-500">
              When process P invokes <code>x.signal()</code> while process Q is suspended on <code>x.wait()</code>, two processes are technically ready to run in the monitor. We must choose. <em>Signal and Wait</em> (Hoare semantics): P waits until Q leaves the monitor. <em>Signal and Continue</em> (Mesa semantics): P continues execution, and Q waits until P leaves the monitor. Java uses Signal and Continue.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Applications in Java and Pthreads */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">3. Language Integrations</h2>

        <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
          Monitors are not just theoretical constructs; they are heavily utilized in modern programming language runtimes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Java Implementation */}
          <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl h-full">
            <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
              <span>Java Monitors</span>
              <span>Implicit Object Synchronization</span>
            </div>
            <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed h-full">
              <p className="text-zinc-400 text-xs font-sans mb-4">Every object in Java has a single, intrinsic lock associated with it. Utilizing the <code className="text-blue-400">synchronized</code> keyword guarantees mutual exclusion.</p>
              <pre className="text-zinc-300">
                <span className="text-blue-400">public class</span> <span className="text-yellow-300">SafeQueue</span> {"{"}<br />
                <span className="text-blue-400 pl-4">private boolean</span> available = <span className="text-orange-400">false</span>;<br />
                <br />
                <span className="text-blue-400 pl-4">public</span> <span className="text-blue-400">synchronized void</span> <span className="text-yellow-300">insert</span>() {"{"}<br />
                <span className="text-pink-400 pl-8">while</span> (available) {"{"}<br />
                <span className="text-zinc-500 pl-12">/* Release monitor, sleep */</span><br />
                <span className="pl-12">try {"{"} <span className="text-yellow-300">wait</span>(); {"}"}</span><br />
                <span className="pl-12">catch (InterruptedException e) {"{}"}</span><br />
                <span className="pl-8">{"}"}</span><br />
                <span className="pl-8 text-zinc-500">/* CRITICAL SECTION */</span><br />
                <span className="pl-8">available = <span className="text-orange-400">true</span>;</span><br />
                <span className="pl-8 text-zinc-500">/* Wake up waiting threads */</span><br />
                <span className="pl-8"><span className="text-yellow-300">notifyAll</span>();</span><br />
                <span className="pl-4">{"}"}</span><br />
                {"}"}
              </pre>
            </div>
          </div>

          {/* POSIX Pthreads Implementation */}
          <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl h-full">
            <div className="bg-[#161b22] px-4 py-2 border-b border-zinc-800 flex justify-between items-center text-xs font-mono text-zinc-400">
              <span>POSIX Pthreads</span>
              <span>Explicit Synchronization</span>
            </div>
            <div className="p-6 overflow-x-auto text-xs font-mono leading-relaxed h-full">
              <p className="text-zinc-400 font-sans mb-4">Pthreads provides condition variables explicitly using the <code className="text-blue-400">pthread_cond_t</code> data type.</p>
              <pre className="text-zinc-300">
                <span className="text-blue-400">pthread_mutex_t</span> mutex;<br />
                <span className="text-blue-400">pthread_cond_t</span> cond_var;<br />
                <br />
                <span className="text-blue-400">void</span> <span className="text-yellow-300">thread_waiter</span>() {"{"}<br />
                <span className="pl-4"><span className="text-yellow-300">pthread_mutex_lock</span>(&mutex);</span><br />
                <span className="text-pink-400 pl-4">while</span> (a != b) {"{"}<br />
                <span className="text-zinc-500 pl-8">/* Atomically unlocks mutex & sleeps. */</span><br />
                <span className="text-zinc-500 pl-8">/* Upon waking, re-locks the mutex! */</span><br />
                <span className="pl-8"><span className="text-yellow-300">pthread_cond_wait</span>(&cond_var, &mutex);</span><br />
                <span className="pl-4">{"}"}</span><br />
                <span className="pl-4"><span className="text-yellow-300">pthread_mutex_unlock</span>(&mutex);</span><br />
                {"}"}<br />
                <br />
                <span className="text-blue-400">void</span> <span className="text-yellow-300">thread_signaler</span>() {"{"}<br />
                <span className="pl-4"><span className="text-yellow-300">pthread_mutex_lock</span>(&mutex);</span><br />
                <span className="pl-4">a = b;</span><br />
                <span className="pl-4"><span className="text-yellow-300">pthread_cond_signal</span>(&cond_var);</span><br />
                <span className="pl-4"><span className="text-yellow-300">pthread_mutex_unlock</span>(&mutex);</span><br />
                {"}"}
              </pre>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
