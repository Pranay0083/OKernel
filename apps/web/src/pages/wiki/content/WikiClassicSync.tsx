import React from 'react';

export const WikiClassicSync = () => {
  return (
    <div className="max-w-4xl space-y-16 animate-fade-in text-zinc-300 pb-20">
      {/* Title Section */}
      <div className="border-b border-zinc-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 text-xs font-mono rounded-full border border-red-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          CLASSIC PROBLEMS
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
          Dining Philosophers
        </h1>
        <p className="text-2xl text-zinc-400 leading-relaxed font-light">
          How do we test if our Lock systems actually work? We test them against a famous thought experiment invented by Edsger Dijkstra in 1965. It perfectly illustrates how easily a computer can freeze entirely if you aren't careful.
        </p>
      </div>

      {/* The Setup */}
      <section className="space-y-6 pt-6">
        <div className="bg-zinc-900/40 p-8 rounded-2xl border border-zinc-800 relative z-10">
          <h2 className="text-3xl font-bold text-zinc-100 mb-6">The Dinner Party</h2>

          <div className="text-lg text-zinc-400 space-y-4 leading-relaxed mb-8">
            <p>Imagine 5 friends (philosophers) sitting around a circular dinner table. In the center of the table is a massive bowl of spaghetti.</p>
            <p>There are exactly <strong>5 forks</strong> placed on the table—one placed physically between each person.</p>
            <div className="bg-black border border-zinc-800 p-6 rounded-xl my-6 mx-auto max-w-lg shadow-[0_0_50px_rgba(0,0,0,1)]">
              <div className="text-red-400 font-bold text-xl mb-2 text-center underline decoration-red-500/30 underline-offset-4">THE ONLY RULE</div>
              <p className="text-zinc-300 text-center text-sm leading-relaxed">
                Because the spaghetti is so slippery, you absolutely <strong>must hold TWO forks</strong> (your left fork and your right fork) simultaneously in order to eat anything.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 font-mono text-sm max-w-2xl mx-auto">
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded text-blue-400 text-center shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <span className="opacity-50 text-[10px] block mb-1 tracking-widest uppercase">Computer Science Translation:</span>
              Philosopher = A Running App (Thread)
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded text-purple-400 text-center shadow-[0_0_20px_rgba(168,85,247,0.1)]">
              <span className="opacity-50 text-[10px] block mb-1 tracking-widest uppercase">Computer Science Translation:</span>
              Fork = A Database or File Lock (Mutex)
            </div>
          </div>
        </div>

      </section>

      {/* The Disaster */}
      <section className="space-y-8 pt-16">
        <h2 className="text-4xl font-bold text-zinc-100 uppercase tracking-widest text-center mb-10 border-y py-4 border-zinc-800/50">The Fatal Disaster (Deadlock)</h2>

        <p className="text-lg text-zinc-400 mb-8 max-w-3xl mx-auto text-center leading-relaxed">
          Let's assume every philosopher uses the exact same, "fair" logic:<br />
          <em>"I will grab the fork on my left. Then I will grab the fork on my right. If someone else is holding a fork I need, I will sit here and wait patiently forever."</em>
        </p>

        <div className="bg-red-500/5 border-[2px] border-red-500/20 p-8 md:p-12 rounded-2xl relative shadow-[0_0_100px_rgba(239,68,68,0.05)] overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-red-500/10 font-black text-9xl leading-none select-none hidden md:block">!!!</div>

          <h3 className="text-2xl font-bold text-red-400 mb-6 relative z-10">The Instant Death Scenario</h3>

          <div className="space-y-6 text-zinc-400 text-lg relative z-10">
            <p>At 7:00:00 PM exactly, all 5 friends become hungry simultaneously.</p>

            <div className="bg-black/50 p-6 rounded-xl border border-red-500/30 font-mono text-base">
              <p className="text-zinc-300">1. All 5 friends simultaneously pick up the fork on their LEFT.</p>
              <p className="text-red-400/80 mt-2 block pl-4 italic">Success! All 5 left hands are holding a fork. There are 0 forks remaining on the table.</p>

              <p className="text-zinc-300 mt-6">2. All 5 friends simultaneously reach for the fork on their RIGHT.</p>
              <p className="font-bold text-red-400 mt-2 block pl-4 underline decoration-red-500/30 underline-offset-4">BUT EVERY RIGHT FORK IS ALREADY IN SOMEONE ELSE'S LEFT HAND!</p>
            </div>

            <p className="leading-relaxed">
              Because they are perfectly polite, no one will physically rip a fork out of their neighbor's hand. Because of their rule logic, no one will drop the single fork they already hold.
            </p>
            <p className="font-bold text-xl text-red-500 bg-red-500/10 p-4 border border-red-500/20 rounded inline-block">
              They sit there forever. They literally starve to death staring at the spaghetti. In OS terms, your entire laptop freezes permanently and must be force-restarted. This is a DEADLOCK.
            </p>
          </div>
        </div>

      </section>

      {/* Solutions */}
      <section className="space-y-8 pt-16">
        <h2 className="text-4xl font-bold text-zinc-100 flex items-center gap-4">
          How to Fix It
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm">
          {/* Solution 1: Asymmetry */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl relative">
            <div className="absolute top-0 right-0 p-4 opacity-50 text-blue-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h4 className="font-bold text-2xl text-blue-400 mb-4 border-b border-zinc-800 pb-2">1. The Rebel</h4>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Tell Philosopher #5 to be a "rebel" and grab his RIGHT fork first, instead of his left.
            </p>
            <div className="bg-black p-4 rounded border border-zinc-800 text-zinc-500 italic mt-auto">
              <strong>Why it works:</strong> It breaks the perfect symmetry! If P5 reaches for his right, he is reaching for the same fork P1's left hand wants. One of them wins, one loses. The circle is broken, and life goes on.
            </div>
          </div>

          {/* Solution 2: Capacity limit */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl relative">
            <div className="absolute top-0 right-0 p-4 opacity-50 text-green-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h4 className="font-bold text-2xl text-green-400 mb-4 border-b border-zinc-800 pb-2">2. The Bouncer (Semaphore)</h4>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Place a bouncer outside the dining room. He only lets a maximum of 4 people into the 5-seat room.
            </p>
            <div className="bg-black p-4 rounded border border-zinc-800 text-zinc-500 italic mt-auto">
              <strong>Why it works:</strong> The Pigeonhole Principle! If there are 5 forks on the table, and only 4 people allowed inside, there is an absolute mathematical guarantee that at least one person will be able to acquire 2 forks.
            </div>
          </div>
        </div>
      </section>

      {/* Monitors (The High Level Abstraction) */}
      <section className="space-y-8 pt-16 border-t border-zinc-900">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <h2 className="text-4xl font-bold text-zinc-100 italic">"Just do it for me!"</h2>
          <p className="text-2xl text-purple-400 font-bold uppercase tracking-widest mt-2">Monitors</p>
          <p className="text-lg text-zinc-400 mt-6 leading-relaxed">
            Writing <code>wait()</code> and <code>signal()</code> code perfectly is like trying to juggle knives while riding a unicycle. If you forget to signal a lock just ONE time, your entire application permanently dies. What if the compiler could just do it for you automatically?
          </p>
        </div>

        <div className="bg-purple-500/5 p-10 rounded-2xl border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.05)]">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold text-zinc-200">The "Smart Room"</h3>
              <p className="text-zinc-400 leading-relaxed">
                A Monitor is an Object-Oriented feature built specifically into languages like Java and C#. You wrap your data in a special class, and add the keyword <code>synchronized</code> to your methods.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                <strong>The Magic:</strong> The compiler automatically surrounds the entire object with an invisible forcefield. When Thread 1 calls a method, it locks the door behind it. When Thread 2 tries to call a method, the compiler sees the door is locked, and automatically forces Thread 2 to sleep until Thread 1 leaves. You never write a single line of lock code.
              </p>
            </div>

            <div className="bg-black p-6 rounded-xl border border-zinc-800 font-mono text-xs w-full md:w-[350px]">
              <span className="text-zinc-500 mb-4 block border-b border-zinc-800 pb-2">// How Java does it instantly</span>
              <div className="text-zinc-300">
                <div><span className="text-purple-400">class</span> <span className="text-yellow-400">CoffeeMachine</span> {"{"}</div>
                <div className="pl-4 mt-2">
                  <span className="text-zinc-500">// Magic word! Invisible Lock!</span><br />
                  <span className="text-blue-400">public</span> <span className="text-red-400 font-bold">synchronized</span> <span className="text-blue-400">void</span> makeCoffee() {"{"}<br />
                  <div className="pl-4 text-green-400/80">
                                        // 100% safe from race conditions<br />
                    water -= 1;<br />
                    beans -= 1;<br />
                  </div>
                  {"}"}
                </div>
                <div className="mt-2">{"}"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
