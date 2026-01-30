import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Star, Trash2, Mail, User, Clock, Monitor } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { TerminalModal } from '../../components/ui/TerminalModal';

export const Inbox = () => {
    const [loading, setLoading] = useState(true);
    const [threads, setThreads] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Modal State
    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'danger';
        onConfirm?: () => void;
    }>({ isOpen: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        fetchInbox();
    }, []);

    const fetchInbox = async () => {
        const { data } = await supabase
            .from('user_feedback')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) {
            setThreads(data);
            if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
        }
        setLoading(false);
    };

    const confirmDelete = (id: string) => {
        setModal({
            isOpen: true,
            title: 'CONFIRM_DELETION',
            message: 'Are you sure you want to permanently delete this thread? This action cannot be reversed.',
            type: 'danger',
            onConfirm: () => executeDelete(id)
        });
    };

    const executeDelete = async (id: string) => {
        await supabase.from('user_feedback').delete().eq('id', id);
        setThreads(prev => prev.filter(t => t.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const handleFeature = async (item: any) => {
        await supabase.from('featured_reviews').insert([{
            message: item.message,
            name: item.name || 'Anonymous',
            role: 'Verified User'
        }]);
        setModal({
            isOpen: true,
            title: 'ACTION_SUCCESS',
            message: 'Feedback has been promoted to the public Featured Reviews list.',
            type: 'info',
            onConfirm: undefined // Just a closeable alert
        });
    };

    const activeThread = threads.find(t => t.id === selectedId);

    if (loading) return <div>_loading_stream...</div>;

    return (
        <>
            <div className="flex h-[calc(100vh-100px)] border border-zinc-800 rounded bg-zinc-950">
                {/* Thread List */}
                <div className="w-1/3 border-r border-zinc-800 overflow-y-auto">
                    {threads.map(thread => (
                        <div
                            key={thread.id}
                            onClick={() => setSelectedId(thread.id)}
                            className={`p-4 border-b border-zinc-900 cursor-pointer hover:bg-zinc-900/50 transition-colors ${selectedId === thread.id ? 'bg-green-500/10 border-l-2 border-l-green-500' : 'border-l-2 border-l-transparent'
                                }`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-white text-sm truncate">{thread.name || 'Anonymous'}</span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                    {new Date(thread.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="text-zinc-500 text-xs truncate font-mono">
                                {thread.message}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Thread Details */}
                <div className="flex-1 flex flex-col bg-black/50">
                    {activeThread ? (
                        <>
                            <div className="p-6 border-b border-zinc-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl text-white font-bold mb-1">{activeThread.name || 'Anonymous User'}</h2>
                                        <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
                                            <span className="flex items-center gap-1"><Mail size={12} /> {activeThread.email || 'N/A'}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(activeThread.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleFeature(activeThread)} className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50">
                                            <Star size={14} className="mr-1" /> PROMOTE
                                        </Button>
                                        <Button size="sm" onClick={() => confirmDelete(activeThread.id)} className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50">
                                            <Trash2 size={14} className="mr-1" /> DELETE
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-zinc-900 p-2 rounded text-xs text-zinc-500 font-mono flex items-center gap-2">
                                    <Monitor size={12} />
                                    UA: {activeThread.user_agent}
                                </div>
                            </div>
                            <div className="flex-1 p-6 overflow-y-auto">
                                <div className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                    &gt; {activeThread.message}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-zinc-600 font-mono">
                            _select_thread_to_view
                        </div>
                    )}
                </div>
            </div>

            <TerminalModal
                isOpen={modal.isOpen}
                onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </>
    );
};
