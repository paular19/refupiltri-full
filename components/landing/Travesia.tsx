import Image from "next/image";
import Link from "next/link";
import React from "react";

const Travesia = () => {
  const info = [
    {
      icon: "/trave-icono4.png",
      title: "TIEMPO DE MARCHA",
      description: "40 MIN DESDE PLATAFORMA\n3HS DESDE RUTA N°40",
    },
    {
      icon: "/trave-icono3.png",
      title: "DISTANCIA",
      description: "1.5KM DESDE PLATAFORMA\n10KM DESDE RUTA N°40",
    },
    {
      icon: "/trave-icono2.png",
      title: "ESTADO DEL CAMINO",
      description: <Link href="/status">VER AQUÍ</Link>,
    },
    {
      icon: "/trave-icono1.png",
      title: "ESTADO DEL CLIMA",
      description: <Link href="/status">VER AQUÍ</Link>,
    },
  ];

  const travesias: {
    title: string;
    description: string;
    items?: string[];
    image: string;
  }[] = [
    {
      title: "CAMINATAS",
      description:
        "Desde el refugio salen las caminatas a los lugares más lindos del Cerro Piltriquitrón:",
      items: ["Mirador de los Lagos", "Cumbre Huemul", "Cumbre Piltriquitrón"],
      image: "/img-serv1.jpg",
    },
    {
      title: "Cumbre al amanecer – Cerro Piltriquitrón",
      description:
        "Viví la magia de ver nacer el día desde la cumbre del Piltriquitrón. Una experiencia guiada para conectar con la montaña, caminar bajo las estrellas y recibir los primeros rayos del sol con una vista inolvidable de la cordillera y el valle de El Bolsón. Animate a vivir el amanecer desde otro lugar. Consultanos por próximas salidas y reservas.",
      image: "/img-serv1.jpg",
    },
    {
      title: "Caminata nocturna",
      description:
        "Recorré la montaña de noche, con la luz de la luna y un cielo lleno de estrellas. Una salida guiada para escuchar el silencio del cerro, mirar el cielo lejos de las luces de la ciudad y vivir el Piltriquitrón de una forma distinta. Consultanos por próximas salidas y reservas.",
      image: "/img-serv1.jpg",
    },
  ];

  return (
    <section id="about" className="pb-16 bg-white mb-16">
      {/* FILA DE ICONOS */}
      <div className="w-full bg-[#F5F2E9] py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-7xl mx-auto">
          {info.map((item, i) => (
            <div key={i} className="flex flex-col items-center px-2">
              <div className="relative w-10 h-10 mb-4">
                <Image
                  src={item.icon}
                  alt={item.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-sm font-semibold uppercase text-[#6E6F30]">
                {item.title}
              </h3>
              <p className="text-xs text-[#6E6F30] mt-1 max-w-[200px] text-center whitespace-pre-line">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* TRAVESÍAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-3xl font-normal text-[#6E6F30] mb-6 font-poppins">
          Travesías
        </h2>
        {/* Opción mejorada: Grid responsive con mejor control */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center sm:justify-items-stretch">
          {travesias.map((t, i) => (
            <div key={i} className="flex flex-col w-full max-w-sm sm:max-w-none">
              <h3 className="text-base font-semibold text-[#6E6F30] uppercase mb-2">
                {t.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                {t.description}
              </p>
              {t.items && (
                <ul className="text-gray-600 text-sm leading-relaxed mb-3 list-disc pl-5">
                  {t.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {/* mt-auto: la foto va al pie para que quede alineada entre cards */}
              <div className="relative w-full h-48 sm:h-48 lg:h-56 mt-auto">
                <Image
                  src={t.image}
                  alt={t.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Travesia;