import React from 'react';

export const WikiSecurity = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-fade-in text-zinc-300 pb-20">
      {/* Header Section */}
      <div className="border-b border-zinc-800 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-mono rounded-full border border-rose-500/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          CS 401: SYSTEM SECURITY
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-tight">
          Protection & Security
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed font-light">
          An examination of internal OS protection mechanisms (Access Matrix), external threats (Buffer Overflows), and fundamental cryptographic architectures.
        </p>
      </div>

      {/* Section 1: Internal Protection Models */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">1. The Access Matrix Model</h2>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          <strong>Protection</strong> refers to mechanisms that control the access of programs, processes, or users to the resources defined by a computer system. The model of protection can be viewed abstractly as a matrix.
        </p>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead className="bg-[#161b22] text-zinc-300 font-mono">
                <tr>
                  <th className="p-4 border-b border-r border-zinc-800">Domain / Object</th>
                  <th className="p-4 border-b border-zinc-800"><code className="text-blue-400">File 1</code></th>
                  <th className="p-4 border-b border-zinc-800"><code className="text-teal-400">File 2</code></th>
                  <th className="p-4 border-b border-zinc-800"><code className="text-yellow-400">File 3</code></th>
                  <th className="p-4 border-b border-zinc-800"><code className="text-rose-400">Printer_A</code></th>
                </tr>
              </thead>
              <tbody className="text-zinc-500 font-mono">
                <tr className="border-b border-zinc-800/50">
                  <td className="p-4 border-r border-zinc-800 text-zinc-300 font-bold bg-[#161b22]">Domain 1 (User A)</td>
                  <td className="p-4">read</td>
                  <td className="p-4"></td>
                  <td className="p-4">read</td>
                  <td className="p-4"></td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="p-4 border-r border-zinc-800 text-zinc-300 font-bold bg-[#161b22]">Domain 2 (User B)</td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4">print</td>
                </tr>
                <tr className="border-b border-zinc-800/50">
                  <td className="p-4 border-r border-zinc-800 text-zinc-300 font-bold bg-[#161b22]">Domain 3 (System)</td>
                  <td className="p-4">read</td>
                  <td className="p-4">execute</td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                </tr>
                <tr>
                  <td className="p-4 border-r border-zinc-800 text-zinc-300 font-bold bg-[#161b22]">Domain 4 (Admin)</td>
                  <td className="p-4">read, write</td>
                  <td className="p-4">read, write</td>
                  <td className="p-4">read, write</td>
                  <td className="p-4">print</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-black p-4 text-xs text-zinc-400 border-t border-zinc-800 border-l-4 border-l-rose-500">
            <strong>Implementation Reality:</strong> A global Matrix is too sparse to store efficiently in memory. Most OSes (like UNIX) store the matrix by columns, attached to the objects themselves. This is called an <strong>Access Control List (ACL)</strong>.
          </div>
        </div>
      </section>

      {/* Section 2: Program Threats */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <h2 className="text-3xl font-bold text-zinc-100">2. Programmatic Threats</h2>
          <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded font-mono text-xs">VULNERABILITIES</span>
        </div>

        <p className="text-lg text-zinc-400 leading-relaxed mb-6">
          While <em>Protection</em> handles internal authorization, <em>Security</em> deals with external malice. The most famous, devastating, and historically common attack vector in all of computer science is the Buffer Overflow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="bg-[#0d1117] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl h-full flex flex-col">
            <div className="bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#2b1116] px-4 py-3 border-b border-red-900/50">
              <h4 className="text-red-400 font-mono font-bold tracking-widest text-sm flex items-center gap-2">Buffer Overflow Attack</h4>
            </div>
            <div className="p-6 text-sm text-zinc-400 space-y-4 flex-1">
              <p>
                Occurs in languages like C/C++ which lack automatic bounds checking. A programmer creates a buffer of 100 bytes on the stack. An attacker intentionally sends 150 bytes of data.
              </p>
              <p className="text-zinc-300 font-bold">The Anatomy of the Exploit:</p>
              <ul className="space-y-2 font-mono text-xs bg-black p-4 rounded border border-red-900/30 text-rose-200">
                <li>1. Attack payload fills the 100-byte buffer.</li>
                <li>2. The extra 50 bytes spill into adjacent memory.</li>
                <li>3. The payload is meticulously crafted so that the overflowing bytes overwrite the CPU's <code className="text-red-400 bg-red-400/10 px-1 rounded">Return Address Pointer</code> stored on the stack.</li>
                <li>4. The pointer is overwritten to point to malicious assembly code injected in the first 100 bytes.</li>
                <li>5. When the function returns, the CPU blindly jumps to the attacker's code and executes it with admin privileges.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6 flex flex-col justify-center">
            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl">
              <h4 className="font-bold text-zinc-200 mb-2 border-b border-zinc-800 pb-2">Defense 1: ASLR</h4>
              <p className="text-sm text-zinc-400">
                <strong>Address Space Layout Randomization:</strong> The OS randomly scrambles the memory locations of the stack, heap, and libraries every time a program executes. The attacker can no longer hardcode the new Return Address because they don't know where their injected code is located in RAM.
              </p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl">
              <h4 className="font-bold text-zinc-200 mb-2 border-b border-zinc-800 pb-2">Defense 2: DEP / NX Bit</h4>
              <p className="text-sm text-zinc-400">
                <strong>Data Execution Prevention:</strong> The CPU natively supports a No-Execute (NX) bit on memory pages. The OS marks the Stack and Heap pages as non-executable. If the CPU tries to run the attacker's injected code on the stack, the hardware throws a fatal exception.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Cryptography */}
      <section className="space-y-8 pt-8 mt-12 border-t border-zinc-900">
        <h2 className="text-3xl font-bold text-zinc-100 border-b border-zinc-800/50 pb-4">3. Applied Cryptography</h2>

        <p className="text-lg text-zinc-400 leading-relaxed max-w-4xl mb-6">
          In a distributed environment, operating systems must rely on cryptography to securely send data over insecure channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Symmetric */}
          <div className="bg-black border border-zinc-800 p-6 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.02)]">
            <div className="text-center mb-6">
              <div className="text-2xl font-black text-blue-400 mb-1 border-b border-blue-500/20 pb-2">Symmetric Encryption</div>
              <div className="text-xs font-mono text-zinc-500">AES-256</div>
            </div>
            <div className="space-y-4 text-sm text-zinc-400">
              <p>Uses the <strong>exact same key</strong> to encrypt and decrypt the message. It is mathematically very fast and used for bulk data encryption (e.g., encrypting a 1TB hard drive).</p>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded text-center">
                <code className="text-blue-300 font-bold">$E_k(M) = C$</code><br />
                <code className="text-blue-300 font-bold">$D_k(C) = M$</code>
              </div>
              <p className="text-xs italic text-zinc-500">The primary flaw is Key Distribution: How do Alice and Bob securely share the secret key without Eve intercepting it?</p>
            </div>
          </div>

          {/* Asymmetric */}
          <div className="bg-black border border-zinc-800 p-6 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.02)]">
            <div className="text-center mb-6">
              <div className="text-2xl font-black text-purple-400 mb-1 border-b border-purple-500/20 pb-2">Asymmetric Encryption</div>
              <div className="text-xs font-mono text-zinc-500">RSA / Elliptic Curve</div>
            </div>
            <div className="space-y-4 text-sm text-zinc-400">
              <p>Uses a mathematical <strong>key pair</strong>. Data encrypted with the Public Key can ONLY be decrypted by the associated Private Key (and vice versa). Solves the Key Distribution problem.</p>
              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded text-center">
                <code className="text-purple-300 font-bold">{`$E_{K_{public}}(M) = C$`}</code><br />
                <code className="text-purple-300 font-bold">{`$D_{K_{private}}(C) = M$`}</code>
              </div>
              <p className="text-xs italic text-zinc-500">The primary flaw is Speed: It is computationally heavy. Used only to securely establish the connection and exchange the Symmetric key.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
