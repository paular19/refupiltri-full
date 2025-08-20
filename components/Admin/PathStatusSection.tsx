// app/components/Admin/PathStatusSection.tsx
import { db } from "@/lib/firebase/config";
import { updatePathStatusAction } from "@/app/actions/roadUpdate";

export const revalidate = 0; // para que no cachee y siempre lea lo último

export default async function PathStatusSection() {
  // Traemos el estado actual
  const docRef = db.collection("pathStatus").doc("current");
  const snap = await docRef.get();
  const data = snap.exists ? snap.data() : null;

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold mb-4">Estado del camino</h2>

      {/* Mostramos estado actual */}
      {data ? (
        <p className="mb-4">
          <strong>Actual:</strong> {data.status}{" "}
          <small className="text-gray-600">
            (Última actualización:{" "}
            {data.updatedAt?.toDate().toLocaleString() ?? "N/A"})
          </small>
        </p>
      ) : (
        <p className="mb-4">No hay información disponible.</p>
      )}

      {/* Form para actualizar */}
      <form
        action={async (formData: FormData) => {
          "use server";
          const status = formData.get("status") as string;
          await updatePathStatusAction(status, "admin");
        }}
        className="space-y-4"
      >
        <textarea
          name="status"
          placeholder="Escribe el estado del camino..."
          className="w-full border rounded p-2"
          rows={3}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Guardar
        </button>
      </form>
    </section>
  );
}
