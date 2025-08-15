"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Step3 } from "./Step3";
import { Step2 } from "./Step2";
import { Step1 } from "./Step1";
import { StepHeaders } from "./StepsHeader";
import { Info } from "./Info";
import { ReservationData } from "@/lib/types";
import { createReservationAction } from "@/app/actions/reservations";

const Booking = () => {
  const now = new Date().toISOString();
  const [formData, setFormData] = useState<ReservationData>({
    createdAt: now,
    updatedAt: now,
    startDate: now,
    endDate: now,
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
    let { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

              <form action={createReservationAction} className="space-y-6">
                {currentStep === 1 && (
                  <Step1
                    formData={formData}
                    handleInputChange={handleInputChange}
                    setCurrentStep={setCurrentStep}
                  ></Step1>
                )}
                {currentStep === 2 && (
                  <Step2
                    formData={formData}
                    handleInputChange={handleInputChange}
                    setCurrentStep={setCurrentStep}
                  ></Step2>
                )}
                {currentStep === 3 && <Step3 formData={formData}></Step3>}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
                  >
                    Confirmar Reserva
                  </button>
                </div>
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
