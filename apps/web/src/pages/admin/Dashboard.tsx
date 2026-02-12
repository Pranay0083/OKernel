
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { LogOut, Database, ShieldCheck, Trash2, Star, Clock, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface FeedbackItem {
    id: string;
    created_at: string;
    message: string;
    name: string | null;
    email: string | null;
    user_agent: string | null;
    version: string;
}

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [adminEmail, setAdminEmail] = useState<string>('');
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
    const [stats, setStats] = useState({ total: 0, today: 0 });

    const verifyAndFetch = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/root');
            return;
        }

        // Verify Admin
        const { data: adminData } = await supabase
            .from('admin_whitelist')
            .select('email')
            .eq('email', session.user.email)
            .single();

        if (!adminData) {
            await supabase.auth.signOut();
            navigate('/root');
            return;
        }

        setAdminEmail(adminData.email);
        // Fetch inbox inline
        const { data } = await supabase
            .from('user_feedback')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setFeedback(data);

            // Calc Stats
            const now = new Date();
            const todayCount = data.filter(item => {
                const date = new Date(item.created_at);
                return date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
            }).length;

            setStats({
                total: data.length,
                today: todayCount
            });
        }
        setLoading(false);
    }, [navigate]);

    useEffect(() => {
        const init = async () => {
            await verifyAndFetch();
        };
        init();
    }, [verifyAndFetch]);

    const fetchInbox = async () => {
        // Fetch Private Feedback
        const { data, error: _error } = await supabase
            .from('user_feedback')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setFeedback(data);

            // Calc Stats
            const now = new Date();
            const todayCount = data.filter(item => {
                const date = new Date(item.created_at);
                return date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
            }).length;

            setStats({
                total: data.length,
                today: todayCount
            });
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/root');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('CONFIRM DELETION: This cannot be undone.')) return;

        const { error } = await supabase
            .from('user_feedback')
            .delete()
            .eq('id', id);

        if (!error) {
            setFeedback(prev => prev.filter(item => item.id !== id));
            setStats(prev => ({ ...prev, total: prev.total - 1 }));
        } else {
            alert('Error deleting: ' + error.message);
        }
    };

    const handleFeature = async (item: FeedbackItem) => {
        if (!confirm(`Promote this feedback to Homepage?\n\n"${item.message}"`)) return;

        const { error } = await supabase
            .from('featured_reviews')
            .insert([{
                message: item.message,
                name: item.name || 'Anonymous User',
                role: 'Verified User' // Default role for promoted feedback
            }]);

        if (!error) {
            alert('SUCCESS: Feedback promoted to Homepage.');
        } else {
            alert('Error promoting: ' + error.message);
        }
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-green-500 font-mono">
                &gt; verifying_credentials...
            </div>
        );
    }

    return (
        <Layout>
            <div className="pt-24 container mx-auto px-4 pb-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600 mb-2">
                            Admin Console
                        </h1>
                        <p className="text-zinc-500 font-mono text-sm">
                            Logged in as: <span className="text-green-500">{adminEmail}</span>
                        </p>
                    </div>
                    <Button onClick={handleLogout} variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                        <LogOut className="mr-2 h-4 w-4" /> Terminate Session
                    </Button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:border-green-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Inbox Total</h3>
                                <p className="text-3xl font-bold text-white font-mono">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:border-green-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-mono">New Today</h3>
                                <p className="text-3xl font-bold text-white font-mono">{stats.today}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:border-green-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-mono">System Status</h3>
                                <p className="text-xl font-bold text-green-500 font-mono">SECURE</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inbox Table */}
                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/50">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Mail size={16} className="text-zinc-400" />
                            <h2 className="text-sm font-bold text-zinc-300 font-mono">INCOMING_STREAM</h2>
                        </div>
                        <Button size="sm" variant="ghost" onClick={fetchInbox} className="text-xs font-mono text-zinc-500 hover:text-white">
                            REFRESH
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-400">
                            <thead className="bg-zinc-900/50 text-xs uppercase font-mono text-zinc-500 border-b border-zinc-800">
                                <tr>
                                    <th className="px-6 py-3 w-48">Timestamp</th>
                                    <th className="px-6 py-3 w-48">Author</th>
                                    <th className="px-6 py-3">Message</th>
                                    <th className="px-6 py-3 w-32 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {feedback.length > 0 ? (
                                    feedback.map((item) => (
                                        <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                                {formatDate(item.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white text-xs mb-1">
                                                    {item.name || 'Anonymous'}
                                                </div>
                                                <div className="text-xs text-zinc-600 font-mono flex items-center gap-1">
                                                    {item.email || 'No Email'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-zinc-300 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                                                    <span className="text-green-500 font-mono mr-2">&gt;</span>
                                                    {item.message}
                                                </p>
                                                <div className="mt-2 text-[10px] text-zinc-600 font-mono">
                                                    UA: {item.user_agent?.substring(0, 40)}...
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleFeature(item)}
                                                        className="p-2 hover:bg-yellow-500/10 text-zinc-500 hover:text-yellow-500 rounded transition-colors"
                                                        title="Promote to Featured"
                                                    >
                                                        <Star size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded transition-colors"
                                                        title="Delete permanently"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 font-mono">
                                            _buffer_empty. waiting_for_input...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
