import React from "react";
import Image from "next/image";

const Contact = () => {
  return (
    <section id="contact" className="py-24 relative">
      {/* Fondo rosa y blanco */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-[#EBB9D7]" />
        <div className="w-1/2 bg-[#F7F8FA]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-20 z-10 flex flex-col lg:flex-row gap-12">
        {/* Lado izquierdo */}
        <div className="w-full lg:w-1/2 pl-0 lg:pl-10 flex flex-col justify-center">
          <p className="text-sm uppercase text-[#1A222B] font-poppins font-semibold mb-2 tracking-wide">
            CONTACTO
          </p>
          <h2 className="text-4xl lg:text-5xl font-poppins font-light text-[#1A222B] mb-4">
            Hablemos!
          </h2>
          <p className="text-lg text-[#1A222B] font-montserrat font-light mb-12 leading-relaxed">
            Desde este lado, te ayudamos <br /> a trazar el camino
          </p>
          <p className="text-lg text-[#1A222B] font-poppins font-medium mb-4">
            Seguinos
          </p>
          <div className="h-[2px] bg-[#1A222B] w-full max-w-[120px] mb-6" />
          <div className="flex items-center gap-6 mb-6">
            <a href="https://www.instagram.com/piltriquitronrefugio/" target="_blank" rel="noopener noreferrer">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <Image src="/ig.png" alt="Instagram" fill className="object-contain" />
              </div>
            </a>

            <a href="https://www.facebook.com/profile.php?id=61552962930345" target="_blank" rel="noopener noreferrer">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <Image src="/fb.png" alt="Facebook" fill className="object-contain" />
              </div>
            </a>

          </div>
          <p className="text-base text-[#1A222B] font-montserrat font-medium mb-8">
            Enterate de las actualizaciones <br /> de clima y actividades
          </p>
          <p className="text-3xl text-[#1A222B] font-poppins font-light">
            Nos vemos acá arriba!
          </p>
        </div>

        {/* Lado derecho (cards) */}
        <div className="w-full lg:w-1/2">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {/* Card Teléfono */}
            <div className="w-full max-w-full min-w-0 bg-[#F7F8FA] border border-[#EBB9D7] rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                  <Image src="/icono-contacto1.png" alt="Teléfono" fill className="object-contain" />
                </div>
                <p className="text-base sm:text-lg font-poppins font-semibold text-[#1A222B]">TELÉFONO</p>
              </div>
              <p className="text-sm font-montserrat text-[#1A222B] break-words">
                WhatsApp: +54 9 294 4120 310
              </p>
              <p className="text-sm font-montserrat text-[#1A222B]">
                De 8:00hs a 20:00 hs
              </p>
            </div>

            {/* Card Mail */}
            <div className="w-full max-w-full min-w-0 bg-[#F7F8FA] border border-[#EBB9D7] rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                  <Image src="/icono-contacto2.png" alt="Email" fill className="object-contain" />
                </div>
                <p className="text-base sm:text-lg font-poppins font-semibold text-[#1A222B]">MAIL</p>
              </div>
              <p className="text-sm font-montserrat text-[#1A222B] break-words">
                piltriquitronpatagonia@gmail.com
              </p>
            </div>

            {/* Card Ubicación */}
            <div className="w-full max-w-full min-w-0 bg-[#F7F8FA] border border-[#EBB9D7] rounded-2xl p-6 sm:p-8 md:p-10 flex gap-4 sm:gap-6 items-start col-span-full">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image src="/icono-contacto3.png" alt="Ubicación" fill className="object-contain" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-poppins font-semibold text-[#1A222B] mb-4">
                  UBICACIÓN
                </p>
                <p className="text-sm font-montserrat text-[#1A222B] mb-2">
                  Cerro Piltriquitrón
                </p>
                <p className="text-sm font-montserrat text-[#1A222B] mb-6">
                  El Bolsón, Río Negro, Argentina
                </p>
                <p className="text-sm font-montserrat text-[#1A222B] mb-2">
                  Coordenadas: 41º 58&apos;08.25&quot; S / 71º 28&apos;12.51&quot;
                </p>
                <p className="text-sm font-montserrat text-[#1A222B]">
                  Ascenso: 1:30 - 2:30 horas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
