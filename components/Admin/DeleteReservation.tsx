"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteReservationButtonProps {
  reservationId: string;
  contactName: string;
  deleteAction: (formData: FormData) => Promise<void>;
}

export default function DeleteReservationButton({
  reservationId,
  contactName,
  deleteAction,
}: DeleteReservationButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("id", reservationId);
    formData.append("contactName", contactName);

    try {
      await deleteAction(formData);
      setOpen(false); // cerrar modal al eliminar
    } catch (error) {
      console.error("Error eliminando reserva:", error);
      alert("Error al eliminar la reserva. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón papelera */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-700"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-2">
              ¿Eliminar la reserva de {contactName}?
            </h2>
            <p className="text-sm mb-6">
              Esta acción no se puede deshacer. La reserva será eliminada permanentemente.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
