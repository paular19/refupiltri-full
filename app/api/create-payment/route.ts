// app/api/create-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPaymentPreference } from "@/lib/mercadopago";
import { BookingData } from "@/lib/types";
import { checkAvailability } from "@/lib/availability";
import { createReservation } from "@/lib/reservations";
import { getBookingTotal, ORIGIN_TYPES } from "@/lib/constants";
import { sendBookingConfirmation } from "@/lib/email";
import { isPastDate, validateContact } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Solo tomamos los campos que necesitamos, con los tipos correctos
    // (el form manda persons como string y otros campos que no corresponden)
    const bookingData: BookingData = {
      unit: body.unit,
      persons: Number(body.persons),
      startDate: body.startDate,
      endDate: body.endDate,
      contactName: String(body.contactName ?? "").trim(),
      contactLastName: String(body.contactLastName ?? "").trim(),
      contactEmail: String(body.contactEmail ?? "").trim(),
      contactPhone: String(body.contactPhone ?? "").trim(),
      includeBreakfastCampo: Boolean(body.includeBreakfastCampo),
      includeBreakfastAmericano: Boolean(body.includeBreakfastAmericano),
      includeDinner: Boolean(body.includeDinner),
      isResident: Boolean(body.isResident),
    };

    // El formulario ya lo pide, pero el pedido puede llegar directo a la API
    const contactErrors = validateContact(bookingData);
    if (Object.keys(contactErrors).length > 0) {
      return NextResponse.json(
        { error: Object.values(contactErrors).join(". ") },
        { status: 400 }
      );
    }

    if (isPastDate(bookingData.startDate)) {
      return NextResponse.json(
        { error: "La fecha de ingreso no puede ser anterior a hoy" },
        { status: 400 }
      );
    }

    // Validate availability before creating payment
    const availability = await checkAvailability(
      bookingData.unit,
      bookingData.persons,
      bookingData.startDate,
      bookingData.endDate
    );

    if (!availability.available) {
      return NextResponse.json(
        { error: availability.message || "Las fechas seleccionadas ya no están disponibles" },
        { status: 400 }
      );
    }

    if (getBookingTotal(bookingData) <= 0) {
      return NextResponse.json(
        { error: "Datos de reserva inválidos" },
        { status: 400 }
      );
    }

    // Create Mercado Pago preference
    if (process.env.NEXT_PUBLIC_AVOID_MP) {
      const reservationResult = await createReservation({
        ...bookingData,
        origin: ORIGIN_TYPES.Web,
        status: "sin mp",
        paymentId: "666",
      });

      if (!reservationResult.success || !reservationResult.id) {
        return NextResponse.json(
          { error: "No se pudo crear la reserva de prueba" },
          { status: 500 }
        );
      }

      // Enviar email de confirmación (mismo flujo que en webhook real)
      await sendBookingConfirmation(bookingData, reservationResult.id, false);

      return NextResponse.json({ preferenceId: "666" });
    } else {
      const preferenceId = await createPaymentPreference(bookingData);
      return NextResponse.json({ preferenceId });
    }
  } catch (error) {
    console.error("Error creating payment preference:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
