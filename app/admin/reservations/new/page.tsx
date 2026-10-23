// app/admin/reservations/new/page.tsx
import { redirect } from "next/navigation";
import { checkAdminAuth } from "@/lib/auth/server";
import AdminReservationForm from '@/components/Admin/AdminReservationForm';

export default async function NewReservationPage() {
  if (!(await checkAdminAuth())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold ml-4">Nueva Reserva</h1>
        </div>

        <AdminReservationForm />
      </div>
    </div>
  );
}
