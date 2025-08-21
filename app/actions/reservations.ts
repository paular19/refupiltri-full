"use server";

import { Reservation } from "@/lib/types";
import { db, default as admin } from "@/lib/firebase/config";

const COLLECTION_NAME = "reservations";

// Create
import { redirect } from "next/navigation";

export async function createReservationAction(
  reservation: FormData
): Promise<void> {
  console.log(reservation);
  const now = admin.firestore.Timestamp.now();

  // convert dates from FormData, from DatePicker, into dates and then Firestore.Timestamps
  const startDateTime = reservation.get("startDate") + "T00:00:00Z";
  const endDateTime = reservation.get("endDate") + "T00:00:00Z";

  if (!startDateTime || !endDateTime) {
    throw new Error("Start date and end date are required.");
  }

  // Preparing the object to insert in the collection.
  // Dates should be firestore.Timestamp so then we ca read easily
  const reservationData = {
    createdAt: now,
    updatedAt: now,
    startDate: admin.firestore.Timestamp.fromDate(
      new Date(startDateTime as string)
    ),
    endDate: admin.firestore.Timestamp.fromDate(
      new Date(endDateTime as string)
    ),
    contactName: reservation.get("contactName"),
    contactLastName: reservation.get("contactLastName"),
    contactEmail: reservation.get("contactEmail"),
    contactPhone: reservation.get("contactPhone"),
    unit: reservation.get("unit"),
    persons: reservation.get("persons"),
    reason: reservation.get("reason"),
    origin: reservation.get("origin"),
    status: reservation.get("status"),
    includeBreakfast: reservation.get("includeBreakfast"),
    includeLunch: reservation.get("includeLunch"),
    notifyUser: reservation.get("notifyUser"),

    // Add othe r fields from FormData as needed
  };

  await db.collection(COLLECTION_NAME).add(reservationData);
  redirect("/admin");
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

