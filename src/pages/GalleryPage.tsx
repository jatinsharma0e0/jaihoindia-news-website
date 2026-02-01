import { Layout } from '@/components/layout/Layout';

const galleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600',
    caption: 'India Gate, New Delhi',
  },
  {
    url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600',
    caption: 'Taj Mahal, Agra',
  },
  {
    url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600',
    caption: 'Gateway of India, Mumbai',
  },
  {
    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600',
    caption: 'Mumbai Skyline',
  },
  {
    url: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600',
    caption: 'Lotus Temple, Delhi',
  },
  {
    url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600',
    caption: 'Jaipur Palace',
  },
];

const GalleryPage = () => {
  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold text-foreground mb-6">Gallery</h1>
        <div className="section-divider mb-8" />
        
        <p className="text-muted-foreground mb-8">
          A visual journey through our coverage and events.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={image.url}
                alt={image.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-medium text-background">{image.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default GalleryPage;
