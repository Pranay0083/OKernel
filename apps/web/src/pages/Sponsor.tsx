import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Coffee, Heart, Terminal, Star, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

interface SponsorGoal {
    id: string;
    title: string;
    description: string;
    current_amount: number;
    target_amount: number;
}

interface SponsorReview {
    id: string;
    name: string;
    message: string;
    amount: number;
}

export const Sponsor = () => {
    const [goals, setGoals] = React.useState<SponsorGoal[]>([]);
    const [reviews, setReviews] = React.useState<SponsorReview[]>([]);
    const [totalRaised, setTotalRaised] = React.useState(0);

    React.useEffect(() => {
        const fetchData = async () => {
            // Fetch Goals
            const { data: goalsData } = await supabase
                .from('sponsor_goals')
                .select('*')
                .eq('is_active', true)
                .order('rank', { ascending: true });

            if (goalsData) {
                setGoals(goalsData);
                const total = goalsData.reduce((acc, curr) => acc + curr.current_amount, 0);
                setTotalRaised(total);
            }

            // Fetch Reviews
            const { data: reviewsData } = await supabase
                .from('sponsor_reviews')
                .select('*')
                .eq('is_visible', true)
                .order('created_at', { ascending: false });

            if (reviewsData) setReviews(reviewsData);
        };
        fetchData();
    }, []);

    return (
        <Layout>
            <div className="container mx-auto px-4 pt-32 pb-24 max-w-4xl">

                {/* Hero Section */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-green-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800 text-green-400 text-xs font-mono rounded-full mb-6 backdrop-blur-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        /usr/bin/support
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                        Fuel the <span className="text-green-500">Kernel</span>.
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Open Source software runs on coffee and code.
                        Help keep the servers running and the updates flowing.
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="md:col-span-2 space-y-8">

                        {/* Funding Goals */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Terminal className="text-green-500" /> Current Objectives
                            </h2>

                            {goals.length === 0 ? (
                                <div className="text-zinc-500 text-center py-8">Loading goals from kernel...</div>
                            ) : (
                                <div className="space-y-8">
                                    {goals.map((goal) => (
                                        <div key={goal.id}>
                                            <div className="flex justify-between items-end mb-2">
                                                <div>
                                                    <h3 className="font-bold text-zinc-200">{goal.title}</h3>
                                                    <p className="text-xs text-zinc-500 font-mono">{goal.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-green-400 font-mono font-bold">${goal.current_amount}</span>
                                                    <span className="text-zinc-600 text-sm"> / ${goal.target_amount}</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 relative transition-all duration-1000 ease-out"
                                                    style={{ width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%` }}
                                                >
                                                    <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/50 shadow-[0_0_10px_white]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Supporters (Replaces Bio) */}
                        <div className="p-8 border border-zinc-800 rounded-2xl bg-black/20">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Heart className="text-red-500 fill-red-500/20" size={20} /> Recent Supporters
                            </h3>

                            {reviews.length === 0 ? (
                                <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                                    <Star className="text-yellow-500 mx-auto mb-3 opacity-50" size={32} />
                                    <h4 className="text-zinc-300 font-bold mb-1">Be the first to fuel the kernel!</h4>
                                    <p className="text-zinc-500 text-sm">Your support will be immortalized here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
                                                <User className="text-green-500" size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-white">{review.name}</span>
                                                    <span className="px-1.5 py-0.5 bg-zinc-800 text-green-400 text-[10px] font-mono rounded border border-zinc-700">
                                                        ${review.amount}
                                                    </span>
                                                </div>
                                                <p className="text-zinc-400 text-sm leading-relaxed">"{review.message}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Actions */}
                    <div className="space-y-4">
                        <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/30">
                            <h3 className="font-bold text-white mb-4">Support Channels</h3>
                            <div className="space-y-3">
                                <a href="https://buymeacoffee.com/vaiditya" target="_blank" rel="noreferrer" className="block">
                                    <Button className="w-full bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-bold h-12 rounded-xl flex items-center justify-center gap-2">
                                        <Coffee size={18} className="fill-black" /> Buy me a Coffee
                                    </Button>
                                </a>
                                <a href="https://github.com/sponsors/Vaiditya2207" target="_blank" rel="noreferrer" className="block">
                                    <Button className="w-full bg-[#EA4AAA] hover:bg-[#EA4AAA]/90 text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2">
                                        <Heart size={18} className="fill-white" /> GitHub Sponsors
                                    </Button>
                                </a>
                            </div>
                        </div>

                        <div className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/30 text-center">
                            <div className="text-xs font-mono text-zinc-500 mb-2">TOTAL CONTRIBUTIONS</div>
                            <div className="text-3xl font-bold text-white mb-1">${totalRaised}</div>
                            <div className="text-xs text-green-500">Last donation 2 days ago</div>
                        </div>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="mt-16 text-center text-zinc-600 text-xs font-mono">
                    <Heart className="inline-block w-3 h-3 text-red-500 mr-1 animate-pulse" />
                    MADE WITH LOVE FOR OPEN SOURCE
                </div>

            </div>
        </Layout>
    );
};
