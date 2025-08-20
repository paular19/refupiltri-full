import { db } from "@/lib/firebase/config";

export const revalidate = 0; // no cachea, siempre muestra lo último

export default async function PathStatusView() {
  const docRef = db.collection("pathStatus").doc("current");
  const snap = await docRef.get();
  const data = snap.exists ? snap.data() : null;

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold mb-4">Estado del camino</h2>

      {data ? (
        <p>
          <strong>Actual:</strong> {data.status}{" "}
          <small className="text-gray-600">
            (Última actualización:{" "}
            {data.updatedAt?.toDate().toLocaleString() ?? "N/A"})
          </small>
        </p>
      ) : (
        <p>No hay información disponible.</p>
      )}
    </section>
  );
}
