import { Timestamp } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createReservationAction } from "@/app/actions/reservations";
import { sendBookingConfirmation } from "@/lib/email";
import { BookingData } from "@/lib/types";
import { ORIGIN_TYPES, MP_RESERVATION_STATUS } from "@/lib/constants";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Webhook body:", body);

    if (body.type === "payment" && body.data?.id) {
      const payment = new Payment(client);

      // Retry para manejar delay en la disponibilidad del pago
      let paymentData;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          paymentData = await payment.get({ id: body.data.id });
          break;
        } catch (err: any) {
          if (err.status === 404) {
            console.warn(`Payment not found, retry attempt ${attempt + 1}...`);
            await new Promise((r) => setTimeout(r, 2000)); // esperar 2s
          } else {
            throw err;
          }
        }
      }

      if (!paymentData) {
        console.error("Payment still not found after retries:", body.data.id);
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }

      if (paymentData.status === "approved") {
        // Extraer booking data
        const bookingData: BookingData = JSON.parse(
          paymentData.metadata?.booking_data || "{}"
        );

        // Convertir strings a Date para Firestore
        const startDate = new Date(bookingData.startDate);
        const endDate = new Date(bookingData.endDate);

        // Crear reserva en Firestore
        const reservationId = await createReservationAction({
          ...bookingData,
          origin: ORIGIN_TYPES.Web,
          status: MP_RESERVATION_STATUS.Pendiente,
          paymentId: paymentData.id?.toString(),
          startDate: startDate,
          endDate: endDate,
        });

        // Enviar email de confirmación
        await sendBookingConfirmation(bookingData, reservationId, false);

        console.log("Reservation created:", reservationId);
      } else {
        console.log("Payment not approved yet:", paymentData.status);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
