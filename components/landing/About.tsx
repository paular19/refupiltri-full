import Image from "next/image";
import React from "react";

const About = () => {
  const features = [
    {
      icon: "/icono1-ab.png",
      title: "Ubicación Privilegiada",
      description:
        "Situado en el corazón de la Comarca Andina, con vistas panorámicas de los Andes.",
    },
    {
      icon: "/icono2-ab.png",
      title: "Hospitalidad Excepcional",
      description:
        "Nuestro equipo local te brindará una experiencia auténtica y memorable.",
    },
    {
      icon: "/icono3-ab.png",
      title: "Es como estar en casa",
      description:
        "Disfruta de la montaña con alojamiento cálido y comida casera.",
    },
    {
      icon: "/icono4-ab.png",
      title: "Aventura garantizada",
      description:
        "Esquí de travesía, escalada en hielo, trekking con la mejor vista del valle.",
    },
  ];

  return (
    <section id="about" className="py-20" style={{ backgroundColor: "#6E6F30" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-poppins font-light text-white">
              Refugiáte, todo lo demás puede esperar.
            </h2>
            <p className="text-lg text-white font-montserrat leading-relaxed">
              Ubicado en el icónico Cerro Piltriquitrón de El Bolsón, nuestro refugio
              es más que un lugar: es una pausa en el camino, un rincón donde el
              tiempo se estira y la naturaleza te habla bajito.
            </p>
            <p className="text-lg text-white font-montserrat leading-relaxed">
              Hace más de 20 años que recibimos a quienes llegan buscando lo mismo: un
              poco de aventura, un poco de silencio y mucho de eso que solo la
              Patagonia sabe dar.
            </p>
            <p className="text-lg text-white font-montserrat leading-relaxed">
              Ya sea subiendo senderos o dejando que el paisaje te encuentre, cada
              visita es una forma de volver a lo simple, a lo inmenso, a lo verdadero.
            </p>
          </div>

          <div className="relative w-full h-96">
            <Image
              src="/about.jpg"
              alt="Refugio interior"
              fill
              className="rounded-2xl shadow-2xl object-cover"
            />
            <div className="absolute -bottom-6 -left-6 w-32 h-32">
              <Image
                src="/stikerabout.png"
                alt="Sticker Patagonia"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-[#5A5B29] p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 relative">
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-poppins font-light text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-white font-montserrat text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
