
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Table, Folder } from 'lucide-react';

export const DatabaseExplorer = () => {
    const [_tables, _setTables] = useState(['user_feedback', 'featured_reviews', 'admin_whitelist']);
    const tables = ['user_feedback', 'featured_reviews', 'admin_whitelist'];
    const [selectedTable, setSelectedTable] = useState('user_feedback');
    const [data, setData] = useState<Record<string, unknown>[]>([]);

    const fetchTableData = useCallback(async (table: string) => {
        const { data } = await supabase.from(table).select('*').limit(50);
        if (data) setData(data);
    }, []);

    useEffect(() => {
        const load = async () => {
            await fetchTableData(selectedTable);
        };
        load();
    }, [selectedTable, fetchTableData]);

    return (
        <div className="flex h-[calc(100vh-100px)] border border-zinc-800 rounded bg-zinc-950">
            {/* Sidebar Tables */}
            <div className="w-64 border-r border-zinc-800 bg-zinc-900/30 p-4">
                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-4">public_schema</h3>
                <div className="space-y-1">
                    {tables.map(table => (
                        <button
                            key={table}
                            onClick={() => setSelectedTable(table)}
                            className={`w-full text-left px-3 py-2 rounded text-sm font-mono flex items-center gap-2 ${selectedTable === table ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-zinc-400 hover:bg-zinc-800'
                                }`}
                        >
                            <Table size={14} />
                            {table}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data View */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-mono">
                        <Folder size={16} className="text-zinc-500" />
                        <span className="text-zinc-500">/</span>
                        <span>{selectedTable}</span>
                    </div>
                    <div className="text-xs text-zinc-500">{data.length} records</div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    <div className="bg-black border border-zinc-800 rounded overflow-hidden">
                        <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-zinc-900 text-zinc-500 border-b border-zinc-800">
                                <tr>
                                    {data.length > 0 && Object.keys(data[0]).map(key => (
                                        <th key={key} className="px-4 py-2 border-r border-zinc-800 last:border-r-0 whitespace-nowrap">
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {data.map((row, i) => (
                                    <tr key={i} className="hover:bg-zinc-900/30">
                                        {Object.values(row).map((val: unknown, j) => (
                                            <td key={j} className="px-4 py-2 border-r border-zinc-800 last:border-r-0 whitespace-nowrap text-zinc-400 truncate max-w-[200px]">
                                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.length === 0 && (
                            <div className="p-8 text-center text-zinc-500">_empty_set</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
