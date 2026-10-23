"use client";
import React from "react";
import Image from "next/image";
import { PRICES, RESIDENT_PRICES } from "@/lib/constants";

const formatPrice = (value: number) => `$${value.toLocaleString("es-AR")}`;

const Promos = () => {
  const dormitorio = PRICES.dormitorio as Record<number, number>;
  const habitacion = PRICES.habitacion1 as Record<number, number>;

  // Opciones de alojamiento (antes eran los paquetes, que ya no se ofrecen)
  const promos = [
    {
      name: "DORMITORIOS\nCOMPARTIDOS",
      tag: "HASTA\n3 PAX",
      price: `${formatPrice(dormitorio[1])} por noche`,
      description:
        "Camas en dormitorio compartido, para 1 a 3 personas por reserva. Incluye ropa de cama.",
      extra: `1 o 2 personas ${formatPrice(dormitorio[2])} · 3 personas ${formatPrice(dormitorio[3])}`,
      icon: "/mate.png",
    },
    {
      name: "HABITACIONES\nDE LA CABAÑA",
      tag: "CABAÑA\nHASTA 4 PAX",
      price: `desde ${formatPrice(habitacion[1])} por noche`,
      description:
        "Habitación Este (hasta 4 personas) u Oeste (hasta 3 personas). Solo pernocte. Traé tu bolsa de dormir.",
      extra: `1 o 2 personas ${formatPrice(habitacion[2])} · 3 personas ${formatPrice(habitacion[3])} · 4 personas ${formatPrice(habitacion[4])}`,
      icon: "/icono2-ab.png",
      darkenIcon: true,
    },
    {
      name: "CAMPING",
      tag: "POR\nPERSONA",
      price: `${formatPrice(PRICES.camping as number)} x persona`,
      description: "Lugar para acampar, se reserva por persona y por noche. Traé tu bolsa de dormir.",
      extra: `Residentes de la Comarca Andina: ${formatPrice(RESIDENT_PRICES.camping)} x persona`,
      icon: "/icono9-rec.png",
    },
  ];

  const additionalServices = [
    {
      name: "ALQUILER DE\nCABAÑA",
      footer: "(sin comidas · traé tu bolsa de dormir)",
      color: "#C0DAE0",
      price: `desde $${(PRICES.cabana as number).toLocaleString("es-AR")}`,
      icon: "/icono2-ab.png",
      darkenIcon: true,
    },
    {
      name: "PERNOCTE\nEN REFUGIO",
      footer: "(espacio compartido · traé tu bolsa de dormir)",
      color: "#492751",
      price: `$${(PRICES.refugio as number).toLocaleString("es-AR")} x persona`,
      icon: "/icono5-rec.png",
    },
  ];

  const promoBgColors = ["#6E6F30", "#EA5239", "#F6A318"];

  return (
    <>
      <section id="promos" className="pt-36 pb-20 bg-off-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-poppins font-light text-dark-navy mb-4 text-xs-screen">
              Alojamiento & Precios
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
                className="relative rounded-[10px] shadow-xl overflow-hidden transition-all duration-300 h-[550px] w-[96%] mx-auto group flex flex-col"
              >
                {/* Vista inicial */}
                <div
                  className="absolute inset-0 flex flex-col justify-between p-6 text-left text-[#F7F8FA] transition-opacity duration-300 group-hover:opacity-0"
                  style={{ backgroundColor: promoBgColors[index] }}
                >
                  <h3 className="text-[1.75rem] font-poppins font-normal leading-tight whitespace-pre-line">
                    {promo.name}
                  </h3>
                  <div className="w-full mt-auto">
                    <hr className="border-t border-[#F7F8FA] w-full mb-2" />
                    <span className="block text-sm leading-tight font-montserrat font-light text-[#F7F8FA] uppercase whitespace-pre-line">
                      {promo.tag}
                    </span>
                  </div>
                </div>

                {/* Vista hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col">
                  {/* Header con color */}
                  <div
                    className="p-6 flex flex-row items-center justify-between"
                    style={{ backgroundColor: promoBgColors[index] }}
                  >
                    <h3 className="text-[1.75rem] font-poppins font-normal text-white leading-tight whitespace-pre-line">
                      {promo.name}
                    </h3>
                    <span className="text-sm font-montserrat font-light text-white uppercase whitespace-pre-line">
                      {promo.tag}
                    </span>
                  </div>

                  {/* Body blanco */}
                  <div className="bg-white flex-1 flex flex-col justify-between px-6 py-8">
                    {/* Arriba: sticker y descripción corta */}
                    <div className="flex flex-col items-start">
                      <div className="h-12 w-12 mb-4 relative">
                        <Image
                          src={promo.icon}
                          alt=""
                          fill
                          className={`object-contain ${promo.darkenIcon ? "brightness-0" : ""}`}
                        />
                      </div>
                      <p className="text-sm font-montserrat font-light text-dark-navy">
                        {promo.description}
                      </p>
                    </div>

                    {/* Abajo: precio y extras */}
                    <div className="flex flex-col items-start mt-6">
                      <hr
                        className="border-t w-full mb-2"
                        style={{
                          borderColor: promoBgColors[index],
                          borderWidth: "1px",
                        }}
                      />
                      <span className="text-2xl font-poppins font-semibold text-dark-navy mb-2">
                        {promo.price}
                      </span>
                      <hr
                        className="border-t w-full mt-2"
                        style={{
                          borderColor: promoBgColors[index],
                          borderWidth: "1px",
                        }}
                      />
                      <p className="text-sm font-montserrat font-light text-dark-navy mt-2">
                        {promo.extra}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Servicios adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[0.3rem] gap-y-[1.5rem] mb-12">
            {additionalServices.map((service, index) => (
              <div
                key={index}
                className="relative rounded-[10px] shadow-lg overflow-hidden transition-all duration-300 h-[250px] w-[96%] mx-auto group flex flex-col"
              >
                {/* Vista inicial */}
                <div
                  className="absolute inset-0 flex flex-col justify-between p-8 transition-opacity duration-300 group-hover:opacity-0"
                  style={{ backgroundColor: service.color }}
                >
                  <h3
                    className={`text-[1.75rem] font-poppins font-normal leading-tight whitespace-pre-line ${index === 0 ? "text-dark-navy" : "text-white"
                      }`}
                  >
                    {service.name}
                  </h3>

                  {/* Línea divisoria inicial */}
                  <hr
                    className="border-t w-full mb-2"
                    style={{
                      borderColor: index === 0 ? "#1A222B" : "#fff",
                      borderWidth: "1px",
                      marginTop: "0.5rem",
                    }}
                  />

                  <p
                    className={`text-sm font-montserrat font-light ${index === 0 ? "text-dark-navy" : "text-white"
                      }`}
                  >
                    {service.footer}
                  </p>
                </div>

                {/* Vista hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col">
                  {/* Header */}
                  <div
                    className="p-6 flex flex-row items-center justify-between"
                    style={{ backgroundColor: service.color }}
                  >
                    <h3
                      className={`text-[1.75rem] font-poppins font-normal leading-tight whitespace-pre-line ${index === 0 ? "text-dark-navy" : "text-white"
                        }`}
                    >
                      {service.name}
                    </h3>
                  </div>

                  {/* Body blanco */}
                  <div className="bg-white flex-1 flex flex-col justify-between px-6 py-8">
                    <div className="flex flex-col items-start">
                      <div className="h-12 w-12 mb-4 relative">
                        <Image
                          src={service.icon}
                          alt=""
                          fill
                          className={`object-contain ${service.darkenIcon ? "brightness-0" : ""}`}
                        />
                      </div>
                      <p className="text-sm font-montserrat font-light text-dark-navy">
                        {service.footer}
                      </p>
                    </div>
                    <div className="flex flex-col items-start mt-6">
                      {/* Línea divisoria hover */}
                      <hr
                        className="border-t w-full mb-2"
                        style={{
                          borderColor: index === 0 ? "#1A222B" : service.color,
                          borderWidth: "1px",
                          marginTop: "0.5rem",
                        }}
                      />
                      <span className="text-2xl font-poppins font-semibold text-dark-navy mb-2">
                        {service.price} por noche
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sección descuento residentes */}
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
                      Tenés precio especial
                    </span>
                  </div>
                </div>

                <hr className="border-t border-[#1A222B] w-full" style={{ borderWidth: "1px" }} />

                <p className="text-sm font-montserrat font-light text-dark-navy text-left">
                  Pagás menos en el pernocte en refugio y en el camping. Elegí la opción &quot;Soy Residente&quot; al reservar y mostranos tu DNI al llegar.
                  <br />
                  Descuento no acumulable con otras promociones.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default Promos;
