
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Play, Eraser, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SQLEditor = () => {
    const [query, setQuery] = useState('SELECT * FROM user_feedback LIMIT 5;');
    const [result, setResult] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const runQuery = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        // Remove trailing semicolon if present, as it breaks the subquery wrapper
        const cleanQuery = query.trim().replace(/;$/, '');
        const { data, error: rpcError } = await supabase.rpc('exec_sql', { query: cleanQuery });

        if (rpcError) {
            setError(rpcError.message);
        } else if (data && data.error) {
            setError(data.error);
        } else {
            setResult(data);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
            {/* Editor */}
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded flex flex-col">
                <div className="p-2 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <span className="text-xs font-mono text-zinc-400">QUERY_EDITOR</span>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => setQuery('')} variant="ghost" className="text-zinc-500 hover:text-white">
                            <Eraser size={14} className="mr-1" /> CLEAR
                        </Button>
                        <Button size="sm" onClick={runQuery} disabled={loading} className="bg-green-600 hover:bg-green-500 text-black font-bold">
                            <Play size={14} className="mr-1" /> {loading ? 'EXECUTING...' : 'RUN'}
                        </Button>
                    </div>
                </div>
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-black p-4 font-mono text-sm text-green-400 focus:outline-none resize-none"
                    spellCheck={false}
                />
            </div>

            {/* Results */}
            <div className="h-1/2 bg-zinc-950 border border-zinc-800 rounded flex flex-col overflow-hidden">
                <div className="p-2 border-b border-zinc-800 bg-zinc-900/50 text-xs font-mono text-zinc-400">
                    OUTPUT_CONSOLE
                </div>
                <div className="flex-1 overflow-auto p-4 bg-black font-mono">
                    {error && (
                        <div className="text-red-500 flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5" />
                            <pre className="whitespace-pre-wrap">{error}</pre>
                        </div>
                    )}
                    {result && (
                        result.length > 0 ? (
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr>
                                        {Object.keys(result[0]).map(key => (
                                            <th key={key} className="border border-zinc-800 px-2 py-1 text-zinc-500 bg-zinc-900/50">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.map((row, i) => (
                                        <tr key={i}>
                                            {Object.values(row).map((val: any, j) => (
                                                <td key={j} className="border border-zinc-800 px-2 py-1 text-zinc-300">
                                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-zinc-500">_query_returned_0_rows</div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
