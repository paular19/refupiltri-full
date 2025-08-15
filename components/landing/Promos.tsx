import React from "react";
import Image from "next/image";

const Promos = () => {
  const promos = [
    {
      name: "PROMO\nCACIQUE",
      price: "$150.000 por persona",
    },
    {
      name: "PROMO\nCÓNDOR",
      price: "$120.000 por persona",
    },
    {
      name: "PROMO\nHALCÓN",
      price: "$65.000 por persona",
    },
  ];

  const additionalServices = [
    {
      name: "ALQUILER DE\nCABAÑA",
      footer: "(sin comidas)",
      color: "#C0DAE0",
      price: "$150.000",
    },
    {
      name: "PERNOCTE\nEN REFUGIO",
      footer: "(espacio compartido)",
      color: "#492751",
      price: "$22.000",
    },
  ];

  const promoBgColors = ["#6E6F30", "#EA5239", "#F6A318"];

  return (
    <>
      <section id="promos" className="pt-36 pb-20 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-poppins font-light text-dark-navy mb-12 text-xs-screen">
              Promociones y Precios
            </h2>
            <p className="text-sm font-montserrat text-dark-navy">
              Elige la opción que mejor se adapte a tu aventura
            </p>
          </div>

          {/* Promos principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[0.3rem] gap-y-[1.5rem] mb-6">
            {promos.map((promo, index) => (
              <div
                key={index}
                className="relative rounded-[10px] shadow-xl overflow-hidden transition-all duration-300 h-[500px] w-[96%] mx-auto group"
                style={{ backgroundColor: promoBgColors[index] }}
              >
                <div className="p-6 text-left text-[#F7F8FA] group-hover:opacity-0 transition-opacity duration-300 h-full flex flex-col justify-between">
                  <h3 className="text-[1.75rem] font-poppins font-normal leading-tight whitespace-pre-line">
                    {promo.name}
                  </h3>
                  <div className="w-full mt-auto">
                    <hr
                      className="border-t border-[#F7F8FA] w-full mb-2"
                      style={{ borderWidth: "1px" }}
                    />
                    <span className="block text-sm leading-tight font-montserrat font-light text-[#F7F8FA] uppercase">
                      CABAÑA
                      <br />
                      HASTA 8 PX
                    </span>
                  </div>
                </div>
                <div
                  className="absolute inset-0 rounded-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ backgroundColor: promoBgColors[index] }}
                >
                  <span className="text-white text-xl font-poppins font-semibold">
                    {promo.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Servicios adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[0.3rem] gap-y-[1.5rem] mb-12">
            {additionalServices.map((service, index) => (
              <div
                key={index}
                className="relative rounded-[10px] shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 group"
                style={{
                  backgroundColor: service.color,
                  width: "96%",
                  margin: "0 auto",
                }}
              >
                <div className="text-left group-hover:opacity-0 transition-opacity duration-300">
                  <h3
                    className={`text-[1.75rem] font-poppins font-normal leading-tight whitespace-pre-line mb-6 ${
                      index === 0 ? "text-[#1A222B]" : "text-[#F7F8FA]"
                    }`}
                  >
                    {service.name}
                  </h3>
                  <hr
                    className={`border-t w-full mb-2 ${
                      index === 0 ? "border-[#1A222B]" : "border-[#F7F8FA]"
                    }`}
                    style={{ borderWidth: "1px" }}
                  />
                  <p
                    className={`text-sm leading-tight font-montserrat font-light ${
                      index === 0 ? "text-[#1A222B]" : "text-[#F7F8FA]"
                    }`}
                  >
                    {service.footer}
                  </p>
                </div>
                <div
                  className="absolute inset-0 rounded-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ backgroundColor: service.color }}
                >
                  <span className="text-white text-xl font-poppins font-semibold">
                    {service.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 mt-24" style={{ width: "96%", margin: "0 auto" }}>
            <div className="flex flex-col sm:flex-row items-start gap-6">

              <div className="h-24 w-24 flex-shrink-0 relative">
                <Image
                  src="/icono-promo.png"
                  alt="Icono Promo"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">

                  <div className="w-full sm:w-1/3">
                    <h3 className="text-lg font-poppins font-normal text-dark-navy leading-snug text-left">
                      ¿Sos residente <br /> de la Comarca Andina?
                    </h3>
                  </div>

                  <div className="mt-2 sm:mt-0">
                    <span className="text-2xl sm:text-3xl font-poppins font-semibold text-[#6E6F30] text-left">
                      Tenés 20% off
                    </span>
                  </div>
                </div>

                <hr className="border-t border-[#1A222B] w-full" style={{ borderWidth: "1px" }} />

                <p className="text-sm font-montserrat font-light text-dark-navy text-left">
                  Para aplicar el descuento, solo tenés que mostrarnos tu DNI.
                  <br />
                  Descuento no acumulable con otras promociones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Imagen final */}
      <section id="img-promo" className="pt-0 pb-0">
        <div className="w-full h-[60vh] relative">
          <Image
            src="/img-banda.jpg"
            alt="Imagen Banda"
            fill
            className="object-cover"
            style={{ objectPosition: "center 85%" }}
            priority
          />
        </div>
      </section>
    </>
  );
};

export default Promos;
