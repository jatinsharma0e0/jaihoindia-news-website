import { useState, useEffect } from 'react';
import { Trash2, Upload, Plus, Loader2 } from 'lucide-react';
import {
    fetchGalleryImages,
    addGalleryImage,
    deleteGalleryImage,
    uploadImage,
    type GalleryImage
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function GalleryManager() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            const data = await fetchGalleryImages();
            setImages(data);
        } catch (error) {
            toast.error('Failed to load gallery images');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages: GalleryImage[] = [];
        let errorCount = 0;

        try {
            // Process all selected files
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    // 1. Upload file to gallery subdirectory
                    const uploadResult = await uploadImage(file, 'gallery');

                    // 2. Add to gallery DB
                    const newImage = await addGalleryImage(uploadResult.url);
                    newImages.push(newImage);
                } catch (err) {
                    console.error(`Failed to upload file ${file.name}:`, err);
                    errorCount++;
                }
            }

            // 3. Update UI with all successfully uploaded images
            if (newImages.length > 0) {
                setImages(prev => [...newImages, ...(prev || [])]);
                toast.success(`Successfully uploaded ${newImages.length} image${newImages.length !== 1 ? 's' : ''}`);
            }

            if (errorCount > 0) {
                toast.error(`Failed to upload ${errorCount} image${errorCount !== 1 ? 's' : ''}`);
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
        if (!confirm('Are you sure you want to remove this image from the gallery?')) return;

        try {
            await deleteGalleryImage(id);
            setImages(images.filter(img => img.id !== id));
            toast.success('Image removed');
        } catch (error) {
            toast.error('Failed to remove image');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading gallery...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Gallery Management</h2>
                    <p className="text-slate-400">Manage photos displayed on the public Gallery page</p>
                </div>
                <div>
                    <Input
                        type="file"
                        id="gallery-upload"
                        className="hidden"
                        accept="image/*"
                        multiple // Enable multiple file selection
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <Button
                        disabled={uploading}
                        onClick={() => document.getElementById('gallery-upload')?.click()}
                        className="bg-news-red hover:bg-red-700 text-white"
                    >
                        {uploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        {uploading ? 'Uploading...' : 'Add Photos'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {!images || images.length === 0 ? (
                    <div className="col-span-full py-12 text-center border border-dashed border-slate-700 rounded-lg">
                        <p className="text-slate-500">No images in gallery yet</p>
                    </div>
                ) : (
                    Array.isArray(images) && images.map((image) => (
                        <div key={image.id} className="group relative aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                            <img
                                src={image.image_url}
                                alt="Gallery item"
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleDelete(image.id)}
                                    className="scale-90 hover:scale-100 transition-transform"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
