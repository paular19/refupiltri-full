"use client"
import React from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';


const Hero = () => {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.jpg"
          alt="Mountain landscape"
          fill
          className="object-cover object-bottom"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto h-full flex items-end pb-16">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(350px,55%)_minmax(300px,45%)] gap-16 items-end">

          {/* Título */}
          <div className="self-start text-left max-w-[500px]">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-poppins font-extralight text-white leading-tight animate-fade-in tracking-tight">
              <span className="whitespace-nowrap">
                Somos tu <span className="italic">refugio</span>,
              </span>
              <br />
              <span className="whitespace-nowrap">todo el año</span>
            </h1>


          </div>

          {/* Texto + botón */}
          <div className="text-left max-w-[500px]">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-cream mb-6 font-montserrat animate-slide-up leading-relaxed">
              Donde el lujo está en la simpleza, la montaña se vuelve hogar y el paladar encuentra su cima.
            </p>
            <button
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-full font-poppins font-light transition-all duration-300 transform hover:scale-105 text-white"
              style={{ backgroundColor: '#6E6F30' }}
            >
              Reservar ahora
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-float">
        <button
          onClick={scrollToAbout}
          className="text-cream hover:text-light-blue transition-colors duration-300"
          aria-label="Scroll to About section"
        >
          <ChevronDown size={32} />
        </button>
      </div>
    </section>
  );
};

export default Hero;
