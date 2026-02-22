import React from 'react';

export const WikiDistributed = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
      {/* Header Section */}
      <div className="border-b border-zinc-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono rounded-full border border-emerald-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          CS 401: DISTRIBUTED SYSTEMS
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
          Distributed Consensus
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed font-light">
          The theoretical limits of networked computing: The CAP Theorem, Byzantine Faults, and the algorithmic logic behind Paxos and Raft consensus protocols.
        </p>
      </div>

      {/* Section 1: The CAP Theorem */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. The CAP Theorem</h2>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          In 2000, Eric Brewer posed a conjecture regarding distributed data systems, which was mathematically proven two years later. Known as the CAP Theorem, it dictates that any distributed system can only provide TWO of the following three guarantees simultaneously.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(16,185,129,0.03)]">
            <h3 className="text-xl font-bold text-blue-400 mb-2 font-mono uppercase tracking-widest border-b border-blue-500/30 pb-2">Consistency</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Every read receives the most recent write, or an error. In a consistent system, if Node $A$ updates value $X=5$, a subsequent read from Node $B$ must immediately return $5$.
            </p>
          </div>

          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(16,185,129,0.03)]">
            <h3 className="text-xl font-bold text-green-400 mb-2 font-mono uppercase tracking-widest border-b border-green-500/30 pb-2">Availability</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Every request receives a (non-error) response, without the guarantee that it contains the most recent write. The system must stay up, even if the data returned is stale.
            </p>
          </div>

          <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800 shadow-[0_0_30px_rgba(16,185,129,0.03)]">
            <h3 className="text-xl font-bold text-red-400 mb-2 font-mono uppercase tracking-widest border-b border-red-500/30 pb-2">Partition Tolerance</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              The system continues to operate despite an arbitrary number of messages being dropped (or delayed) by the network between nodes.
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-black border border-zinc-800 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-blue-500 via-green-500 to-red-500"></div>
          <h4 className="font-bold text-zinc-200 mb-2 text-lg">The Cruel Reality of Networking</h4>
          <p className="text-sm text-zinc-400 max-w-3xl">
            Because network failures (Partitions) are essentially unavoidable in the physical world, a distributed system MUST choose to support Partition Tolerance. Therefore, when a network partition occurs, engineers must decide between the remaining two: System <strong className="text-blue-400">Consistency</strong> (cancel the operation, resulting in an error/downtime) or System <strong className="text-green-400">Availability</strong> (return the stale data).
          </p>
        </div>
      </section>

      {/* Section 2: Consensus & Paxos */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <h2 className="text-3xl font-bold text-zinc-100">2. The Consensus Problem (Paxos)</h2>
          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded font-mono text-xs">LESLIE LAMPORT (1989)</span>
        </div>

        <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
          How do we get a cluster of unreliable machines (that might crash, reboot, or lose messages) to completely agree on a single value? This is the Distributed Consensus problem. <strong>Paxos</strong> is the oldest and most mathematically rigorous solution.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl h-full flex flex-col">
            <div className="bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-[#091512] px-4 py-3 border-b border-emerald-900/50">
              <h4 className="text-emerald-400 font-mono font-bold tracking-widest text-sm flex items-center gap-2">Paxos Roles</h4>
            </div>
            <div className="p-6 text-sm text-zinc-400 flex-1">
              <ul className="space-y-4 font-mono text-xs">
                <li>
                  <strong className="text-zinc-200 block mb-1 text-sm bg-black p-1 border border-zinc-800 rounded inline-block">Proposer:</strong>
                  Advocates a client request, attempting to convince the Acceptors to agree on it.
                </li>
                <li>
                  <strong className="text-zinc-200 block mb-1 text-sm bg-black p-1 border border-zinc-800 rounded inline-block">Acceptor:</strong>
                  The "Voters." They listen to Proposers and vote. If a majority (quorum) of Acceptors agree, the value is chosen.
                </li>
                <li>
                  <strong className="text-zinc-200 block mb-1 text-sm bg-black p-1 border border-zinc-800 rounded inline-block">Learner:</strong>
                  Nodes that simply wait to find out what value the Acceptors ultimately agreed upon.
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl h-full flex flex-col">
            <div className="bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-[#091512] px-4 py-3 border-b border-emerald-900/50">
              <h4 className="text-emerald-400 font-mono font-bold tracking-widest text-sm flex items-center gap-2">The Two-Phase Protocol</h4>
            </div>
            <div className="p-6 text-sm text-zinc-400 space-y-4 flex-1">
              <p className="border-l-2 border-emerald-500 pl-3"><strong>Phase 1: Prepare & Promise.</strong><br />
                A Proposer generates a unique, sequentially increasing proposal number ($N$). It sends a `Prepare(N)` request to a quorum of Acceptors. If $N$ is higher than any previous proposal number the Acceptor has seen, it returns a `Promise(N, previous_value)`, promising to ignore all future proposals less than $N$.</p>

              <p className="border-l-2 border-teal-500 pl-3"><strong>Phase 2: Accept & Learn.</strong><br />
                If the Proposer receives Promises from a majority, it sends an `AcceptRequest(N, Value)` to the same quorum. If an Acceptor receives this request and hasn't already promised to a higher $N$, it accepts it. Consensus is achieved.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Raft */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900 border-dashed">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <h2 className="text-3xl font-bold text-zinc-100">3. Raft Algorithm</h2>
          <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1 rounded font-mono text-xs">INDUSTRY STANDARD (2013)</span>
        </div>

        <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
          Paxos is famously difficult to understand and even harder to implement correctly. In response, researchers created <strong>Raft</strong>, which explicitly prioritizes comprehensibility while providing the exact same fault-tolerance. Raft relies entirely on strong Leadership.
        </p>

        <div className="flex flex-col lg:flex-row gap-8 items-center mt-8">
          <div className="w-full lg:w-1/3 bg-black p-6 rounded-xl border border-teal-500/30 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">👑</div>
            <h4 className="text-2xl font-bold text-teal-400 mb-4">Leader Election</h4>
            <p className="text-sm text-zinc-400 mb-4 text-left">
              All nodes start as <strong>Followers</strong>. If a Follower receives no heartbeat from a Leader before its randomized timeout fires, it becomes a <strong>Candidate</strong> and requests votes.
            </p>
            <p className="text-sm text-zinc-400 text-left">
              The Candidate that receives a majority of votes becomes the single absolute <strong>Leader</strong>. The Leader continuously sends heartbeat messages to maintain authority.
            </p>
          </div>

          <div className="w-full lg:w-2/3 bg-black p-6 rounded-xl border border-zinc-800">
            <h4 className="text-xl font-bold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">Log Replication</h4>
            <ol className="text-sm text-zinc-400 space-y-4 list-decimal list-inside font-mono">
              <li><strong className="text-teal-300">Client Request:</strong> A client sends a change to the Leader.</li>
              <li><strong className="text-teal-300">Append Entries:</strong> The Leader appends the request to its log, then sends `AppendEntries` RPCs to all followers.</li>
              <li><strong className="text-teal-300">Acknowledgment:</strong> Followers append the entry to their own logs and return acknowledgments to the Leader.</li>
              <li><strong className="text-teal-300">Commitment:</strong> Once the Leader receives ACK from a majority of nodes, it formally applies the change to its state machine (commits) and replies to the client.</li>
              <li><strong className="text-teal-300">Finality:</strong> The Leader notifies the Followers via the next heartbeat that the entry is committed, and they apply it to their state machines.</li>
            </ol>
          </div>
        </div>
      </section>

    </div>
  );
};
