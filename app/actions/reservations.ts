"use server";

import { Reservation, ReservationData } from "@/lib/types";
import { db, default as admin } from "@/lib/firebase/config";

const COLLECTION_NAME = "reservations";

// Create
import { redirect } from "next/navigation";

export async function createReservationAction(
  reservation: ReservationData
): Promise<string> {
  console.log(reservation);
  const now = admin.firestore.Timestamp.now();
  const doc = await db.collection(COLLECTION_NAME).add(reservation);
  return doc.id;
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

  if (data.startDate)
    updateData.startDate = admin.firestore.Timestamp.fromDate(
      data.startDate.toDate()
    );
  if (data.endDate)
    updateData.endDate = admin.firestore.Timestamp.fromDate(
      data.endDate.toDate()
    );

  await docRef.update(updateData);
}

// Delete
export async function deleteReservationAction(id: string): Promise<void> {
  await db.collection(COLLECTION_NAME).doc(id).delete();
}
