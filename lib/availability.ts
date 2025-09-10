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
      // Lógica especial para el refugio
      if (unit === "refugio") {
        remainingCapacity = calculateRefugioCapacity(date, reservations);
        // Restar las personas ya reservadas en refugio
        const refugioOccupied = conflictingReservations.reduce((sum, r) => sum + r.persons, 0);
        remainingCapacity -= refugioOccupied;
      } else {
        const occupied = conflictingReservations.reduce((sum, r) => sum + r.persons, 0);
        remainingCapacity = UNITS[unit].capacity - occupied;
      }
    }

    return {
      date,
      available: remainingCapacity > 0,
      remainingCapacity: Math.max(0, remainingCapacity),
    };
  });

  return availabilityDates;
}

// Nueva función para calcular la capacidad del refugio basada en reservas de cabaña/habitaciones
function calculateRefugioCapacity(date: string, reservations: Reservation[]): number {
  const activeReservationsForDate = reservations.filter((reservation) => {
    const isDateInRange = reservation.startDate <= date && date <= reservation.endDate;
    const isNotCancelled = reservation.status !== "cancelled";
    return isDateInRange && isNotCancelled;
  });

  // Verificar si la cabaña está reservada
  const cabanaReserved = activeReservationsForDate.some(r => r.unit === "cabana");
  
  // Verificar habitaciones reservadas
  const habitacion1Reserved = activeReservationsForDate.some(r => r.unit === "habitacion1");
  const habitacion2Reserved = activeReservationsForDate.some(r => r.unit === "habitacion2");
  
  // Aplicar lógica de capacidad del refugio
  if (cabanaReserved) {
    return 10; // Si la cabaña está reservada, refugio tiene capacidad de 10
  } else if (habitacion1Reserved && habitacion2Reserved) {
    return 10; // Si ambas habitaciones están reservadas, refugio tiene capacidad de 10
  } else if (habitacion1Reserved || habitacion2Reserved) {
    return 15; // Si solo una habitación está reservada, refugio tiene capacidad de 15
  } else {
    return 20; // Capacidad completa del refugio
  }
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
  // Validación adicional de entrada
  if (!unit || !persons || !startDate || !endDate) {
    return {
      available: false,
      message: "Parámetros de reserva incompletos"
    };
  }

  if (persons <= 0) {
    return {
      available: false,
      message: "El número de personas debe ser mayor a cero"
    };
  }

  // Validar que la fecha de inicio sea anterior o igual a la fecha de fin
  if (startDate > endDate) {
    return {
      available: false,
      message: "La fecha de inicio debe ser anterior o igual a la fecha de fin"
    };
  }

  // Validar capacidad máxima de la unidad
  const unitCapacity = UNITS[unit]?.capacity;
  if (!unitCapacity) {
    return {
      available: false,
      message: "Unidad de reserva no válida"
    };
  }

  if (UNITS[unit].isIndividual && persons > unitCapacity) {
    return {
      available: false,
      message: `La unidad ${UNITS[unit].name} tiene una capacidad máxima de ${unitCapacity} personas`
    };
  }

  try {
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
        message: `Las siguientes fechas no están disponibles para ${persons} persona${persons > 1 ? 's' : ''}: ${unavailableDates.join(", ")}`
      };
    }

    return { available: true };
  } catch (error) {
    console.error("Error checking availability:", error);
    return {
      available: false,
      message: "Error al verificar disponibilidad. Intente nuevamente."
    };
  }
}

// Devuelve las fechas no disponibles como strings 'YYYY-MM-DD'
export async function getUnavailableDates(
  unit: UnitType,
  persons: number = 1,
  startDate: string,
  endDate: string
): Promise<string[]> {
  try {
    const availability = await getAvailabilityForUnit(unit, startDate, endDate);

    return availability
      .filter(d => !UNITS[unit].isIndividual ? !d.available : d.remainingCapacity < persons)
      .map(d => d.date);
  } catch (error) {
    console.error("Error getting unavailable dates:", error);
    return [];
  }
}