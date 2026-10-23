// Resumen de desayunos y cenas a preparar en los próximos días
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getReservationsInDateRange } from "@/lib/firebase/reservation-server";
import { getMealSummary } from "@/lib/meals";

const DAYS = 14;

export default async function MealsSummary() {
  // Fecha de hoy en Argentina, para que el resumen no se corra un día por el huso
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const last = new Date(new Date(today).getTime() + DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const reservations = await getReservationsInDateRange(today, last);
  const days = getMealSummary(reservations, today, DAYS);
  const hasMeals = days.some((d) => d.breakfastCampo || d.breakfastAmericano || d.dinner);

  return (
    <section className="bg-gray-100 p-6 rounded-lg shadow my-8">
      <h2 className="text-xl font-bold mb-1">Comidas de los próximos {DAYS} días</h2>
      <p className="text-sm text-gray-600 mb-4">
        Personas por día. La cena es de quienes duermen esa noche; el desayuno, de quienes
        durmieron la noche anterior (el día de salida desayunan, el de llegada no).
      </p>

      {!hasMeals ? (
        <p>No hay comidas pedidas en los próximos {DAYS} días.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white rounded">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Día</th>
                <th className="p-2 text-right">Desayuno de campo</th>
                <th className="p-2 text-right">Desayuno americano</th>
                <th className="p-2 text-right">Cena</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d.date} className="border-b last:border-0">
                  <td className="p-2 capitalize">
                    {format(new Date(`${d.date}T12:00:00`), "EEEE dd/MM", { locale: es })}
                  </td>
                  <td className="p-2 text-right">{d.breakfastCampo || "-"}</td>
                  <td className="p-2 text-right">{d.breakfastAmericano || "-"}</td>
                  <td className="p-2 text-right">{d.dinner || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
