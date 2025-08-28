// app/api/create-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPaymentPreference } from "@/lib/mercadopago";
import { BookingData } from "@/lib/types";
import { checkAvailability } from "@/lib/availability";
import { createReservationAction } from "@/app/actions/reservations";
import { ORIGIN_TYPES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json();

    // Validate availability before creating payment
    const isAvailable = await checkAvailability(
      bookingData.unit,
      bookingData.persons,
      bookingData.startDate,
      bookingData.endDate
    );

    if (!isAvailable) {
      return NextResponse.json(
        { error: "Las fechas seleccionadas ya no están disponibles" },
        { status: 400 }
      );
    }

    // Create Mercado Pago preference
    if (process.env.NEXT_PUBLIC_AVOID_MP) {
      await createReservationAction({
        ...bookingData,
        origin: ORIGIN_TYPES.Web,
        status: "sin mp",
        paymentId: "666",
      });
      return NextResponse.json({ prefereneId: "666" });
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
