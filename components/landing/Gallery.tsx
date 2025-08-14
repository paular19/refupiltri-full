"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [
    {
      url: "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      alt: "Vista panorámica del refugio"
    },
    {
      url: "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      alt: "Interior acogedor del refugio"
    },
    {
      url: "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      alt: "Habitación con vista a la montaña"
    },
    {
      url: "https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      alt: "Sendero hacia el refugio"
    },
    {
      url: "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      alt: "Lago cercano al refugio"
    },
    {
      url: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      alt: "Comedor del refugio"
    },
    {
      url: "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      alt: "Actividades al aire libre"
    },
    {
      url: "https://images.pexels.com/photos/1420440/pexels-photo-1420440.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      alt: "Atardecer en la montaña"
    },
    {
      url: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
      alt: "Flora local"
    }
  ];

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);
  const nextImage = () => selectedImage !== null && setSelectedImage((selectedImage + 1) % images.length);
  const prevImage = () => selectedImage !== null && setSelectedImage((selectedImage - 1 + images.length) % images.length);

  return (
    <section id="gallery" className="gallery-margin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-poppins font-normal text-dark-navy mb-4">
            Imágenes que no le hacen justicia... pero casi.
          </h2>
          <p className="text-xl text-dark-navy font-montserrat font-normal">
            Paisajes que no hacen ruido, momentos que no necesitan palabras. Así se ve el Piltri cuando lo dejás ser.
          </p>
        </div>

        {/* Grid de imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              onClick={() => openLightbox(index)}
            >
              <div className="relative w-full h-64">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-jeko font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Ver imagen
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X size={32} />
              </button>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
              >
                <ChevronRight size={32} />
              </button>
              <div className="relative w-full h-[80vh]">
                <Image
                  src={images[selectedImage].url}
                  alt={images[selectedImage].alt}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white text-lg font-jeko font-medium">
                  {images[selectedImage].alt}
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  {selectedImage + 1} de {images.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
