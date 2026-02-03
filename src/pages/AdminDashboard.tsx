import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogOut, Newspaper, RefreshCw } from 'lucide-react';
import {
    fetchAdminArticles,
    deleteArticle,
    adminLogout,
    refreshCache,
    fetchCacheStatus,
    type Article,
    type CacheStatusData
} from '@/services/api';

export default function AdminDashboard() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [cacheStatus, setCacheStatus] = useState<CacheStatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [articlesData, cacheData] = await Promise.all([
                fetchAdminArticles(),
                fetchCacheStatus(),
            ]);
            setArticles(articlesData);
            setCacheStatus(cacheData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        adminLogout();
        navigate('/admin/login');
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this article?')) return;

        try {
            await deleteArticle(id);
            setArticles(articles.filter(a => a.id !== id));
        } catch (error) {
            console.error('Failed to delete article:', error);
            alert('Failed to delete article');
        }
    };

    const handleRefreshCache = async () => {
        try {
            setRefreshing(true);
            await refreshCache();
            const newCacheStatus = await fetchCacheStatus();
            setCacheStatus(newCacheStatus);
            alert('Cache refreshed successfully!');
        } catch (error) {
            console.error('Failed to refresh cache:', error);
            alert('Failed to refresh cache');
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                <span className="text-news-red">JaiHo</span>
                                <span className="text-white">India</span>
                                <span className="text-slate-400 ml-2">Admin</span>
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Total Articles</p>
                                <p className="text-3xl font-bold text-white">{articles.length}</p>
                            </div>
                            <Newspaper className="h-10 w-10 text-news-red" />
                        </div>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Published</p>
                                <p className="text-3xl font-bold text-white">
                                    {articles.filter(a => a.status === 'published').length}
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                <span className="text-green-500 text-xl">✓</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Cached News</p>
                                <p className="text-3xl font-bold text-white">
                                    {cacheStatus?.totalArticles || 0}
                                </p>
                            </div>
                            <button
                                onClick={handleRefreshCache}
                                disabled={refreshing}
                                className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center hover:bg-blue-500/30 transition disabled:opacity-50"
                            >
                                <RefreshCw className={`h-5 w-5 text-blue-500 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Articles Section */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg">
                    <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Original Articles</h2>
                        <Link
                            to="/admin/articles/new"
                            className="flex items-center gap-2 px-4 py-2 bg-news-red hover:bg-red-600 text-white rounded-lg transition"
                        >
                            <Plus className="h-4 w-4" />
                            New Article
                        </Link>
                    </div>

                    <div className="p-6">
                        {articles.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-400 mb-4">No articles yet</p>
                                <Link
                                    to="/admin/articles/new"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-news-red hover:bg-red-600 text-white rounded-lg transition"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create First Article
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Title</th>
                                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Category</th>
                                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                                            <th className="text-left py-3 px-4 text-slate-300 font-medium">Author</th>
                                            <th className="text-right py-3 px-4 text-slate-300 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {articles.map((article) => (
                                            <tr key={article.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                                <td className="py-3 px-4 text-white">{article.title}</td>
                                                <td className="py-3 px-4 text-slate-300 capitalize">{article.category}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${article.status === 'published'
                                                            ? 'bg-green-500/20 text-green-500'
                                                            : 'bg-yellow-500/20 text-yellow-500'
                                                        }`}>
                                                        {article.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-300">{article.author}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/admin/articles/edit/${article.id}`}
                                                            className="px-3 py-1 text-sm bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded transition"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => article.id && handleDelete(article.id)}
                                                            className="px-3 py-1 text-sm bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cache Status */}
                {cacheStatus && (
                    <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Cache Status</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-slate-400 text-sm">Status</p>
                                <p className={`text-sm font-medium ${cacheStatus.isValid ? 'text-green-500' : 'text-red-500'}`}>
                                    {cacheStatus.isValid ? 'Valid' : 'Expired'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Cache Age</p>
                                <p className="text-slate-300 text-sm">{Math.floor(cacheStatus.cacheAge / 60)} min</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Expires In</p>
                                <p className="text-slate-300 text-sm">{Math.floor(cacheStatus.expiresIn / 60)} min</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Last Updated</p>
                                <p className="text-slate-300 text-sm">
                                    {new Date(cacheStatus.lastUpdated).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
