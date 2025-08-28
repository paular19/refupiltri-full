"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Step3 } from "./Step3";
import { Step2 } from "./Step2";
import { Step1 } from "./Step1";
import { StepHeaders } from "./StepsHeader";
import { Info } from "./Info";
import { FormReservation } from "@/lib/types";

const Booking = () => {
  // Crear fechas en timezone local para evitar problemas de zona horaria
  const today = new Date();
  const todayStr = today.getFullYear() + "-" + 
    String(today.getMonth() + 1).padStart(2, '0') + "-" + 
    String(today.getDate()).padStart(2, '0');

  const [formData, setFormData] = useState<FormReservation>({
    createdAt: todayStr,
    updatedAt: todayStr,
    startDate: todayStr,
    endDate: todayStr,
    contactName: "",
    contactLastName: "",
    contactEmail: "",
    contactPhone: "",
    unit: "refugio",
    persons: 1,
    reason: "",
    includeBreakfast: false,
    includeLunch: false,
    notifyUser: true,
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

  const handleCreateBooking = async () => {
    try {
      // Crear objetos Date en timezone local para las fechas
      const startDate = new Date(formData.startDate + "T00:00:00"); // Forzar medianoche local
      const endDate = new Date(formData.endDate + "T00:00:00"); // Forzar medianoche local
      
      const bookingData = {
        ...formData,
        startDate,
        endDate,
      };

      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear la preferencia");
      }

      const { preferenceId } = await res.json();

      // Redirigir al checkout de Mercado Pago
      window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
    } catch (err) {
      console.error("Error creando preferencia:", err);
      alert("Hubo un problema al iniciar el pago. Intenta nuevamente.");
    }
  };

  // 📌 Render
  return (
    <div>
      <section id="booking" className="py-20 bg-light-beige relative">
        {/* Encabezado (fondo beige) */}
        <Info />

        {/* Fondo celeste + formulario */}
        <div className="relative z-0 bg-[#C0DAE0] pt-12 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div
              className="rounded-2xl shadow-xl p-8"
              style={{ backgroundColor: "#6E6F30" }}
            >
              <StepHeaders currentStep={currentStep} />

              <form className="space-y-6">
                {currentStep === 1 && (
                  <Step1
                    formData={formData}
                    handleInputChange={handleInputChange}
                    setFormData={setFormData}
                    setCurrentStep={setCurrentStep}
                  />
                )}

                {currentStep === 2 && (
                  <Step2
                    formData={formData}
                    handleInputChange={handleInputChange}
                    setCurrentStep={setCurrentStep}
                  />
                )}

                {currentStep === 3 && (
                  <>
                    <Step3 formData={formData} />
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handleCreateBooking}
                        className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
                      >
                        Confirmar Reserva
                      </button>
                    </div>
                  </>
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
    </div>
  );
};

export default Booking;