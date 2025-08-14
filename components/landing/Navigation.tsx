"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  const menuItems = [
    { name: 'INICIO', id: 'home' },
    { name: 'CONOCENOS', id: 'about' },
    { name: 'SERVICIOS', id: 'services' },
    { name: 'RESERVAS', id: 'booking' },
    { name: 'GALERÍA', id: 'gallery' },
    { name: 'DUDAS', id: 'faq' },
    { name: 'CONTACTO', id: 'contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 font-poppins ${
      scrolled ? 'bg-dark-navy/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <Image src="/refu-logo.png" alt="Logo Refugio Piltriquitrón" width={120} height={28} />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="text-cream text-xs font-extralight hover:text-light-blue transition-colors duration-200 tracking-wide"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-cream hover:text-light-blue transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-max-height duration-300 overflow-hidden ${
          isOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1 bg-dark-navy/95 backdrop-blur-md">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="block w-full text-left px-3 py-2 text-cream text-xs font-extralight hover:text-light-blue transition-colors duration-200 tracking-wide"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
