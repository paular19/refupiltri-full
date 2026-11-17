import React from "react";
import { BookingStatus } from "./BookingStatus";

const BookingSuccess = () => (
  <BookingStatus
    id="booking-success"
    title="¡Reserva Confirmada!"
    paragraphs={[
      "Gracias por tu reserva. Hemos recibido tu pago y tu reserva ha sido creada correctamente.",
    ]}
    actions={[{ label: "Volver al Inicio", href: "/" }]}
  />
);

export default BookingSuccess;
