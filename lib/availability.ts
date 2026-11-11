// lib/availability.ts
import { UnitType, AvailabilityDate, Reservation } from "./types";
import { UNITS, isCancelledStatus } from "./constants";
import { getReservationsInDateRange } from "./firebase/reservation-server";

// Devuelve la disponibilidad de un unit entre fechas (strings 'YYYY-MM-DD')
// Cada fecha es una noche: una reserva ocupa de startDate a la noche anterior a endDate,
// así el día de salida otra persona puede entrar al mismo lugar.
// excludeReservationId: reserva a ignorar (al editar, para que no choque consigo misma)
export async function getAvailabilityForUnit(
  unit: UnitType,
  startDate: string,
  endDate: string,
  excludeReservationId?: string
): Promise<AvailabilityDate[]> {

  const reservations: Reservation[] = (await getReservationsInDateRange(startDate, endDate))
    .filter((r) => r.id !== excludeReservationId);

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
      const isDateInRange = reservation.startDate <= date && date < reservation.endDate;
      const isUnitConflicting = isUnitConflict(unit, reservation.unit as UnitType);
      const isNotCancelled = !isCancelledStatus(reservation.status);
      return isDateInRange && isUnitConflicting && isNotCancelled;
    });

    let remainingCapacity: number;

    if (!UNITS[unit].isIndividual) {
      // Cada reserva ocupa la unidad entera: con una reserva esa noche ya no entra otra
      remainingCapacity = conflictingReservations.length > 0 ? 0 : UNITS[unit].capacity;

      // La cabaña y sus habitaciones no se alquilan si el refugio ya está usando esos lugares
      if (
        remainingCapacity > 0 &&
        CABANA_UNITS.includes(unit) &&
        getRefugioOccupied(date, reservations) > calculateRefugioCapacity(date, reservations, unit)
      ) {
        remainingCapacity = 0;
      }
    } else {
      // Lógica especial para el refugio
      if (unit === "refugio") {
        remainingCapacity = calculateRefugioCapacity(date, reservations) - getRefugioOccupied(date, reservations);
      } else {
        const occupied = conflictingReservations.reduce((sum, r) => sum + Number(r.persons), 0);
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

const CABANA_UNITS: UnitType[] = ["cabana", "habitacion1", "habitacion2"];

const activeReservationsOn = (date: string, reservations: Reservation[]) =>
  reservations.filter((reservation) => {
    const isDateInRange = reservation.startDate <= date && date < reservation.endDate;
    return isDateInRange && !isCancelledStatus(reservation.status);
  });

// Personas anotadas en el refugio esa noche
// Number(): hay reservas viejas con persons guardado como string
const getRefugioOccupied = (date: string, reservations: Reservation[]): number =>
  activeReservationsOn(date, reservations)
    .filter((r) => r.unit === "refugio")
    .reduce((sum, r) => sum + Number(r.persons), 0);

// El refugio tiene 10 lugares propios y usa 10 más de la cabaña cuando no está alquilada.
// Una habitación alquilada le resta 4; las dos o la cabaña completa le sacan los 10.
// extraUnit: una unidad que se quiere alquilar, para ver cómo quedaría el refugio
function calculateRefugioCapacity(date: string, reservations: Reservation[], extraUnit?: UnitType): number {
  const units: string[] = activeReservationsOn(date, reservations).map((r) => r.unit);
  if (extraUnit) units.push(extraUnit);

  const habitacion1Reserved = units.includes("habitacion1");
  const habitacion2Reserved = units.includes("habitacion2");

  if (units.includes("cabana") || (habitacion1Reserved && habitacion2Reserved)) return 10;
  if (habitacion1Reserved || habitacion2Reserved) return 16;
  return 20;
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
  endDate: string,
  excludeReservationId?: string
): Promise<{ available: boolean; message?: string }> {
  // Validación adicional de entrada
  if (!unit || !persons || !startDate || !endDate) {
    return {
      available: false,
      message: "Parámetros de reserva incompletos"
    };
  }

  persons = Number(persons);
  if (!Number.isInteger(persons) || persons <= 0) {
    return {
      available: false,
      message: "El número de personas debe ser mayor a cero"
    };
  }

  // Validar que la fecha de inicio sea anterior o igual a la fecha de fin
  if (startDate >= endDate) {
    return {
      available: false,
      message: "La fecha de inicio de tu estadía debe ser anterior a la fecha de fin."
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

  // Tope de personas por reserva: el cupo en refugio/camping, maxGuests en dormitorio y habitaciones
  // (el formulario ya lo limita, pero una reserva puede llegar directo a la API)
  const maxPersons = UNITS[unit].maxGuests ?? unitCapacity;
  if (persons > maxPersons) {
    return {
      available: false,
      message: `La unidad ${UNITS[unit].name} tiene una capacidad máxima de ${maxPersons} personas`
    };
  }

  try {
    // Solo cuentan las noches: el día de salida no se ocupa
    const availability = (await getAvailabilityForUnit(unit, startDate, endDate, excludeReservationId))
      .filter(d => d.date < endDate);

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
  endDate: string,
  excludeReservationId?: string
): Promise<string[]> {
  try {
    const availability = await getAvailabilityForUnit(unit, startDate, endDate, excludeReservationId);

    return availability
      .filter(d => !UNITS[unit].isIndividual ? !d.available : d.remainingCapacity < persons)
      .map(d => d.date);
  } catch (error) {
    console.error("Error getting unavailable dates:", error);
    return [];
  }
}