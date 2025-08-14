"use client"
import React from 'react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-dark-navy text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-2 flex flex-col items-start">
            <div className="relative h-8 w-auto mb-4">
              <Image
                src="/refu-logo.png"
                alt="Logo Refugio Piltriquitrón"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-cream/90 mb-4 max-w-md font-montserrat text-2xl leading-snug whitespace-pre-line">
              Somos tu refugio{'\n'}en la montaña.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-poppins font-medium mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-1 font-poppins">
              {[
                { id: 'home', label: 'Inicio' },
                { id: 'conocenos', label: 'Conócenos' },
                { id: 'services', label: 'Servicios' },
                { id: 'booking', label: 'Reservas' },
                { id: 'gallery', label: 'Galería' },
                { id: 'faq', label: 'Dudas' },
                { id: 'contact', label: 'Contacto' },
              ].map(({ id, label }) => (
                <li key={id}>
                  <button
                    onClick={() =>
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="text-cream/80 hover:text-light-blue transition-colors duration-200 text-sm"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-poppins font-medium mb-4">Contacto</h3>
            <div className="space-y-2 text-cream/80 font-poppins text-sm">
              <p>+54 294 444-5555</p>
              <p>info@refugiopiltriquitron.com</p>
              <p>
                Cerro Piltriquitrón<br />
                El Bolsón, Río Negro, Argentina
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-cream/80 font-montserrat text-sm">
          <p>&copy; 2025 Refugio Piltriquitrón. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
