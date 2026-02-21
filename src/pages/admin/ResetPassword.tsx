import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const navigate = useNavigate();

    // Supabase puts the recovery tokens in the URL hash.
    // onAuthStateChange fires with SIGNED_IN / PASSWORD_RECOVERY when the
    // magic link is clicked, which gives us a valid session to call updateUser.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                setSessionReady(true);
            }
        });

        // Also check if a session already exists (page refresh after clicking link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setSessionReady(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setSuccess(true);
            setTimeout(() => navigate('/admin/dashboard'), 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md px-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold">
                        <span className="text-news-red">JaiHo</span>
                        <span className="text-white">India</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">Set New Password</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    {success ? (
                        <div className="text-center">
                            <div className="text-4xl mb-4">✅</div>
                            <p className="text-green-400 font-semibold">Password updated!</p>
                            <p className="text-slate-400 text-sm mt-2">Redirecting to dashboard…</p>
                        </div>
                    ) : !sessionReady ? (
                        <div className="text-center py-4">
                            <div className="w-8 h-8 border-4 border-news-red border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-slate-400 text-sm mt-3">Verifying reset link…</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-6">New Password</h2>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-news-red focus:border-transparent transition"
                                        placeholder="Min. 8 characters"
                                        minLength={8}
                                        required
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-news-red focus:border-transparent transition"
                                        placeholder="Repeat password"
                                        required
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-news-red hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    )}
                                    {loading ? 'Updating…' : 'Update Password'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
