"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images: { url: string; alt: string; position?: string }[] = [
    {
      url: "/galeria/refugio-flores.jpg",
      alt: "El refugio entre flores amarillas"
    },
    {
      url: "/galeria/luna-cerro.jpg",
      alt: "La luna asomando sobre las agujas del cerro"
    },
    {
      url: "/galeria/pan-casero.jpg",
      alt: "Pan casero recién cortado"
    },
    {
      url: "/galeria/condor.jpg",
      alt: "Cóndor sobrevolando el valle en otoño"
    },
    {
      url: "/galeria/subida-nieve.jpg",
      alt: "Subiendo por la nieve"
    },
    {
      url: "/galeria/pava-mate.jpg",
      alt: "Agua caliente para el mate",
      position: "50% 20%"
    },
    {
      url: "/galeria/atardecer-cerro.jpg",
      alt: "Atardecer de fuego sobre el cerro"
    },
    {
      url: "/galeria/orquidea.jpg",
      alt: "Orquídea silvestre"
    },
    {
      url: "/galeria/descanso-valle.jpg",
      alt: "Un descanso con vista al valle"
    }
  ];

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);
  const nextImage = () => selectedImage !== null && setSelectedImage((selectedImage + 1) % images.length);
  const prevImage = () => selectedImage !== null && setSelectedImage((selectedImage - 1 + images.length) % images.length);

  return (
    <section id="gallery" className="gallery-margin mb-24">
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
                  style={{ objectPosition: image.position }}
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
            <div className="relative w-full max-w-4xl max-h-full">
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
