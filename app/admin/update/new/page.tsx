// app/admin/page.tsx
import { updatePathStatusAction } from "@/app/actions/roadUpdate";

export default function AdminPage() {
  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Actualizar estado del camino</h1>

      <form
        action={async (formData: FormData) => {
          "use server";

          const status = formData.get("status") as string;
          await updatePathStatusAction(status, "admin-panel");
        }}
        className="space-y-4"
      >
        <textarea
          name="status"
          placeholder="Escribe el estado del camino..."
          className="w-full border rounded p-2"
          rows={4}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
