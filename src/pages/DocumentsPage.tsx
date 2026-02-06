import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchDocuments, type GalleryImage } from '@/services/api';

const DocumentsPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await fetchDocuments();
      setImages(data);
    } catch (error) {
      console.error('Failed to load document images', error);
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
      <div className="container py-12 bg-white min-h-screen">
        {/* Simple Header - Clean & Official */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-news-red mb-2">Official Documents</h1>
          <div className="w-16 h-1 bg-news-red mx-auto opacity-20"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-news-red" />
          </div>
        ) : !images || images.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-lg border border-slate-100 max-w-2xl mx-auto">
            <p>No official documents available at this time.</p>
          </div>
        ) : (
          /* Documents Grid - clean, minimal, responsive */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="group cursor-pointer bg-white border border-slate-200 hover:border-news-red/30 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onClick={() => openLightbox(index)}
              >
                {/* Image Container with Aspect Ratio */}
                <div className="aspect-[3/4] overflow-hidden relative bg-slate-50 flex items-center justify-center">
                  <img
                    src={img.image_url}
                    alt={`Document ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Minimal Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 p-2 rounded-full shadow-sm text-news-red transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <span className="sr-only">View</span>
                      <div className="w-6 h-6 border-2 border-news-red rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-news-red rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal - Clean, Focus on Content */}
        {lightboxIndex !== null && images?.length > 0 && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-md animate-in fade-in duration-200"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-news-red hover:bg-news-red/5 rounded-full transition-colors z-[110]"
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 md:left-8 p-3 text-slate-400 hover:text-news-red hover:bg-white rounded-full transition-all z-[110] shadow-sm border border-transparent hover:border-slate-100 hover:shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 md:right-8 p-3 text-slate-400 hover:text-news-red hover:bg-white rounded-full transition-all z-[110] shadow-sm border border-transparent hover:border-slate-100 hover:shadow-md"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Main Image */}
            <div
              className="relative w-full h-full max-w-6xl max-h-screen p-4 md:p-12 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[lightboxIndex]?.image_url}
                alt="Document View"
                className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl ring-1 ring-black/5"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DocumentsPage;
