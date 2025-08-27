import { redirect } from "next/navigation";
import { getReservations } from "@/lib/firebase/reservation-server";
import { checkAdminAuth } from "@/lib/auth/server"; // ← Importar función real
import Reservations from "@/components/Admin/Reservations";
import Filters from "@/components/Admin/Filters";
import PathStatusSection from "@/components/Admin/PathStatusSection";

interface AdminPageProps {
  searchParams?: any;
}

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: AdminPageProps) {
  // ← Ahora usa la función real que verifica la cookie
  const isAuthorized = await checkAdminAuth();

  if (!isAuthorized) {
    redirect("/admin/login");
  }

  const includeHistory = (await searchParams)?.history === "true" || false;
  const limit = parseInt((await searchParams)?.limit || "20");

  console.log("en admin", includeHistory, limit);
  const { reservations, lastDocId } = await getReservations({
    includeHistory,
    pageSize: limit,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
          </div>
          <Filters searchParams={searchParams} />
          <Reservations reservations={reservations} />
          <PathStatusSection/>
        </div>
      </div>
    </div>
  );
}