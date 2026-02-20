import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchTeamMembers, type GalleryImage } from '@/services/api';

const TeamPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await fetchTeamMembers();
      setImages(data);
    } catch (error) {
      console.error('Failed to load team members', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = 'unset';
  };

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && images) {
      setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
    }
  }, [lightboxIndex, images]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && images) {
      setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
    }
  }, [lightboxIndex, images]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, nextImage, prevImage]);

  return (
    <Layout>
      <div className="container py-12 bg-white min-h-screen">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-news-red mb-2">Our Team</h1>
          <div className="w-16 h-1 bg-news-red mx-auto opacity-20"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-news-red" />
          </div>
        ) : !images || images.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500">No team members to display yet.</p>
          </div>
        ) : (
          /* Team Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="group cursor-pointer bg-white border border-slate-200 hover:border-news-red/30 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onClick={() => openLightbox(index)}
              >
                <div className="overflow-hidden relative bg-slate-50 flex items-center justify-center p-1">
                  <img
                    src={img.image_url}
                    alt={img.caption || `Team Member ${index + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxIndex !== null && images?.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200" onClick={closeLightbox}>

            {/* Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 text-white/90">
              <span className="text-sm font-medium tracking-wider opacity-80">
                {lightboxIndex + 1} / {images.length}
              </span>
              <button
                onClick={closeLightbox}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all z-50 hidden md:block"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all z-50 hidden md:block"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Main Image */}
            <div
              className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[lightboxIndex].image_url}
                alt={images[lightboxIndex].caption || "Team Member"}
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeamPage;
