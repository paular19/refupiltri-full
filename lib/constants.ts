import { BookingData, ReservationUnit } from "./types";

export enum ORIGIN_TYPES {
  Web = "web",
  Admin = "admin",
}

export enum MP_RESERVATION_STATUS {
  Pendiente = "pending",
  Confirmada = "confirmed",
  Cancelada = "cancelled",
}

export const UNITS: Record<string, ReservationUnit> = {
  refugio: { type: "refugio", name: "Refugio", capacity: 20, isIndividual: true },
  dormitorio: {
    type: "dormitorio",
    name: "Dormitorios compartidos",
    capacity: 3, // camas en total, compartidas entre reservas
    isIndividual: true,
    allowGuestSelection: true,
    minGuests: 1,
    maxGuests: 3,
  },
  camping: { type: "camping", name: "Camping", capacity: 50, isIndividual: true },
  cabana: { type: "cabana", name: "Cabaña completa", capacity: 8, isIndividual: false },
  habitacion1: {
    type: "habitacion1",
    name: "Habitación Este",
    capacity: 4,
    isIndividual: false,
    allowGuestSelection: true,
    minGuests: 1,
    maxGuests: 4,
  },
  habitacion2: {
    type: "habitacion2",
    name: "Habitación Oeste",
    capacity: 3,
    isIndividual: false,
    allowGuestSelection: true,
    minGuests: 1,
    maxGuests: 3,
  },
};

type PriceValue = number | Record<number, number>;

export const PRICES: Record<string, PriceValue> = {
  refugio: 38000,          // por persona por noche
  camping: 18000,          // por persona por noche
  dormitorio: { 1: 120000, 2: 120000, 3: 160000 }, // por reserva por noche
  cabana: 250000,          // noches de lunes a jueves
  cabanaWeekend: 300000,   // noches de viernes, sábado, domingo y feriados
  habitacion1: { 1: 90000, 2: 90000, 3: 120000, 4: 150000 },
  habitacion2: { 1: 90000, 2: 90000, 3: 120000 },
  // Los desayunos no se cobran en la reserva: solo se registra quién lo quiere
};

// Precio final para residentes (por persona por noche). Solo refugio y camping.
export const RESIDENT_PRICES: Record<string, number> = {
  refugio: 35000,
  camping: 13000,
};

// Feriados nacionales y días no laborables "puente": sus noches se cobran como fin
// de semana en la cabaña. Actualizar cada año con el calendario oficial
// (argentina.gob.ar/interior/feriados); los trasladables y puentes de 2027 se
// agregan cuando salga el decreto.
export const HOLIDAYS = [
  // 2026
  "2026-11-23", "2026-12-07", "2026-12-08", "2026-12-25",
  // 2027 (inamovibles)
  "2027-01-01", "2027-02-08", "2027-02-09", "2027-03-24", "2027-03-26",
  "2027-04-02", "2027-05-01", "2027-05-25", "2027-06-20", "2027-07-09",
  "2027-12-08", "2027-12-25",
];

// --- HELPERS DE PRECIO ---

// Unidades que se cobran por persona. El resto se cobra por reserva según la cantidad de personas.
const PER_PERSON_UNITS = ["refugio", "camping"];

export const isPricedPerPerson = (unitType: string): boolean =>
  PER_PERSON_UNITS.includes(unitType);

export const calculateNights = (startDate?: string, endDate?: string): number => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  }
  return 0;
};

// Noches de fin de semana entre las fechas: las que empiezan viernes, sábado,
// domingo o un feriado
export const countWeekendNights = (startDate?: string, endDate?: string): number => {
  const nights = calculateNights(startDate, endDate);
  if (!nights) return 0;

  // Las fechas 'YYYY-MM-DD' se parsean en UTC, igual que en calculateNights
  const start = new Date(startDate!).getTime();
  let weekendNights = 0;
  for (let i = 0; i < nights; i++) {
    const night = new Date(start + i * 1000 * 60 * 60 * 24);
    const day = night.getUTCDay();
    const isHoliday = HOLIDAYS.includes(night.toISOString().slice(0, 10));
    if (day === 5 || day === 6 || day === 0 || isHoliday) weekendNights++;
  }
  return weekendNights;
};

export const getRoomPrice =(unitType: UnitKey, persons: number): number => {
  const price = PRICES[unitType];
  if (typeof price === "number") return price;
  if (typeof price === "object" && price !== null) return price[persons] || 0;
  return 0;
};

export const getResidentDiscount = (
  unitType: string,
  persons: number,
  nights: number,
  isResident?: boolean
): number => {
  if (!isResident) return 0;
  const residentPrice = RESIDENT_PRICES[unitType];
  if (residentPrice === undefined) return 0;
  return ((PRICES[unitType] as number) - residentPrice) * persons * nights;
};

export const getRoomTotalPrice = (
  unitType: string,
  persons: number,
  startDate: string,
  endDate: string,
  isResident?: boolean
): number => {
  const nights = calculateNights(startDate, endDate);

  if (unitType === "cabana") {
    const weekendNights = countWeekendNights(startDate, endDate);
    return (
      weekendNights * (PRICES.cabanaWeekend as number) +
      (nights - weekendNights) * (PRICES.cabana as number)
    );
  }

  const basePrice = getRoomPrice(unitType as UnitKey, persons);

  if (isPricedPerPerson(unitType)) {
    const subtotal = basePrice * persons * nights;
    const discount = getResidentDiscount(unitType, persons, nights, isResident);
    return Math.max(0, subtotal - discount);
  }

  return basePrice * nights;
};

// Total de una reserva web. Es el mismo cálculo que se muestra en el resumen (Step3)
// y el que se cobra en MercadoPago. Los desayunos no suman: no se cobran.
export const getBookingTotal = (booking: BookingData): number =>
  getRoomTotalPrice(
    booking.unit,
    booking.persons,
    booking.startDate,
    booking.endDate,
    booking.isResident
  );

export type UnitKey = keyof typeof PRICES;

export const RESERVATION_STATUS = ["pendiente", "confirmada", "cancelada"];

// El admin guarda "cancelada" y las reservas viejas/MP usan "cancelled": las dos liberan las fechas
export const isCancelledStatus = (status?: string | null): boolean =>
  status === "cancelled" || status === "cancelada";

export const ADMIN_EMAILS = [
  "ramospaula1996@gmail.com",
  "lucianoguasco@gmail.com",
  "piltriquitronpatagonia@gmail.com"
];
