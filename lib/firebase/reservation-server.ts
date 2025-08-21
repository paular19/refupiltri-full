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

  if (!includeHistory) {
    const today = admin.firestore.Timestamp.now();
    queryRef = queryRef.where("endDate", ">=", today);
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
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as Reservation;
  });

  const lastDocIdResult =
    snapshot.docs.length > 0
      ? snapshot.docs[snapshot.docs.length - 1].id
      : undefined;

  return { reservations, lastDocId: lastDocIdResult };
}

export async function getReservationsInDateRange(
  startDate: Date,
  endDate: Date
): Promise<Reservation[]> {
  const startTimestamp =
    startDate instanceof Date ? startDate : new Date(startDate);
  const endTimestamp = endDate instanceof Date ? endDate : new Date(endDate);

  // Firestore limita múltiples inequalities en la misma consulta, cuidado con filtros complejos
  // Aquí un workaround sin filtro status != 'cancelled' porque admin.firestore no soporta '!=' directamente

  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where("startDate", "<=", endTimestamp)
    .where("endDate", ">=", startTimestamp)
    .get();

  // Filtrar cancelados en el backend (ya que no podemos hacer '!=' directo)
  const filtered = snapshot.docs.filter(
    (doc) => doc.data().status !== "cancelled"
  );

  return filtered.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Reservation;
  });
}
