// app/booking/pending/page.tsx
// Mercado Pago vuelve acá cuando el pago queda pendiente (ej. efectivo en Pago Fácil o Rapipago).
// La reserva la crea el webhook recién cuando el pago se aprueba.
import type { Metadata } from "next";
import { BookingStatus, WHATSAPP_URL } from "@/components/landing/Booking/BookingStatus";

export const metadata: Metadata = {
  title: "Pago pendiente - Refugio Piltri",
};

export default function Page() {
  return (
    <BookingStatus
      id="booking-pending"
      title="Tu pago está pendiente"
      paragraphs={[
        "Mercado Pago todavía no acreditó tu pago. Si elegiste pagar en efectivo, acordate de hacerlo antes de que venza el cupón.",
        "Las fechas quedan reservadas recién cuando se acredita el pago. En ese momento te llega un mail con la confirmación de tu reserva.",
      ]}
      actions={[
        { label: "Volver al Inicio", href: "/" },
        { label: "Consultanos por WhatsApp", href: WHATSAPP_URL, external: true },
      ]}
    />
  );
}
