import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getReservations } from "@/lib/firebase/reservation-server";
import { checkAdminAuth } from "@/lib/auth/server";
import { deleteReservationAction } from "@/app/actions/reservations";
import Reservations from "@/components/Admin/Reservations";
import Filters from "@/components/Admin/Filters";
import PathStatusSection from "@/components/Admin/PathStatusSection";
import { LogOut } from "@/components/Admin/LogOut";

interface AdminPageProps {
  searchParams?: any;
}

export const dynamic = "force-dynamic";

async function handleDeleteReservation(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;

  const isAuthorized = await checkAdminAuth();
  if (!isAuthorized) {
    throw new Error("No autorizado");
  }

  try {
    await deleteReservationAction(id);
    revalidatePath("/admin");
  } catch (error) {
    console.error("Error deleting reservation:", error);
    throw error;
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
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
          <div className="float-right ml-2">
            <LogOut />
          </div>
          <Filters searchParams={searchParams} />
          <Reservations
            reservations={reservations}
            deleteAction={handleDeleteReservation}
          />
          <PathStatusSection />
        </div>
      </div>
    </div>
  );
}