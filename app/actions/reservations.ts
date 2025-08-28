"use server";

import { Reservation, ReservationData } from "@/lib/types";
import { db, default as admin } from "@/lib/firebase/config";

const COLLECTION_NAME = "reservations";

// Create
export async function createReservationAction(
  reservation: ReservationData
): Promise<string> {
  console.log("Datos recibidos:", reservation);
  
  const now = admin.firestore.Timestamp.now();

  // Normalizar fechas antes de guardar
  const normalizedReservation = {
    ...reservation,
    startDate: normalizeDateToTimestamp(reservation.startDate),
    endDate: normalizeDateToTimestamp(reservation.endDate),
    createdAt: now,
    updatedAt: now,
  };

  console.log("Datos normalizados:", normalizedReservation);
  console.log("StartDate como Date:", normalizedReservation.startDate.toDate());
  console.log("EndDate como Date:", normalizedReservation.endDate.toDate());
  const doc = await db.collection(COLLECTION_NAME).add(normalizedReservation);
  return doc.id;
}

function normalizeDateToTimestamp(date: any): admin.firestore.Timestamp {
  console.log("Normalizando fecha:", date, "Tipo:", typeof date);
  
  if (date instanceof admin.firestore.Timestamp) {
    return date;
  }
  
  if (date instanceof Date) {
    console.log("Es Date, timestamp directo:", date.toISOString());
    return admin.firestore.Timestamp.fromDate(date);
  }
  
  if (typeof date === 'string') {
    console.log("Es string:", date);
    
    // Para formato ISO con timezone
    if (date.includes('T') && (date.endsWith('Z') || date.includes('+') || date.includes('-'))) {
      const parsedDate = new Date(date);
      console.log("Fecha parseada ISO:", parsedDate.toISOString());
      return admin.firestore.Timestamp.fromDate(parsedDate);
    }
    
    // Para formato YYYY-MM-DD - CREAR EN TIMEZONE LOCAL
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = date.split("-");
      const parsedDate = new Date(
        Number(parts[0]), // year
        Number(parts[1]) - 1, // month (0-indexed)
        Number(parts[2]), // day
        0, 0, 0, 0 // hora, minuto, segundo, milisegundo
      );
      console.log("Fecha parseada YYYY-MM-DD (local):", parsedDate.toISOString());
      return admin.firestore.Timestamp.fromDate(parsedDate);
    }
    
    // Para formato DD/MM/YYYY - CREAR EN TIMEZONE LOCAL
    if (date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const parts = date.split("/");
      const parsedDate = new Date(
        Number(parts[2]), // year
        Number(parts[1]) - 1, // month (0-indexed)
        Number(parts[0]), // day
        0, 0, 0, 0 // hora, minuto, segundo, milisegundo
      );
      console.log("Fecha parseada DD/MM/YYYY (local):", parsedDate.toISOString());
      return admin.firestore.Timestamp.fromDate(parsedDate);
    }
    
    // Para otros formatos, intentar parseo directo
    const parsedDate = new Date(date);
    console.log("Fecha parseada genérica:", parsedDate.toISOString());
    return admin.firestore.Timestamp.fromDate(parsedDate);
  }
  
  throw new Error(`Formato de fecha no válido: ${date}`);
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

  if (data.startDate) {
    updateData.startDate = normalizeDateToTimestamp(data.startDate);
  }

  if (data.endDate) {
    updateData.endDate = normalizeDateToTimestamp(data.endDate);
  }

  await docRef.update(updateData);
}

// Delete
export async function deleteReservationAction(id: string): Promise<void> {
  await db.collection(COLLECTION_NAME).doc(id).delete();
}