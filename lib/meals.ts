// Resumen de comidas pedidas para el panel de administración.
// La cena del día D es de quienes duermen esa noche (startDate <= D < endDate).
// El desayuno del día D es de quienes durmieron la noche anterior
// (startDate < D <= endDate): el día de salida desayunan, el de llegada no.
import { Reservation } from "./types";
import { isCancelledStatus } from "./constants";

export interface MealDay {
  date: string; // 'YYYY-MM-DD'
  breakfastCampo: number; // personas
  breakfastAmericano: number;
  dinner: number;
}

const DAY_MS = 1000 * 60 * 60 * 24;

const addDays = (date: string, days: number): string =>
  new Date(new Date(date).getTime() + days * DAY_MS).toISOString().slice(0, 10);

export function getMealSummary(
  reservations: Reservation[],
  fromDate: string,
  days: number
): MealDay[] {
  const active = reservations.filter((r) => !isCancelledStatus(r.status));

  return Array.from({ length: days }, (_, i) => {
    const date = addDays(fromDate, i);
    const day: MealDay = { date, breakfastCampo: 0, breakfastAmericano: 0, dinner: 0 };

    for (const r of active) {
      // Number(): hay reservas viejas con persons guardado como string
      const persons = Number(r.persons) || 0;
      const sleepsTonight = r.startDate <= date && date < r.endDate;
      const sleptLastNight = r.startDate < date && date <= r.endDate;

      if (sleptLastNight && r.includeBreakfastCampo) day.breakfastCampo += persons;
      if (sleptLastNight && r.includeBreakfastAmericano) day.breakfastAmericano += persons;
      if (sleepsTonight && r.includeDinner) day.dinner += persons;
    }

    return day;
  });
}
