"use server";

import { createReservationAction } from "./reservations";
import { sendBookingConfirmation } from "@/lib/email";
import { reservationToBookingData } from "@/lib/utils";
import { ReservationData } from "@/lib/types";

export async function createReservationWithEmail(
  reservation: ReservationData,
  notifyUser: boolean
) {
  // Crear reserva usando tu action existente
  const result = await createReservationAction(reservation);

  if (!result.success || !result.id) {
    throw new Error(result.error ?? "No se pudo crear la reserva");
  }

  // Enviar email si corresponde
  if (notifyUser && reservation.contactEmail) {
    try {
      const bookingData = reservationToBookingData(reservation);
      await sendBookingConfirmation(bookingData, result.id, true);
    } catch (emailError) {
      console.warn("Reserva creada, pero falló envío de email:", emailError);
    }
  }

  return result;
}
