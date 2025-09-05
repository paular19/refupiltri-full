"use server";

import { Reservation, ReservationData, UnitType } from "@/lib/types";
import { db, default as admin } from "@/lib/firebase/config";
import { checkAvailability } from "@/lib/availability";

const COLLECTION_NAME = "reservations";

// Create
export async function createReservationAction(
  reservation: ReservationData
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Validate availability before creating
    const availabilityCheck = await checkAvailability(
      reservation.unit as UnitType,
      reservation.persons,
      reservation.startDate, // string 'YYYY-MM-DD'
      reservation.endDate    // string 'YYYY-MM-DD'
    );

    if (!availabilityCheck.available) {
      return {
        success: false,
        error: availabilityCheck.message || "No hay disponibilidad para las fechas seleccionadas",
      };
    }

    // Add timestamps
    const reservationWithTimestamps = {
      ...reservation,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    console.log("Creating reservation:", reservationWithTimestamps);
    const doc = await db.collection(COLLECTION_NAME).add(reservationWithTimestamps);

    return {
      success: true,
      id: doc.id,
    };
  } catch (error) {
    console.error("Error creating reservation:", error);
    return {
      success: false,
      error: "Error interno del servidor. Intente nuevamente.",
    };
  }
}

// Create with override (for admin use)
export async function createReservationWithOverride(
  reservation: ReservationData
): Promise<string> {
  const reservationWithTimestamps = {
    ...reservation,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  };

  console.log("Creating reservation with admin override:", reservationWithTimestamps);
  const doc = await db.collection(COLLECTION_NAME).add(reservationWithTimestamps);
  return doc.id;
}

// Read
export async function getReservationById(
  id: string
): Promise<Reservation | null> {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (doc.exists) {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Reservation;
    } else {
      console.log("No reservation found with ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Error getting reservation:", error);
    throw error;
  }
}

// Update
export async function updateReservationAction(
  id: string,
  data: Partial<Reservation>
): Promise<{ success: boolean; error?: string }> {
  try {
    // If updating dates or unit, validate availability
    if (data.startDate || data.endDate || data.unit || data.persons) {
      const currentReservation = await getReservationById(id);
      if (!currentReservation) {
        return {
          success: false,
          error: "Reserva no encontrada",
        };
      }

      const unit = (data.unit || currentReservation.unit) as UnitType;
      const persons = data.persons || currentReservation.persons;
      const startDate = data.startDate || currentReservation.startDate; // string
      const endDate = data.endDate || currentReservation.endDate;       // string

      const availabilityCheck = await checkAvailability(
        unit,
        persons,
        startDate,
        endDate
      );

      if (!availabilityCheck.available) {
        return {
          success: false,
          error: availabilityCheck.message || "No hay disponibilidad para las fechas seleccionadas",
        };
      }
    }

    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const updateData: any = {
      ...data,
      updatedAt: admin.firestore.Timestamp.now(),
    };
    await docRef.update(updateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating reservation:", error);
    return {
      success: false,
      error: "Error interno del servidor. Intente nuevamente.",
    };
  }
}

// Delete
export async function deleteReservationAction(id: string): Promise<void> {
  await db.collection(COLLECTION_NAME).doc(id).delete();
}
