"use server";

import { db, default as admin } from "@/lib/firebase/config";

const COLLECTION_NAME = "pathStatus";

/**
 * Actualiza el estado del camino (documento único con id "current").
 */
export async function updatePathStatusAction(
  newStatus: string,
  origin: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = admin.firestore.Timestamp.now();
    const docRef = db.collection(COLLECTION_NAME).doc("current");

    const data = {
      status: newStatus,
      origin,
      updatedAt: now,
    };

    await docRef.set(data, { merge: true }); // merge por si querés mantener otros campos

    return { success: true };
  } catch (err) {
    console.error("Error updating path status:", err);
    return { success: false, error: (err as Error).message };
  }
}
