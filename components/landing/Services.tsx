'use client';
import React from "react";
import Image from "next/image";

const Services = () => {
  const services = [
    {
      image: "/img-serv1.jpg",
      title: "ALOJAMIENTO",
      features: ["REFUGIO COMPARTIDO", "CAMPING", "CABAÑA"],
      buttonText: "RESERVAR AHORA",
      onClick: () =>
        document
          .getElementById("booking")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      image: "/img-serv2.jpg",
      title: "GASTRONIMÍA DE MONTAÑA",
      features: [
        "DESAYUNOS",
        "ALMUERZOS & CENAS",
        "PANIFICADOS",
        "CAFETERÍA & BEBIDAS",
      ],
      buttonText: "VER MENÚ",
        onClick: () =>
        document
          .getElementById("contact")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      image: "/img-serv3.jpg",
      title: "SERVICIOS ADICIONALES",
      features: ["TRASLADOS", "SALIDAS GUIADAS", "ASESORAMIENTO"],
      buttonText: "CONSULTAR",
      onClick: () => {
        window.open("https://wa.me/5492944120310", "_blank");
      },
    },
  ];

  return (
    <section
      id="services"
      className="relative py-28"
      style={{ backgroundColor: "#C0DAE0", color: "#1A222B" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título y subtítulo */}
        <div className="px-4 md:px-8 lg:px-16 xl:px-24 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-start items-start gap-12 font-montserrat mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold leading-tight max-w-xl text-left">
              Lo que hace que el Piltri, <br />
              no sea solo un lugar.
            </h2>
            <p className="text-lg sm:text-xl leading-tight max-w-md text-left">
              Todo lo que necesitas para una estadía <br />
              memorable en la montaña
            </p>
          </div>
        </div>

        {/* Cards de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-poppins text-[#1A222B] mb-24">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {/* Imagen con Next.js */}
              <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index === 0}
                />
              </div>

              {/* Contenido */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-light mb-5" style={{ maxWidth: "280px" }}>
                  {service.title}
                </h3>

                <ul className="divide-y divide-[#1A222B] flex-grow">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="py-1 text-lg font-light" style={{ color: "#1A222B" }}>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[#1A222B] mt-8 pt-6" />

                <div className="flex flex-col items-center mt-4">
                  <button
                    onClick={service.onClick}
                    className="px-6 py-3 rounded-full font-poppins font-light transition-all duration-300 transform hover:scale-105 #1A222B"
                    
                  >
                    {service.buttonText}
                  </button>
                  <span className="text-2xl mt-1" style={{ lineHeight: 1 }}>
                    ↓
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticker */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10 w-60 h-36">
        <div className="relative w-full h-full">
          <Image src="/stiker-serv.png" alt="Sticker" fill className="object-contain" sizes="240px" />
        </div>
      </div>
    </section>
  );
};

export default Services;
