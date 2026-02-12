import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Terminal, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const PackagesDocs = () => {
    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-center">
                        <Package className="text-green-500" size={20} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">OKernel Packages</h1>
                        <p className="text-zinc-500 text-sm">Installable tools for local development</p>
                    </div>
                </div>
                <p className="text-zinc-400 text-lg max-w-3xl">
                    OKernel provides command-line tools that you can install locally to trace and visualize code execution without needing a browser.
                </p>
            </div>

            {/* Python Package */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Terminal size={20} className="text-green-500" />
                    okernel (Python)
                </h2>

                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-bold">Installation</div>
                            <div className="text-zinc-500 text-sm">Requires Python 3.8+</div>
                        </div>
                        <code className="px-4 py-2 bg-black rounded-lg text-green-400 font-mono">
                            pip install okernel
                        </code>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-800">
                        <div>
                            <div className="text-zinc-500 text-xs">Version</div>
                            <div className="text-white font-mono">0.2.0</div>
                        </div>
                        <div>
                            <div className="text-zinc-500 text-xs">Dependencies</div>
                            <div className="text-green-400 font-mono">Zero</div>
                        </div>
                        <div>
                            <div className="text-zinc-500 text-xs">License</div>
                            <div className="text-white font-mono">MIT</div>
                        </div>
                        <div>
                            <div className="text-zinc-500 text-xs">PyPI</div>
                            <a href="https://pypi.org/project/okernel/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-mono flex items-center gap-1">
                                View <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Basic Usage */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Basic Usage</h3>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                            example.py
                        </div>
                        <pre className="p-4 overflow-x-auto text-sm">
                            <code className="text-zinc-300 font-mono">{`import okernel

code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(10)
print(f"Fibonacci(10) = {result}")
"""

# Trace the code
trace = okernel.trace(code)

# Generate HTML visualization
trace.to_html("fibonacci_trace.html")

# Print summary
print(trace.summary())
# Output: 89 steps | Peak: 4.2KB | Duration: 1.2ms`}</code>
                        </pre>
                    </div>
                </div>

                {/* API Reference */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">API Reference</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <code className="text-green-400 font-mono">okernel.trace(code: str) -&gt; Trace</code>
                            <p className="text-zinc-400 text-sm mt-2">
                                Execute a code string and return a Trace object containing all execution events, memory stats, and timing information.
                            </p>
                        </div>

                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <code className="text-green-400 font-mono">Trace.to_html(path: str) -&gt; None</code>
                            <p className="text-zinc-400 text-sm mt-2">
                                Generate a self-contained HTML file with an interactive 3-panel visualizer showing code, stack/heap, and timeline.
                            </p>
                        </div>

                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <code className="text-green-400 font-mono">Trace.summary() -&gt; str</code>
                            <p className="text-zinc-400 text-sm mt-2">
                                Return a text summary of execution metrics including step count, peak memory, and total duration.
                            </p>
                        </div>

                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <code className="text-green-400 font-mono">Trace.to_json() -&gt; str</code>
                            <p className="text-zinc-400 text-sm mt-2">
                                Export trace data as JSON for custom processing or integration with other tools.
                            </p>
                        </div>

                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <code className="text-green-400 font-mono">Trace.events -&gt; List[Dict]</code>
                            <p className="text-zinc-400 text-sm mt-2">
                                Access the raw list of execution events including line changes, function calls, returns, and opcode costs.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                            <div className="text-white font-bold mb-2">Zero Dependencies</div>
                            <p className="text-zinc-500 text-sm">Built entirely on Python's standard library. No pip dependencies required.</p>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                            <div className="text-white font-bold mb-2">Memory Tracking</div>
                            <p className="text-zinc-500 text-sm">Track object allocation, sizes, and addresses. Peak memory usage reported.</p>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                            <div className="text-white font-bold mb-2">Hardware Cost Estimation</div>
                            <p className="text-zinc-500 text-sm">Each bytecode opcode is mapped to estimated hardware operations (ALU, MEM, etc).</p>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                            <div className="text-white font-bold mb-2">GC Callback Tracking</div>
                            <p className="text-zinc-500 text-sm">Garbage collection events are captured and displayed in the timeline.</p>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                            <div className="text-white font-bold mb-2">3-Panel Visualizer</div>
                            <p className="text-zinc-500 text-sm">Code view with line highlighting, Stack/Heap inspector, and Timeline with memory chart.</p>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                            <div className="text-white font-bold mb-2">Offline HTML Output</div>
                            <p className="text-zinc-500 text-sm">Generated HTML files are self-contained and work without internet access.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-white font-bold mb-1">More examples and the community poll</h3>
                    <p className="text-zinc-500 text-sm">See code examples and vote for which language OKernel should support next.</p>
                </div>
                <Link to="/packages">
                    <Button className="whitespace-nowrap">
                        View Packages Page <ArrowRight size={16} className="ml-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
};
