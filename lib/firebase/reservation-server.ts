import { Reservation } from "../types";

import { db, auth, default as admin } from "./config";

const COLLECTION_NAME = "reservations";

export async function getReservations(options: {
  includeHistory?: boolean;
  pageSize?: number;
  lastDocId?: string; // Aquí recibimos el id del último doc para paginar
}): Promise<{ reservations: Reservation[]; lastDocId?: string }> {
  const { includeHistory = false, pageSize = 20, lastDocId } = options;
  let queryRef: FirebaseFirestore.Query = admin
    .firestore()
    .collection(COLLECTION_NAME);

  if (includeHistory) {
    const today = new Date().toISOString().split("T")[0];
    queryRef = queryRef.where("endDate", "<=", today);
  }

  queryRef = queryRef.orderBy("endDate", "desc");

  if (lastDocId) {
    // Obtener documento del lastDocId para startAfter
    const lastDocSnap = await admin
      .firestore()
      .collection(COLLECTION_NAME)
      .doc(lastDocId)
      .get();
    if (lastDocSnap.exists) {
      queryRef = queryRef.startAfter(lastDocSnap);
    }
  }

  if (pageSize) {
    queryRef = queryRef.limit(pageSize);
  }

  const snapshot = await queryRef.get();

  const reservations = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    } as Reservation;
  });

  const lastDocIdResult =
    snapshot.docs.length > 0
      ? snapshot.docs[snapshot.docs.length - 1].id
      : undefined;

  return { reservations, lastDocId: lastDocIdResult };
}

export async function getReservationsInDateRange(
  startDate: String,
  endDate: String
): Promise<Reservation[]> {
  try {
    // Convertir fechas a strings en formato YYYY-MM-DD para comparar con Firestore
    const startDateString = startDate;
    const endDateString = endDate;

    console.log('Querying reservations between:', startDate, 'and', endDate);


  // Firestore limita múltiples inequalities en la misma consulta, cuidado con filtros complejos
  // Aquí un workaround sin filtro status != 'cancelled' porque admin.firestore no soporta '!=' directamente

  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where("startDate", "<=", endDate)
    .where("endDate", ">=", startDate)
    .get();
    console.log('Found reservations:', snapshot.size);


  const reservations = snapshot.docs
      .filter((doc) => {
        const data = doc.data();
        return data.status !== "cancelled";
      })
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convertir timestamps a Date si existen y son del tipo Timestamp
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        } as Reservation;
      });

    console.log('Active reservations after filtering:', reservations.length);
    
    return reservations;
  } catch (error) {
    console.error('Error in getReservationsInDateRange:', error);
    throw error;
  }
}

export async function getReservationsForUnit(
  unit: string,
  startDate: string,
  endDate: string
): Promise<Reservation[]> {
  try {

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where("unit", "==", unit)
      .where("startDate", "<=", endDate)
      .where("endDate", ">=", startDate)
      .get();

    return snapshot.docs
      .filter((doc) => doc.data().status !== "cancelled")
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
        } as Reservation;
      });
  } catch (error) {
    console.error('Error in getReservationsForUnit:', error);
    throw error;
  }
}
