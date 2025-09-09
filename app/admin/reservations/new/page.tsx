// app/admin/reservations/new/page.tsx
import AdminReservationForm from '@/components/Admin/AdminReservationForm';

export default function NewReservationPage() {
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
