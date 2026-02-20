import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Users, CheckSquare, Square, XCircle, Trash2 } from 'lucide-react';
import {
    fetchAdminGalleryImages,
    addTeamMember,
    deleteTeamMember,
    bulkDeleteGalleryItems,
    fetchArrangement,
    saveArrangement,
    uploadImage,
    type GalleryImage
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import ArrangementToolbar, { type SortMode } from './ArrangementToolbar';
import SortableImageGrid from './SortableImageGrid';

export default function TeamManager() {
    const [teamMembers, setTeamMembers] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selected, setSelected] = useState<Set<string | number>>(new Set());
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>('newest');
    const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { loadTeamMembers(); }, []);

    const applySort = useCallback((items: GalleryImage[], mode: SortMode, savedOrder: (string | number)[] | null = null): GalleryImage[] => {
        const arr = [...items];
        if (mode === 'newest') return arr.sort((a, b) => new Date(b.uploaded_at ?? 0).getTime() - new Date(a.uploaded_at ?? 0).getTime());
        if (mode === 'oldest') return arr.sort((a, b) => new Date(a.uploaded_at ?? 0).getTime() - new Date(b.uploaded_at ?? 0).getTime());
        if (mode === 'az') return arr.sort((a, b) => (a.image_url ?? '').localeCompare(b.image_url ?? ''));
        if (mode === 'za') return arr.sort((a, b) => (b.image_url ?? '').localeCompare(a.image_url ?? ''));
        if (mode === 'custom' && savedOrder) {
            const indexMap = new Map(savedOrder.map((id, i) => [String(id), i]));
            return arr.sort((a, b) => (indexMap.get(String(a.id)) ?? 9999) - (indexMap.get(String(b.id)) ?? 9999));
        }
        return arr;
    }, []);

    const loadTeamMembers = async () => {
        try {
            const [data, savedOrder] = await Promise.all([
                fetchAdminGalleryImages('team'),
                fetchArrangement('team').catch(() => null),
            ]);
            const mode: SortMode = savedOrder ? 'custom' : 'newest';
            setSortMode(mode);
            setTeamMembers(applySort(data, mode, savedOrder));
        } catch {
            toast.error('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const handleSortModeChange = (mode: SortMode) => {
        setSortMode(mode);
        setHasUnsavedOrder(false);
        setTeamMembers(prev => applySort(prev, mode));
    };

    const handleReorder = (newMembers: GalleryImage[]) => {
        setTeamMembers(newMembers);
        setHasUnsavedOrder(true);
    };

    const handleSaveOrder = async () => {
        setIsSaving(true);
        try {
            await saveArrangement('team', teamMembers.map(m => m.id));
            setHasUnsavedOrder(false);
            toast.success('Team order saved');
        } catch {
            toast.error('Failed to save order');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        const newMembers: GalleryImage[] = [];
        let errorCount = 0;
        try {
            for (let i = 0; i < files.length; i++) {
                try {
                    const { url } = await uploadImage(files[i], 'team');
                    const member = await addTeamMember(url);
                    newMembers.push(member);
                } catch { errorCount++; }
            }
            if (newMembers.length > 0) {
                setTeamMembers(prev => [...newMembers, ...prev]);
                toast.success(`Uploaded ${newMembers.length} team member${newMembers.length !== 1 ? 's' : ''}`);
                if (sortMode === 'custom') setHasUnsavedOrder(true);
            }
            if (errorCount > 0) toast.error(`Failed to upload ${errorCount} file${errorCount !== 1 ? 's' : ''}`);
        } catch { toast.error('Upload failed'); }
        finally { setUploading(false); e.target.value = ''; }
    };

    const handleDelete = async (id: string | number) => {
        if (!confirm('Remove this team member?')) return;
        try {
            await deleteTeamMember(id);
            setTeamMembers(prev => prev.filter(m => m.id !== id));
            setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
            toast.success('Team member removed');
        } catch { toast.error('Failed to remove team member'); }
    };

    const toggleSelect = (id: string | number) => {
        setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    };

    const toggleSelectAll = () => {
        setSelected(selected.size === teamMembers.length ? new Set() : new Set(teamMembers.map(m => m.id)));
    };

    const handleBulkDelete = async () => {
        if (!selected.size || !confirm(`Remove ${selected.size} selected team member${selected.size !== 1 ? 's' : ''}?`)) return;
        setBulkDeleting(true);
        try {
            await bulkDeleteGalleryItems(Array.from(selected));
            setTeamMembers(prev => prev.filter(m => !selected.has(m.id)));
            setSelected(new Set());
            toast.success(`Removed ${selected.size} team member${selected.size !== 1 ? 's' : ''} from storage`);
        } catch { toast.error('Bulk delete failed'); }
        finally { setBulkDeleting(false); }
    };

    const allSelected = teamMembers.length > 0 && selected.size === teamMembers.length;

    if (loading) return <div className="p-8 text-center text-slate-400">Loading team members…</div>;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white">Team Management</h2>
                    <p className="text-slate-400">Manage team photos displayed on the Team page</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {selected.size > 0 && (
                        <>
                            <span className="text-sm text-slate-400">{selected.size} selected</span>
                            <Button variant="outline" size="sm" onClick={() => setSelected(new Set())} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                <XCircle className="w-4 h-4 mr-1" /> Clear
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkDeleting} className="bg-red-600 hover:bg-red-700">
                                {bulkDeleting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                                {bulkDeleting ? 'Removing…' : `Remove ${selected.size}`}
                            </Button>
                        </>
                    )}
                    <Input type="file" id="team-upload" className="hidden" accept="image/*" multiple onChange={handleUpload} disabled={uploading} />
                    <Button disabled={uploading} onClick={() => document.getElementById('team-upload')?.click()} className="bg-news-red hover:bg-red-700 text-white">
                        {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        {uploading ? 'Uploading…' : 'Add Team Members'}
                    </Button>
                </div>
            </div>

            {/* Arrangement toolbar */}
            <ArrangementToolbar
                sortMode={sortMode}
                onSortModeChange={handleSortModeChange}
                hasUnsavedOrder={hasUnsavedOrder}
                isSaving={isSaving}
                onSave={handleSaveOrder}
            />

            {/* Select All */}
            {teamMembers.length > 0 && (
                <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-1">
                    {allSelected ? <CheckSquare className="w-4 h-4 text-news-red" /> : <Square className="w-4 h-4" />}
                    {allSelected ? 'Deselect All' : 'Select All'}
                </button>
            )}

            {/* Sortable grid */}
            <SortableImageGrid
                images={teamMembers}
                sortMode={sortMode}
                selected={selected}
                overlayIcon={<Users className="w-6 h-6" />}
                emptyMessage="No team members uploaded yet"
                onReorder={handleReorder}
                onToggleSelect={toggleSelect}
                onDelete={handleDelete}
            />
        </div>
    );
}
