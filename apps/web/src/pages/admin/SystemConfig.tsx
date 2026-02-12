
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Settings, Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ConfigItem {
    key: string;
    value: string;
    description: string;
    updated_at: string;
}

export const SystemConfig = () => {
    const [config, setConfig] = useState<ConfigItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch Config
    const fetchConfig = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('app_config')
            .select('*')
            .order('key');

        if (error) {
            console.error('Error fetching config:', error);
            setMessage({ type: 'error', text: 'Failed to load configuration.' });
        } else {
            setConfig(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    // Handle Change
    const handleChange = (key: string, newValue: string) => {
        setConfig(prev => prev.map(item =>
            item.key === key ? { ...item, value: newValue } : item
        ));
    };

    // Save All
    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // Upsert all modified configs
            const updates = config.map(({ key, value }) => ({
                key,
                value,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('app_config')
                .upsert(updates);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Configuration saved successfully.' });

            // Re-fetch to confirm consistency
            await fetchConfig();

        } catch (err: unknown) {
            console.error('Save error:', err);
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save configuration.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading && config.length === 0) return <div className="p-8 text-green-500 font-mono animate-pulse">_loading_sys_config...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-green-500/10 p-2 rounded border border-green-500/20">
                        <Settings className="text-green-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wider">SYSTEM_CONFIG</h1>
                        <p className="text-zinc-500 text-xs font-mono">/etc/syscore/config.json</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchConfig} variant="ghost" size="sm">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </Button>
                    <Button onClick={handleSave} disabled={saving} variant="primary" size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        {saving ? <RefreshCw size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                        SAVE_CHANGES
                    </Button>
                </div>
            </div>

            {/* Message Bar */}
            {message && (
                <div className={`p-3 rounded border flex items-center gap-2 text-sm ${message.type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    {message.text}
                </div>
            )}

            {/* Config Grid */}
            <div className="grid gap-4">
                {config.map((item) => (
                    <div key={item.key} className="bg-zinc-900/50 border border-zinc-800 rounded p-4 hover:border-zinc-700 transition-colors">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Key Info */}
                            <div className="md:w-1/3 space-y-1">
                                <div className="font-mono text-green-500 font-bold text-sm break-all">{item.key}</div>
                                <div className="text-xs text-zinc-500">{item.description}</div>
                                <div className="text-[10px] text-zinc-700 pt-1">Last Update: {new Date(item.updated_at).toLocaleString()}</div>
                            </div>

                            {/* Value Input */}
                            <div className="md:w-2/3">
                                {item.key === 'system_status' ? (
                                    <select
                                        value={item.value}
                                        onChange={(e) => handleChange(item.key, e.target.value)}
                                        className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white font-mono text-sm focus:border-green-500 focus:outline-none"
                                    >
                                        <option value="ONLINE">ONLINE</option>
                                        <option value="MAINTENANCE">MAINTENANCE</option>
                                        <option value="OFFLINE">OFFLINE</option>
                                    </select>
                                ) : (
                                    <textarea
                                        value={item.value}
                                        onChange={(e) => handleChange(item.key, e.target.value)}
                                        rows={item.value.length > 50 ? 3 : 1}
                                        className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white font-mono text-sm focus:border-green-500 focus:outline-none resize-none"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {config.length === 0 && !loading && (
                <div className="text-center py-12 text-zinc-600 border border-dashed border-zinc-800 rounded">
                    NO_CONFIG_ENTRIES_FOUND
                </div>
            )}
        </div>
    );
};
