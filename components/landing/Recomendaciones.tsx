import Image from "next/image";
import Link from "next/link";
import React from "react";

const Recomendaciones = () => {
  const recomendaciones = [
    {
      icon: "/icono1-rec.png",
      title: "AVISÁ A DONDE VAS",
      text: "NO SUBAS A LA MONTAÑA SIN INFORMARLE A UN FAMILIAR O AMIGO",
      size: "w-12 h-12",
    },
    {
      icon: "/icono2-rec.png",
      title: "MIRÁ EL CLIMA",
      text: "ES IMPORTANTE CHEQUEAR EL CLIMA ANTES DE SALIR Y ADECUAR TU VESTIMENTA A ÉL",
      size: "w-12 h-12",
    },
    {
      icon: "/icono3-rec.png",
      title: "HIDRATATE",
      text: "NO TE OLVIDES DE LLEVARTE AGUA PARA EL CAMINO!",
      size: "w-16 h-16",
    },
    {
      icon: "/icono4-rec.png",
      title: "SUBITE UN CALZADO CÓMODO EXTRA",
      text: "SUBÍ CON UNAS ALPARGATAS O CROCS PARA ANDAR EN EL REFU",
      size: "w-12 h-12",
    },
    {
      icon: "/icono5-rec.png",
      title: "TRAÉ BOLSA DE DORMIR",
      text: "SI VAS A DORMIR EN EL REFUGIO ES ESENCIAL TRAER TU BOLSA DE DORMIR",
      size: "w-12 h-12",
    },
    {
      icon: "/icono6-rec.png",
      title: "TU BASURA, VUELVE CON VOS!",
      text: "LA BASURA QUE GENERES, BAJALA CON VOS!",
      size: "w-10 h-10",
    },
    {
      icon: "/icono7-rec.png",
      title: "BOTIQUÍN PERSONAL",
      text: "MOVETE SIEMPRE EN LA MONTAÑA CON UN PEQUEÑO BOTIQUÍN PERSONAL",
      size: "w-12 h-12",
    },
    {
      icon: "/icono8-rec.png",
      title: "NO TE OLVIDES LA LINTERNA!",
      text: "ESENCIAL PARA TU SUBIDA A LA MONTAÑA",
      size: "w-12 h-12",
    },
    {
      icon: "/icono9-rec.png",
      title: "TU CARPA ESTÁ COMPLETA?",
      text: "SI VAS A VENIR EN CARPA, CHEQUEÁ QUE ESTÉ ENTERA!",
      size: "w-16 h-16",
    },
  ];

  return (
    <section id="about" className="pb-16 bg-white mb-4">
      {/* RECOMENDACIONES - Sección naranja */}
      <div className="relative py-16" style={{ backgroundColor: "#F6A318" }}>
        {/* Título centrado */}
        <div className="text-center mb-12">
          <h2 className="text-xl font-poppins font-light text-black tracking-wider max-w-md mx-auto">
            Recomendaciones
          </h2>
        </div>

        {/* Grid de recomendaciones */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-16">
            {recomendaciones.map((rec, i) => (
              <div
                key={i}
                className="bg-[#F6A318] p-4 rounded-lg shadow-lg"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`relative ${rec.size}`}>
                      <Image
                        src={rec.icon}
                        alt={rec.title}
                        fill
                        className="object-contain filter brightness-0"
                      />
                    </div>
                  </div>
                  <div className="flex-1 max-w-[180px]">
                    <h3 className="text-[11px] md:text-xs font-bold uppercase mb-1 leading-snug text-black">
                      {rec.title}
                    </h3>
                    <p className="text-[11px] md:text-xs leading-snug text-black">
                      {rec.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticker */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-20">
          <Image
            src="/logo-recomendaciones.png"
            alt="Piltriquitrón"
            width={180}
            height={180}
            className="object-contain"
          />
        </div>
      </div>

      {/* IMAGEN DE REFUGIO */}
      <div className="relative w-full h-96 pt-12">
        <Image
          src="/img-banda.jpg"
          alt="Refugio Piltriquitrón"
          fill
          className="object-cover object-[center_75%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
    </section>
  );
};

export default Recomendaciones;
