"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const BookingSuccess = () => {
  return (
    <div>
      <section id="booking-success" className="py-20 bg-light-beige relative">
        {/* Encabezado (fondo beige) */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl shadow-xl p-8 text-center"
            style={{ backgroundColor: "#6E6F30" }}
          >
            <h2 className="text-3xl font-poppins font-semibold text-[#C0DAE0] mb-4">
              ¡Reserva Confirmada!
            </h2>
            <p className="text-[#C0DAE0] font-poppins font-light mb-6">
              Gracias por tu reserva. Hemos recibido tu pago y tu reserva ha sido creada correctamente.
            </p>

            <Link
              href="/"
              className="inline-block bg-[#C0DAE0] text-[#6E6F30] py-3 px-6 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingSuccess;
