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
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-poppins font-thin mb-4" style={{ color: '#F7F8FA' }}>
                  Detalles de la Reserva
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-poppins font-extralight mb-2" style={{ color: '#F7F8FA' }}>
                      Fecha de Entrada
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-poppins font-extralight mb-2" style={{ color: '#F7F8FA' }}>
                      Fecha de Salida
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-poppins font-extralight mb-2" style={{ color: '#F7F8FA' }}>
                      Número de Huéspedes
                    </label>
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                    >
                      {[...Array(8)].map((_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1} {i === 0 ? 'Huésped' : 'Huéspedes'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-poppins font-extralight mb-2" style={{ color: '#F7F8FA' }}>
                      Tipo de Habitación
                    </label>
                    <select
                      name="roomType"
                      value={formData.roomType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                    >
                      <option value="private">Habitación Privada ($12,000/noche)</option>
                      <option value="shared">Habitación Compartida ($8,000/noche)</option>
                      <option value="dorm">Dormitorio ($5,000/noche)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
                >
                  Continuar
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-poppins font-thin mb-4" style={{ color: '#F7F8FA' }}>
                  Información Personal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-poppins font-extralight mb-2" style={{ color: '#F7F8FA' }}>
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-poppins font-extralight mb-2" style={{ color: '#F7F8FA' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-poppins font-extralight mb-2" style={{ color: '#F7F8FA' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="p-6 rounded-lg" style={{ color: '#F7F8FA' }}>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-poppins font-normal">Fechas:</span>
                      <span>{formData.checkIn} - {formData.checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-poppins font-normal">Noches:</span>
                      <span>{calculateNights()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-poppins font-normal">Huéspedes:</span>
                      <span>{formData.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-poppins font-normal">Habitación:</span>
                      <span>
                        {formData.roomType === 'private'
                          ? 'Privada'
                          : formData.roomType === 'shared'
                          ? 'Compartida'
                          : 'Dormitorio'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-poppins font-normal">Precio por noche:</span>
                      <span>${getRoomPrice().toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-xl font-poppins font-normal">
                        <span>Total:</span>
                        <span>${getTotalPrice().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
                  >
                    Confirmar Reserva
                  </button>
                </div>
              </div>
            )}
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
