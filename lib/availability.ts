// lib/availability.ts
import { UnitType, AvailabilityDate, Reservation } from "./types";
import { UNITS } from "./constants";
import { getReservationsInDateRange } from "./firebase/reservation-server";

// Devuelve la disponibilidad de un unit entre fechas (strings 'YYYY-MM-DD')
export async function getAvailabilityForUnit(
  unit: UnitType,
  startDate: string,
  endDate: string
): Promise<AvailabilityDate[]> {

  const reservations: Reservation[] = await getReservationsInDateRange(startDate, endDate);

  const dates: string[] = [];
  let [y, m, d] = startDate.split('-').map(Number);
  let [ey, em, ed] = endDate.split('-').map(Number);

  let currentY = y;
  let currentM = m;
  let currentD = d;

  function pad(n: number) {
    return n.toString().padStart(2, '0');
  }

  while (
    currentY < ey ||
    (currentY === ey && currentM < em) ||
    (currentY === ey && currentM === em && currentD <= ed)
  ) {
    dates.push(`${currentY}-${pad(currentM)}-${pad(currentD)}`);

    currentD += 1;
    const daysInMonth = new Date(currentY, currentM, 0).getDate();
    if (currentD > daysInMonth) {
      currentD = 1;
      currentM += 1;
      if (currentM > 12) {
        currentM = 1;
        currentY += 1;
      }
    }
  }

  const availabilityDates: AvailabilityDate[] = dates.map((date) => {
    const conflictingReservations = reservations.filter((reservation) => {
      const isDateInRange = reservation.startDate <= date && date <= reservation.endDate;
      const isUnitConflicting = isUnitConflict(unit, reservation.unit as UnitType);
      const isNotCancelled = reservation.status !== "cancelled";
      return isDateInRange && isUnitConflicting && isNotCancelled;
    });

    let remainingCapacity: number;

    if (!UNITS[unit].isIndividual) {
      remainingCapacity = conflictingReservations.length > 0 ? 0 : UNITS[unit].capacity;
    } else {
      const occupied = conflictingReservations.reduce((sum, r) => sum + r.persons, 0);
      remainingCapacity = UNITS[unit].capacity - occupied;
    }

    return {
      date,
      available: remainingCapacity > 0,
      remainingCapacity: Math.max(0, remainingCapacity),
    };
  });

  return availabilityDates;
}

// Verifica si dos unidades confligen (ej. cabaña vs habitaciones)
export function isUnitConflict(unit1: UnitType, unit2: UnitType): boolean {
  if (unit1 === unit2) return true;

  const cabanaRooms = ["habitacion1", "habitacion2"];
  if ((unit1 === "cabana" && cabanaRooms.includes(unit2)) ||
      (unit2 === "cabana" && cabanaRooms.includes(unit1))) {
    return true;
  }

  return false;
}

// Chequea disponibilidad para un rango y cantidad de personas
export async function checkAvailability(
  unit: UnitType,
  persons: number,
  startDate: string,
  endDate: string
): Promise<{ available: boolean; message?: string }> {
  const availability = await getAvailabilityForUnit(unit, startDate, endDate);

  const allDatesAvailable = availability.every(d => {
    return !UNITS[unit].isIndividual ? d.available : d.remainingCapacity >= persons;
  });

  if (!allDatesAvailable) {
    const unavailableDates = availability
      .filter(d => !UNITS[unit].isIndividual ? !d.available : d.remainingCapacity < persons)
      .map(d => d.date);
    return {
      available: false,
      message: `Las siguientes fechas no están disponibles: ${unavailableDates.join(", ")}`
    };
  }

  return { available: true };
}

// Devuelve las fechas no disponibles como strings 'YYYY-MM-DD'
export async function getUnavailableDates(
  unit: UnitType,
  persons: number = 1,
  startDate: string,
  endDate: string
): Promise<string[]> {
  const availability = await getAvailabilityForUnit(unit, startDate, endDate);

  return availability
    .filter(d => !UNITS[unit].isIndividual ? !d.available : d.remainingCapacity < persons)
    .map(d => d.date);
}
