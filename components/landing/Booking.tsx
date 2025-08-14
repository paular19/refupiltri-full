"use client"
import React, { useState } from "react";
import Image from "next/image";
import { Calendar, Users, Check, Clock, DollarSign } from "lucide-react";

const Booking = () => {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    roomType: "private",
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking submitted:", formData);
    alert(
      "¡Reserva enviada! Te contactaremos pronto para confirmar tu reserva."
    );
  };

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const getRoomPrice = () => {
    const prices = {
      private: 12000,
      shared: 8000,
      dorm: 5000,
    };
    return prices[formData.roomType as keyof typeof prices];
  };

  const getTotalPrice = () => {
    const nights = calculateNights();
    const roomPrice = getRoomPrice();
    return nights * roomPrice * formData.guests;
  };

  return (
    <section id="booking" className="py-20 bg-light-beige relative">
      {/* Encabezado (fondo beige) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 max-w-5xl mx-auto font-poppins gap-12">
          <div>
            <p
              className="uppercase tracking-wide text-sm mb-2 font-medium"
              style={{ color: "#1A222B" }}
            >
              RESERVAS
            </p>
            <h2
              className="text-4xl font-medium leading-tight"
              style={{ maxWidth: "480px", textAlign: "left", color: "#1A222B" }}
            >
              Tu lugar en la cima,
              <br />
              asegurado acá!
            </h2>
          </div>

          <p
            className="text-base leading-relaxed max-w-md font-montserrat font-normal mt-4"
            style={{ maxWidth: "500px", textAlign: "left", color: "#1A222B" }}
          >
            Completá el formulario y dejá que la montaña te guarde un lugar. Nosotros
            nos encargamos del fuego, del abrigo y del paisaje... Vos, solo traé
            ganas de desconectar.
          </p>
        </div>
      </div>

      {/* Fondo celeste + formulario */}
      <div className="relative z-0 bg-[#C0DAE0] pt-12 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-2xl shadow-xl p-8" style={{ backgroundColor: "#6E6F30" }}>
            {/* Indicador de pasos */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                        currentStep >= step ? "text-[#6E6F30]" : "text-[#F7F8FA]"
                      }`}
                      style={{
                        backgroundColor: currentStep >= step ? "#C0DAE0" : "#E5E7EB",
                      }}
                    >
                      {currentStep > step ? <Check size={16} /> : `${step}`}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-16 h-1 ${currentStep >= step + 1 ? "" : "bg-[#F7F8FA]"}`}
                        style={{
                          backgroundColor: currentStep >= step + 1 ? "#C0DAE0" : undefined,
                        }}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ... Tus pasos 1, 2 y 3 mantienen el mismo código ... */}
            </form>
          </div>
        </div>
      </div>

      {/* Sticker justo al final del fondo celeste */}
      <div className="relative z-10 flex justify-center -mt-[52px] w-full h-[104px]">
        <Image
          src="/stiker-reservas.png"
          alt="Sticker Reservas"
          fill
          className="object-contain"
        />
      </div>
    </section>
  );
};

export default Booking;
