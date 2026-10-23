// Lógica de reservas solo para el servidor. No es "use server" a propósito:
// así estas funciones no quedan expuestas como endpoints públicos.
// Las server actions que las usen tienen que chequear checkAdminAuth().
import { Reservation, ReservationData, UnitType } from "@/lib/types";
import { db, default as admin } from "@/lib/firebase/config";
import { checkAvailability } from "@/lib/availability";

const COLLECTION_NAME = "reservations";

// Código gRPC que devuelve Firestore cuando create() encuentra un doc existente
const ALREADY_EXISTS = 6;

// Create
// Si se pasa docId, la reserva se crea con ese id y falla si ya existe
// (sirve para que el webhook no duplique reservas del mismo pago).
export async function createReservation(
  reservation: ReservationData,
  docId?: string
): Promise<{ success: boolean; id?: string; error?: string; duplicate?: boolean }> {
  try {
    // Validate availability before creating
    const availabilityCheck = await checkAvailability(
      reservation.unit as UnitType,
      Number(reservation.persons),
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
      persons: Number(reservation.persons),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    console.log("Creating reservation:", reservationWithTimestamps);

    if (docId) {
      await db.collection(COLLECTION_NAME).doc(docId).create(reservationWithTimestamps);
      return { success: true, id: docId };
    }

    const doc = await db.collection(COLLECTION_NAME).add(reservationWithTimestamps);
    return { success: true, id: doc.id };
  } catch (error: any) {
    if (docId && error?.code === ALREADY_EXISTS) {
      return { success: true, id: docId, duplicate: true };
    }
    console.error("Error creating reservation:", error);
    return {
      success: false,
      error: "Error interno del servidor. Intente nuevamente.",
    };
  }
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
export async function updateReservation(
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
      const persons = Number(data.persons || currentReservation.persons);
      const startDate = data.startDate || currentReservation.startDate; // string
      const endDate = data.endDate || currentReservation.endDate;       // string

      // Se excluye la propia reserva para que no choque consigo misma
      const availabilityCheck = await checkAvailability(
        unit,
        persons,
        startDate,
        endDate,
        id
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
    if (data.persons !== undefined) {
      updateData.persons = Number(data.persons);
    }
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
export async function deleteReservation(id: string): Promise<void> {
  await db.collection(COLLECTION_NAME).doc(id).delete();
}
