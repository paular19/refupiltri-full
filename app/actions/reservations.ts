"use server";

import { Reservation, ReservationData } from "@/lib/types";
import { db, default as admin } from "@/lib/firebase/config";

const COLLECTION_NAME = "reservations";

// Create
export async function createReservationAction(
  reservation: ReservationData
): Promise<string> {
  console.log(reservation);
  const now = admin.firestore.Timestamp.now();
  const doc = await db.collection(COLLECTION_NAME).add(reservation);
  return doc.id;
}

// Read
export async function getReservationById(id: string): Promise<Reservation | null> {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
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
): Promise<void> {
  const docRef = db.collection(COLLECTION_NAME).doc(id);
  const updateData: any = {
    ...data,
    updatedAt: admin.firestore.Timestamp.now(),
  };

  // Convertir fechas desde el formulario
  if (data.startDate) {
    if (data.startDate instanceof Date) {
      updateData.startDate = admin.firestore.Timestamp.fromDate(data.startDate);
    } else if (typeof data.startDate === 'string') {
      updateData.startDate = admin.firestore.Timestamp.fromDate(new Date(data.startDate));
    }
  }

  if (data.endDate) {
    if (data.endDate instanceof Date) {
      updateData.endDate = admin.firestore.Timestamp.fromDate(data.endDate);
    } else if (typeof data.endDate === 'string') {
      updateData.endDate = admin.firestore.Timestamp.fromDate(new Date(data.endDate));
    }
  }

  await docRef.update(updateData);
}

// Delete
export async function deleteReservationAction(id: string): Promise<void> {
  await db.collection(COLLECTION_NAME).doc(id).delete();
}
