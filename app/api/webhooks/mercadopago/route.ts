import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createReservation, getReservationById } from "@/lib/reservations";
import { sendAdminAlert, sendBookingConfirmation } from "@/lib/email";
import { BookingData } from "@/lib/types";
import { ORIGIN_TYPES } from "@/lib/constants";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const headers = Object.fromEntries(request.headers.entries());
    console.log("🌐 Webhook recibido");
    console.log("Headers:", headers);

    const body = await request.json();
    console.log("📦 Body recibido:", JSON.stringify(body, null, 2));

    if (body.type === "payment" && body.data?.id) {
      const payment = new Payment(client);

      // Retry con reintentos porque a veces MP tarda en tener el pago listo
      let paymentData: any;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          paymentData = await payment.get({ id: body.data.id });
          console.log(`✅ Pago encontrado en intento ${attempt + 1}`);
          break;
        } catch (err: any) {
          if (err.status === 404) {
            console.warn(`⚠️ Pago no encontrado, intento ${attempt + 1}...`);
            await new Promise((r) => setTimeout(r, 2000)); // esperar 2s
          } else {
            console.error("❌ Error al obtener pago:", err);
            throw err;
          }
        }
      }

      if (!paymentData) {
        console.error("🚨 Payment sigue sin encontrarse después de 5 intentos:", body.data.id);
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }

      console.log("📌 PaymentData completo:", JSON.stringify(paymentData, null, 2));

      if (paymentData.status === "approved") {
        console.log("🎉 Pago aprobado, procesando reserva...");

        // Extraer booking data
        const bookingRaw = paymentData.metadata?.booking_data;
        console.log("🗂 Metadata.booking_data:", bookingRaw);

        let bookingData: BookingData | null = null;
        try {
          bookingData = bookingRaw ? JSON.parse(bookingRaw) : null;
        } catch (err) {
          console.error("❌ Error parseando metadata.booking_data:", err);
        }

        if (!bookingData) {
          console.error("🚨 No se encontró booking_data en metadata");
          return NextResponse.json({ error: "Missing booking_data" }, { status: 400 });
        }

        // MP manda varias notificaciones por el mismo pago: usamos el id del pago
        // como id de la reserva para no crearla (ni mandar mails) dos veces.
        const paymentId = paymentData.id?.toString();
        const reservationId = `mp-${paymentId}`;

        if (await getReservationById(reservationId)) {
          console.log("ℹ️ La reserva de este pago ya existe:", reservationId);
          return NextResponse.json({ received: true });
        }

        // Crear reserva en Firestore
        const reservationResult = await createReservation(
          {
            ...bookingData,
            origin: ORIGIN_TYPES.Web,
            status: paymentData.status,
            paymentId,
          },
          reservationId
        );

        console.log("📝 Resultado createReservation:", reservationResult);

        if (reservationResult.duplicate) {
          console.log("ℹ️ La reserva de este pago ya existe:", reservationId);
          return NextResponse.json({ received: true });
        }

        if (!reservationResult.success || !reservationResult.id) {
          // Otra notificación del mismo pago pudo haberla creado mientras tanto
          if (await getReservationById(reservationId)) {
            return NextResponse.json({ received: true });
          }

          // El pago está aprobado pero no hay reserva (ej. alguien reservó esas fechas
          // mientras esta persona pagaba). Hay que avisar para devolver el dinero.
          console.error("🚨 Pago aprobado sin reserva:", paymentId, reservationResult.error);
          await sendAdminAlert(
            `URGENTE: pago aprobado sin reserva - ${bookingData.contactName} ${bookingData.contactLastName}`,
            [
              "Se aprobó un pago en MercadoPago pero no se pudo crear la reserva.",
              "Hay que contactar al cliente y/o devolver el dinero.",
              "",
              `Motivo: ${reservationResult.error}`,
              `Pago MP: ${paymentId}`,
              `Monto: $${paymentData.transaction_amount}`,
              `Unidad: ${bookingData.unit} - ${bookingData.persons} persona(s)`,
              `Fechas: ${bookingData.startDate} a ${bookingData.endDate}`,
              `Cliente: ${bookingData.contactName} ${bookingData.contactLastName}`,
              `Email: ${bookingData.contactEmail}`,
              `Teléfono: ${bookingData.contactPhone}`,
            ].join("\n")
          );
          // 200 para que MP no reintente: reintentar no va a liberar las fechas
          return NextResponse.json({ received: true });
        }

        // Enviar email de confirmación
        console.log("📨 Enviando email de confirmación...");
        await sendBookingConfirmation(bookingData, reservationResult.id, false);

        console.log("✅ Reserva creada y email enviado:", reservationResult.id);
      } else {
        console.log("⌛ Pago recibido pero no aprobado aún:", paymentData.status);
      }
    } else {
      console.log("ℹ️ Webhook recibido pero no es tipo 'payment':", body.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("🔥 Error en webhook:", error);
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 });
  }
}
