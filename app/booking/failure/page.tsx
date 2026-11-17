// app/booking/failure/page.tsx
// Mercado Pago vuelve acá cuando el pago no se pudo completar. No se crea ninguna reserva.
import type { Metadata } from "next";
import { BookingStatus, WHATSAPP_URL } from "@/components/landing/Booking/BookingStatus";

export const metadata: Metadata = {
  title: "No se pudo completar el pago - Refugio Piltri",
};

export default function Page() {
  return (
    <BookingStatus
      id="booking-failure"
      title="No se pudo completar el pago"
      paragraphs={[
        "Tu pago no se procesó, así que no se hizo ningún cobro y la reserva no quedó registrada.",
        "Podés intentarlo de nuevo con otro medio de pago o escribirnos por WhatsApp y te ayudamos.",
      ]}
      actions={[
        { label: "Intentar de nuevo", href: "/#booking" },
        { label: "Escribinos por WhatsApp", href: WHATSAPP_URL, external: true },
      ]}
    />
  );
}
