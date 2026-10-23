"use server";

import { createReservation, updateReservation } from "@/lib/reservations";
import { sendBookingConfirmation } from "@/lib/email";
import { checkAdminAuth } from "@/lib/auth/server";
import { reservationToBookingData } from "@/lib/utils";
import { ReservationData } from "@/lib/types";

export async function createReservationWithEmail(
  reservation: ReservationData,
  notifyUser: boolean
) {
  if (!(await checkAdminAuth())) {
    throw new Error("No autorizado");
  }

  const result = await createReservation(reservation);

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

export async function updateReservationWithEmail(
  reservationId: string,
  reservation: ReservationData,
  notifyUser: boolean
) {
  if (!(await checkAdminAuth())) {
    throw new Error("No autorizado");
  }

  const result = await updateReservation(reservationId, reservation);

  if (!result.success) {
    throw new Error(result.error ?? "No se pudo actualizar la reserva");
  }

  // Enviar email si corresponde
  if (notifyUser && reservation.contactEmail) {
    try {
      const bookingData = reservationToBookingData(reservation);
      await sendBookingConfirmation(bookingData, reservationId, true);
    } catch (emailError) {
      console.warn("Reserva actualizada, pero falló envío de email:", emailError);
    }
  }

  return { success: true };
}
