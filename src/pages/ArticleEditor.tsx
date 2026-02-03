import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload } from 'lucide-react';
import {
    createArticle,
    updateArticle,
    fetchAdminArticles,
    uploadImage,
    type Article
} from '@/services/api';

export default function ArticleEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState<Omit<Article, 'id'>>({
        title: '',
        slug: '',
        summary: '',
        content: '',
        image: '',
        category: 'politics',
        author: '',
        status: 'draft',
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isEdit && id) {
            loadArticle(parseInt(id));
        }
    }, [id, isEdit]);

    const loadArticle = async (articleId: number) => {
        try {
            const articles = await fetchAdminArticles();
            const article = articles.find(a => a.id === articleId);
            if (article) {
                setFormData({
                    title: article.title,
                    slug: article.slug,
                    summary: article.summary,
                    content: article.content,
                    image: article.image || '',
                    category: article.category,
                    author: article.author,
                    status: article.status,
                });
            }
        } catch (error) {
            console.error('Failed to load article:', error);
            alert('Failed to load article');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-generate slug from title
        if (name === 'title') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const result = await uploadImage(file);
            setFormData(prev => ({ ...prev, image: result.url }));
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
        e.preventDefault();
        setLoading(true);

        try {
            const articleData = { ...formData, status };

            if (isEdit && id) {
                await updateArticle(parseInt(id), articleData);
                alert('Article updated successfully!');
            } else {
                await createArticle(articleData);
                alert('Article created successfully!');
            }

            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Failed to save article:', error);
            alert('Failed to save article');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="p-2 text-slate-300 hover:text-white transition"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-xl font-bold text-white">
                            {isEdit ? 'Edit Article' : 'Create New Article'}
                        </h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Title <span className="text-news-red">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-news-red focus:border-transparent"
                            placeholder="Enter article title"
                            required
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Slug <span className="text-news-red">*</span>
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-news-red focus:border-transparent"
                            placeholder="article-slug"
                            required
                        />
                    </div>

                    {/* Category & Author */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Category <span className="text-news-red">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-news-red focus:border-transparent"
                                required
                            >
                                <option value="breaking">Breaking</option>
                                <option value="politics">Politics</option>
                                <option value="sports">Sports</option>
                                <option value="technology">Technology</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Author <span className="text-news-red">*</span>
                            </label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-news-red focus:border-transparent"
                                placeholder="Author name"
                                required
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Summary <span className="text-news-red">*</span>
                        </label>
                        <textarea
                            name="summary"
                            value={formData.summary}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-news-red focus:border-transparent resize-none"
                            placeholder="Brief summary of the article"
                            required
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Content <span className="text-news-red">*</span>
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={15}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-news-red focus:border-transparent resize-none font-mono text-sm"
                            placeholder="Article content..."
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Featured Image
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 cursor-pointer transition">
                                <Upload className="h-4 w-4" />
                                {uploading ? 'Uploading...' : 'Upload Image'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                            {formData.image && (
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="h-16 w-16 object-cover rounded-lg border border-slate-700"
                                />
                            )}
                        </div>
                        {formData.image && (
                            <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                className="mt-2 w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                                placeholder="Image URL"
                            />
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/dashboard')}
                            className="px-6 py-2 text-slate-300 hover:text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            Save Draft
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'published')}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-news-red hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
                        >
                            <Eye className="h-4 w-4" />
                            Publish
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
