import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
    const [mode, setMode] = useState<'login' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

    // ── Login ─────────────────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    // ── Forgot Password ───────────────────────────────────────────────────────
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/admin/reset-password`,
            });
            if (error) throw error;
            setInfo('Password reset link sent! Check your email.');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold">
                        <span className="text-news-red">JaiHo</span>
                        <span className="text-white">India</span>
                        <span className="text-muted-foreground ml-2 text-2xl">News</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">Admin Panel</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        {mode === 'login' ? 'Sign In' : 'Reset Password'}
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}
                    {info && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">
                            {info}
                        </div>
                    )}

                    <form
                        onSubmit={mode === 'login' ? handleLogin : handleForgotPassword}
                        className="space-y-4"
                    >
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-news-red focus:border-transparent transition"
                                placeholder="admin@jaihoindia.com"
                                required
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        {mode === 'login' && (
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-news-red focus:border-transparent transition"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-news-red hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {mode === 'login'
                                ? loading ? 'Signing in…' : 'Sign In'
                                : loading ? 'Sending…' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        {mode === 'login' ? (
                            <button
                                onClick={() => { setMode('forgot'); setError(''); setInfo(''); }}
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Forgot password?
                            </button>
                        ) : (
                            <button
                                onClick={() => { setMode('login'); setError(''); setInfo(''); }}
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                ← Back to Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
