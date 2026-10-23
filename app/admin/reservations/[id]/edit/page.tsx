// app/admin/reservations/[id]/edit/page.tsx
import { getReservationById } from "@/lib/reservations";
import { checkAdminAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import AdminReservationForm from '@/components/Admin/AdminReservationForm';
import { Reservation } from "@/lib/types";

interface EditReservationPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Función simple para serializar solo los timestamps que causan problemas
function serializeReservation(reservation: any): Reservation {
  return {
    ...reservation,
    createdAt: reservation.createdAt?.toDate ? reservation.createdAt.toDate().toISOString() : reservation.createdAt || '',
    updatedAt: reservation.updatedAt?.toDate ? reservation.updatedAt.toDate().toISOString() : reservation.updatedAt || '',
  };
}

export default async function EditReservationPage({ params }: EditReservationPageProps) {
  if (!(await checkAdminAuth())) {
    redirect("/admin/login");
  }

  const { id } = await params;

  // Obtener la reserva existente
  const rawReservation = await getReservationById(id);
  
  if (!rawReservation) {
    redirect("/admin");
  }

  // Serializar solo los campos problemáticos
  const reservation = serializeReservation(rawReservation);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold ml-4">Editar Reserva</h1>
        </div>
        
        <AdminReservationForm 
          reservation={reservation} 
          mode="edit" 
        />
      </div>
    </div>
  );
}