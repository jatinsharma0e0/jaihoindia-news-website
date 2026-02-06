import { useState, useEffect } from 'react';
import { Trash2, Upload, Plus, Loader2, FileText } from 'lucide-react';
import {
    fetchAdminGalleryImages,
    addGalleryImage,
    deleteGalleryImage,
    uploadImage,
    type GalleryImage
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function DocumentsManager() {
    const [documents, setDocuments] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const data = await fetchAdminGalleryImages('documents');
            setDocuments(data);
        } catch (error) {
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newDocs: GalleryImage[] = [];
        let errorCount = 0;

        try {
            // Process all selected files
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    // 1. Upload file to documents subdirectory
                    const uploadResult = await uploadImage(file, 'documents');

                    // 2. Add to gallery DB (reused for documents)
                    const newDoc = await addGalleryImage(uploadResult.url);
                    newDocs.push(newDoc);
                } catch (err) {
                    console.error(`Failed to upload file ${file.name}:`, err);
                    errorCount++;
                }
            }

            // 3. Update UI with all successfully uploaded documents
            if (newDocs.length > 0) {
                setDocuments(prev => [...newDocs, ...(prev || [])]);
                toast.success(`Successfully uploaded ${newDocs.length} document${newDocs.length !== 1 ? 's' : ''}`);
            }

            if (errorCount > 0) {
                toast.error(`Failed to upload ${errorCount} document${errorCount !== 1 ? 's' : ''}`);
            }

        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred during upload');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to remove this document?')) return;

        try {
            await deleteGalleryImage(id);
            setDocuments(documents.filter(doc => doc.id !== id));
            toast.success('Document removed');
        } catch (error) {
            toast.error('Failed to remove document');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading documents...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Documents Management</h2>
                    <p className="text-slate-400">Manage official documents displayed on the Documents page</p>
                </div>
                <div>
                    <Input
                        type="file"
                        id="document-upload"
                        className="hidden"
                        accept="image/*"
                        multiple // Enable multiple file selection
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <Button
                        disabled={uploading}
                        onClick={() => document.getElementById('document-upload')?.click()}
                        className="bg-news-red hover:bg-red-700 text-white"
                    >
                        {uploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        {uploading ? 'Uploading...' : 'Add Documents'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {!documents || documents.length === 0 ? (
                    <div className="col-span-full py-12 text-center border border-dashed border-slate-700 rounded-lg">
                        <p className="text-slate-500">No documents uploaded yet</p>
                    </div>
                ) : (
                    Array.isArray(documents) && documents.map((doc) => (
                        <div key={doc.id} className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                            {/* Document Preview */}
                            <img
                                src={doc.image_url}
                                alt="Document preview"
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <FileText className="text-white w-8 h-8 opacity-80" />
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(doc.id)}
                                    className="mt-2 scale-90 hover:scale-100 transition-transform"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
