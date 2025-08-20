"use client"
import React, { useState } from "react";
import Image from "next/image";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Cómo llego al refugio?",
      answer: "Te compartimos las opciones de acceso y traslado.",
      action: "Opciones →",
      icon: "/icono1-faq.png",
    },
    {
      question: "¿Cuánto tiempo se tarda en subir?",
      answer: "El tiempo de ascenso al refugio varía entre 1:30 y 2:30 horas, según el ritmo y el clima.",
      icon: "/icono2-faq.png",
    },
    {
      question: "¿Qué actividades puedo hacer además de alojarme?",
      answer: "Ofrecemos trekking, esquí de travesía, escalada en hielo y más. Te ayudamos a coordinar salidas con guías certificados.",
      icon: "/icono3-faq.png",
    },
    {
      question: "¿Dónde veo el estado del clima o del camino?",
      answer: "Podés consultarlo directamente desde nuestra plataforma o seguir las actualizaciones desde redes.",
      action: "Ver condiciones →",
      icon: "/icono4-faq.png",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20" style={{ backgroundColor: "#1A222B" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con mochila y texto */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div className="flex items-start gap-4">
            <div className="relative h-20 w-20 md:h-24 md:w-24">
              <Image src="/icon-mochila.png" alt="Mochila" fill className="object-contain" />
            </div>
            <h2 className="text-4xl font-light text-[#F7F8FA] font-poppins leading-snug text-responsive-sm">
              Lo que siempre<br />nos preguntan:
            </h2>
          </div>
          <p className="text-base text-[#F7F8FA] font-montserrat text-left max-w-md leading-relaxed">
            No hace falta subir con dudas.<br />
            Acá despejamos las más comunes...<br />
            y si falta algo, escribinos. Siempre hay lugar para una charla más.
          </p>
        </div>

        {/* Acordeón */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#F7F8FA] rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-[#E8E8E8] transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-6 w-6">
                    <Image src={faq.icon} alt="Icono" fill className="object-contain" />
                  </div>
                  <h3 className="text-lg font-poppins font-light text-[#1A222B]">
                    {faq.question}
                  </h3>
                </div>
                <span
                  className={`text-[#1A222B] text-xl font-light transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  } scale-x-150`}
                >
                  ˅
                </span>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6">
                  <div className="pl-10">
                    <p className="text-[#1A222B] font-montserrat text-base mb-4 leading-relaxed">
                      {faq.answer}
                    </p>
                    {faq.action && (
                      <button className="text-[#1A222B] font-poppins text-sm hover:underline transition-colors duration-200">
                        {faq.action}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botón final */}
        <div className="mt-16 text-center">
          <button
            onClick={() =>
              window.open(
                'https://maps.google.com/?q=Cerro+Piltriquitrón,+El+Bolsón,+Río+Negro,+Argentina',
                '_blank'
              )
            }
            className="flex items-center justify-center gap-2 mx-auto bg-[#6E6F30] text-[#F7F8FA] px-8 py-3 rounded-full font-poppins text-base font-light hover:bg-[#5e5f28] transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            <div className="relative h-5 w-5">
              <Image src="/icono5-faq.png" alt="Ubicación" fill className="object-contain" />
            </div>
            Ver ubicación en el mapa
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
