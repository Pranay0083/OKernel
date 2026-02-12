
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, GripVertical } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FeaturedReview {
    id: string;
    name: string;
    message: string;
    role?: string;
    rank?: number;
    created_at: string;
}

// --- Sortable Item Component ---
function SortableItem({ id, item, isSelected, onClick }: { id: string, item: FeaturedReview, isSelected: boolean, onClick: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-3 border-b border-zinc-800 flex items-center gap-2 group ${isSelected ? 'bg-green-500/10 border-l-2 border-l-green-500' : 'bg-transparent border-l-2 border-l-transparent'
                }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="text-zinc-600 cursor-grab hover:text-green-500 active:cursor-grabbing p-1"
            >
                <GripVertical size={14} />
            </div>

            <div className="flex-1 cursor-pointer min-w-0" onClick={onClick}>
                <div className="flex justify-between mb-1">
                    <span className="font-bold text-white text-xs truncate">{item.name}</span>
                    <div className="text-[10px] text-zinc-500 font-mono">
                        #{item.rank || '-'}
                    </div>
                </div>
                <div className="text-zinc-500 text-[10px] truncate font-mono">
                    "{item.message}"
                </div>
            </div>
        </div>
    );
}

export const FeaturedManager = () => {
    const [reviews, setReviews] = useState<FeaturedReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    // Command Mode
    const [commandMode, setCommandMode] = useState<{
        active: boolean; prompt: string; onConfirm: () => void; input: string;
    }>({ active: false, prompt: '', onConfirm: () => { }, input: '' });
    const inputRef = useRef<HTMLInputElement>(null);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));
    }, []);

    const fetchReviews = useCallback(async () => {
        const { data } = await supabase
            .from('featured_reviews')
            .select('*')
            .order('rank', { ascending: true }) // Order by RANK
            .order('created_at', { ascending: false }); // Fallback

        if (data) {
            setReviews(data);
            setSelectedId(prev => prev || (data.length > 0 ? data[0].id : null));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchReviews();
        };
        init();
    }, [fetchReviews]);

    useEffect(() => {
        if (commandMode.active && inputRef.current) inputRef.current.focus();
    }, [commandMode.active]);

    // --- Drag End Logic ---
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setReviews((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex); // Reorder locally immediately

                // Sync to DB
                syncOrderToDB(newOrder);
                return newOrder;
            });
        }
    };

    const syncOrderToDB = async (items: FeaturedReview[]) => {
        addLog('SYNCING_ORDER...');
        // Updates rank for ALL items. 
        // Note: For large lists this is inefficient. For a "Featured" list of <50 items, it's instant.
        const updates = items.map((item, index) => ({
            id: item.id,
            rank: index + 1 // 1-based rank
        }));

        for (const update of updates) {
            await supabase.from('featured_reviews').update({ rank: update.rank }).eq('id', update.id);
        }
        addLog('SYNC_COMPLETE [OK]');
    };

    // --- Deletion Logic ---
    const requestDelete = (id: string) => {
        setCommandMode({
            active: true,
            prompt: 'REMOVE_FROM_PUBLIC? [y/n]:',
            input: '',
            onConfirm: () => executeDelete(id)
        });
    };

    const executeDelete = async (id: string) => {
        addLog(`removing_review::${id}...`);
        const { error } = await supabase.from('featured_reviews').delete().eq('id', id);
        if (!error) {
            setReviews(prev => prev.filter(r => r.id !== id));
            if (selectedId === id) setSelectedId(null);
            addLog('REMOVAL_SUCCESSFUL');
        } else {
            addLog(`ERROR: ${error.message}`);
        }
    };

    // --- Input Handling ---
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!commandMode.active) return;
        if (e.key === 'Enter') {
            const val = commandMode.input.toLowerCase();
            if (val === 'y' || val === 'yes') commandMode.onConfirm();
            else addLog('ACTION_CANCELLED');
            setCommandMode(prev => ({ ...prev, active: false }));
        } else if (e.key === 'Escape') {
            setCommandMode(prev => ({ ...prev, active: false }));
            addLog('ACTION_CANCELLED');
        }
    };

    const activeReview = reviews.find(r => r.id === selectedId);

    if (loading) return <div className="p-8 text-green-500 font-mono">_loading_public_assets...</div>;

    return (
        <div className="flex h-[calc(100vh-100px)] border border-zinc-800 rounded bg-zinc-950 relative overflow-hidden">

            {/* Command Overlay */}
            {commandMode.active && (
                <div className="absolute inset-x-0 bottom-0 z-50 bg-black/90 border-t border-green-500 p-4 animate-in slide-in-from-bottom duration-200">
                    <div className="container mx-auto max-w-2xl flex items-center gap-2 font-mono text-lg">
                        <span className="text-green-500 font-bold">{commandMode.prompt}</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={commandMode.input}
                            onChange={(e) => setCommandMode(prev => ({ ...prev, input: e.target.value }))}
                            onKeyDown={handleKeyDown}
                            className="bg-transparent border-none outline-none text-white w-24 caret-green-500 uppercase"
                            autoFocus
                        />
                    </div>
                    <div className="text-xs text-zinc-500 mt-2 text-center font-mono">PRESS &lt;ENTER&gt; TO CONFIRM</div>
                </div>
            )}

            {/* Sortable List */}
            <div className="w-1/3 border-r border-zinc-800 bg-zinc-900/30 overflow-y-auto">
                <div className="p-3 border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase tracking-widest flex justify-between">
                    <span>Public_Rank ({reviews.length})</span>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={reviews.map(r => r.id)} strategy={verticalListSortingStrategy}>
                        {reviews.map(review => (
                            <SortableItem
                                key={review.id}
                                id={review.id}
                                item={review}
                                isSelected={selectedId === review.id}
                                onClick={() => setSelectedId(review.id)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>

            {/* Details View */}
            <div className="flex-1 flex flex-col bg-black/50">
                {activeReview ? (
                    <>
                        <div className="p-8 border-b border-zinc-800">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-3xl text-zinc-700 font-serif absolute -mt-4 -ml-4">"</div>
                                    <h2 className="text-xl text-white font-bold mb-1 relative z-10">{activeReview.name}</h2>
                                    <div className="text-xs text-green-500 font-mono">{activeReview.role || 'Verified User'}</div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => requestDelete(activeReview.id)}
                                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/30"
                                >
                                    <Trash2 size={14} className="mr-1" /> REMOVE_PUBLIC
                                </Button>
                            </div>

                            <blockquote className="text-lg text-zinc-300 leading-relaxed font-light border-l-4 border-zinc-800 pl-4 italic">
                                {activeReview.message}
                            </blockquote>
                        </div>

                        {/* Logs */}
                        <div className="p-4 flex-1 bg-zinc-950/50">
                            <div className="text-xs font-mono text-zinc-500 mb-2">SYSTEM_LOGS::</div>
                            <div className="space-y-1">
                                {logs.map((log, i) => (
                                    <div key={i} className="text-[10px] text-zinc-600 font-mono border-l-2 border-zinc-800 pl-2">
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-600 font-mono">
                        _select_review_to_manage
                    </div>
                )}
            </div>
        </div>
    );
};
