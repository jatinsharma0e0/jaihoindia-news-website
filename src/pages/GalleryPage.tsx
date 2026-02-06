import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchGalleryImages, type GalleryImage } from '@/services/api';

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await fetchGalleryImages();
      setImages(data);
    } catch (error) {
      console.error('Failed to load gallery images', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard navigation for lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null || images.length === 0) return;

    switch (e.key) {
      case 'Escape':
        setLightboxIndex(null);
        break;
      case 'ArrowLeft':
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : (images?.length || 0) - 1));
        break;
      case 'ArrowRight':
        setLightboxIndex((prev) => (prev !== null && prev < (images?.length || 0) - 1 ? prev + 1 : 0));
        break;
    }
  }, [lightboxIndex, images]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [lightboxIndex]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  };

  return (
    <Layout>
      <div className="container py-8 bg-white min-h-screen">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-news-red" />
          </div>
        ) : !images || images.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p>No images in the gallery yet.</p>
          </div>
        ) : (
          /* Gallery Grid - Masonry Layout */
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {Array.isArray(images) && images.map((img, index) => (
              <div
                key={img.id}
                className="break-inside-avoid mb-4 group cursor-pointer relative overflow-hidden rounded-md transition-all duration-300 hover:shadow-lg"
                onClick={() => openLightbox(index)}
              >
                {/* Image */}
                <img
                  src={img.image_url}
                  alt={`Gallery image ${index + 1}`}
                  loading="lazy"
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                />

                {/* Subtle Red Overlay/Border Effect on Hover */}
                <div className="absolute inset-0 border-0 group-hover:border-[3px] border-news-red/70 transition-all duration-300 rounded-md pointer-events-none z-10" />
                <div className="absolute inset-0 bg-news-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxIndex !== null && images?.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-2 text-slate-800 hover:text-news-red hover:bg-slate-100 rounded-full transition-colors z-50"
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 md:left-8 p-3 text-slate-800 hover:text-news-red hover:bg-slate-100 rounded-full transition-colors z-50 shadow-sm border border-slate-200"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 md:right-8 p-3 text-slate-800 hover:text-news-red hover:bg-slate-100 rounded-full transition-colors z-50 shadow-sm border border-slate-200"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Main Image */}
            <div
              className="relative w-full h-full max-w-7xl max-h-screen p-4 md:p-12 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image wrapper
            >
              <img
                src={images[lightboxIndex]?.image_url}
                alt="Full screen view"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-sm shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GalleryPage;
