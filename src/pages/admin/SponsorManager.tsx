import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Plus, Edit2, Trash2, MessageSquare, Target, User, DollarSign } from 'lucide-react';

interface SponsorGoal {
    id: string;
    title: string;
    description: string;
    current_amount: number;
    target_amount: number;
    is_active: boolean;
    rank: number;
}

interface SponsorReview {
    id: string;
    name: string;
    message: string;
    amount: number;
    is_visible: boolean;
    created_at: string;
}

export const SponsorManager = () => {
    const [activeTab, setActiveTab] = useState<'goals' | 'reviews'>('goals');

    // Goals State
    const [goals, setGoals] = useState<SponsorGoal[]>([]);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [currentGoal, setCurrentGoal] = useState<Partial<SponsorGoal>>({});

    // Reviews State
    const [reviews, setReviews] = useState<SponsorReview[]>([]);
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [currentReview, setCurrentReview] = useState<Partial<SponsorReview>>({});

    useEffect(() => {
        if (activeTab === 'goals') fetchGoals();
        else fetchReviews();
    }, [activeTab]);

    // --- GOALS LOGIC ---
    const fetchGoals = async () => {
        const { data } = await supabase.from('sponsor_goals').select('*').order('rank', { ascending: true });
        if (data) setGoals(data);
    };

    const handleSaveGoal = async () => {
        if (!currentGoal.title || !currentGoal.target_amount) return;
        const payload = { ...currentGoal, is_active: currentGoal.is_active !== false, rank: currentGoal.rank || 0 };

        if (currentGoal.id) await supabase.from('sponsor_goals').update(payload).eq('id', currentGoal.id);
        else await supabase.from('sponsor_goals').insert([payload]);

        setIsEditingGoal(false);
        fetchGoals();
    };

    const handleDeleteGoal = async (id: string) => {
        if (confirm('Delete goal?')) {
            await supabase.from('sponsor_goals').delete().eq('id', id);
            fetchGoals();
        }
    };

    // --- REVIEWS LOGIC ---
    const fetchReviews = async () => {
        const { data } = await supabase.from('sponsor_reviews').select('*').order('created_at', { ascending: false });
        if (data) setReviews(data);
    };

    const handleSaveReview = async () => {
        if (!currentReview.name) return;
        const payload = {
            name: currentReview.name,
            message: currentReview.message,
            amount: currentReview.amount || 0,
            is_visible: currentReview.is_visible !== false
        };

        if (currentReview.id) await supabase.from('sponsor_reviews').update(payload).eq('id', currentReview.id);
        else await supabase.from('sponsor_reviews').insert([payload]);

        setIsEditingReview(false);
        fetchReviews();
    };

    const handleDeleteReview = async (id: string) => {
        if (confirm('Delete review?')) {
            await supabase.from('sponsor_reviews').delete().eq('id', id);
            fetchReviews();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white font-mono">Sponsor Manager</h1>
                    <p className="text-zinc-400 text-sm">Manage /sponsor page content</p>
                </div>
                <div className="flex gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('goals')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'goals' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Goals
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'reviews' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Reviews
                    </button>
                </div>
            </div>

            {/* --- GOALS TAB --- */}
            {activeTab === 'goals' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => { setCurrentGoal({}); setIsEditingGoal(true); }} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                            <Plus size={16} /> Add Goal
                        </Button>
                    </div>
                    <div className="grid gap-4">
                        {goals.map((goal) => (
                            <div key={goal.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex justify-between items-center">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${goal.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-400 font-mono">
                                        <span className="text-green-400">${goal.current_amount}</span>
                                        <span>/</span>
                                        <span>${goal.target_amount}</span>
                                    </div>
                                    <div className="h-1 w-48 bg-zinc-800 rounded-full overflow-hidden mt-2">
                                        <div className="h-full bg-green-500" style={{ width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%` }} />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => { setCurrentGoal(goal); setIsEditingGoal(true); }} size="sm" className="bg-zinc-800 border-zinc-700 text-zinc-300"><Edit2 size={14} /></Button>
                                    <Button onClick={() => handleDeleteGoal(goal.id)} size="sm" className="bg-red-500/10 border-red-500/20 text-red-500"><Trash2 size={14} /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- REVIEWS TAB --- */}
            {activeTab === 'reviews' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => { setCurrentReview({}); setIsEditingReview(true); }} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                            <Plus size={16} /> Add Review
                        </Button>
                    </div>
                    <div className="grid gap-4">
                        {reviews.length === 0 && <div className="text-zinc-500 text-center py-8">No reviews yet. Add one manually!</div>}
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${review.is_visible ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <h3 className="text-lg font-bold text-white">{review.name}</h3>
                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full font-mono border border-green-500/20">
                                            ${review.amount}
                                        </span>
                                    </div>
                                    <p className="text-zinc-400 text-sm italic">"{review.message}"</p>
                                    <p className="text-xs text-zinc-600 pt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => { setCurrentReview(review); setIsEditingReview(true); }} size="sm" className="bg-zinc-800 border-zinc-700 text-zinc-300"><Edit2 size={14} /></Button>
                                    <Button onClick={() => handleDeleteReview(review.id)} size="sm" className="bg-red-500/10 border-red-500/20 text-red-500"><Trash2 size={14} /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- GOAL MODAL --- */}
            {isEditingGoal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
                        <h2 className="text-xl font-bold text-white">{currentGoal.id ? 'Edit Goal' : 'New Goal'}</h2>
                        <input className="input-std" value={currentGoal.title || ''} onChange={e => setCurrentGoal({ ...currentGoal, title: e.target.value })} placeholder="Title" />
                        <textarea className="input-std" value={currentGoal.description || ''} onChange={e => setCurrentGoal({ ...currentGoal, description: e.target.value })} placeholder="Description" rows={2} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" className="input-std" value={currentGoal.current_amount || ''} onChange={e => setCurrentGoal({ ...currentGoal, current_amount: parseInt(e.target.value) })} placeholder="Current $" />
                            <input type="number" className="input-std" value={currentGoal.target_amount || ''} onChange={e => setCurrentGoal({ ...currentGoal, target_amount: parseInt(e.target.value) })} placeholder="Target $" />
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button onClick={() => setIsEditingGoal(false)} className="bg-zinc-800">Cancel</Button>
                            <Button onClick={handleSaveGoal} className="bg-green-600">Save</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- REVIEW MODAL --- */}
            {isEditingReview && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
                        <h2 className="text-xl font-bold text-white">{currentReview.id ? 'Edit Review' : 'New Review'}</h2>
                        <input className="input-std" value={currentReview.name || ''} onChange={e => setCurrentReview({ ...currentReview, name: e.target.value })} placeholder="Donor Name" />
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-3 top-3 text-zinc-500" />
                            <input type="number" className="input-std pl-8" value={currentReview.amount || ''} onChange={e => setCurrentReview({ ...currentReview, amount: parseFloat(e.target.value) })} placeholder="Amount" />
                        </div>
                        <textarea className="input-std" value={currentReview.message || ''} onChange={e => setCurrentReview({ ...currentReview, message: e.target.value })} placeholder="Message" rows={3} />
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={currentReview.is_visible !== false} onChange={e => setCurrentReview({ ...currentReview, is_visible: e.target.checked })} />
                            <span className="text-zinc-400 text-sm">Visible</span>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button onClick={() => setIsEditingReview(false)} className="bg-zinc-800">Cancel</Button>
                            <Button onClick={handleSaveReview} className="bg-purple-600">Save</Button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .input-std {
                    width: 100%;
                    background: rgba(0,0,0,0.5);
                    border: 1px solid #27272a;
                    border-radius: 0.5rem;
                    padding: 0.5rem;
                    color: white;
                    outline: none;
                }
                .input-std:focus { border-color: #22c55e; }
            `}</style>
        </div>
    );
};
