import { ReservationUnit } from "./types";

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
  camping: { type: "camping", name: "Camping", capacity: 50, isIndividual: true },
  cabana: { type: "cabana", name: "Cabaña completa", capacity: 8, isIndividual: false },
  habitacion1: {
    type: "habitacion1",
    name: "Habitación Este",
    capacity: 4,
    isIndividual: false,
    allowGuestSelection: true,
    minGuests: 2,
    maxGuests: 4,
  },
  habitacion2: {
    type: "habitacion2",
    name: "Habitación Oeste",
    capacity: 3,
    isIndividual: false,
    allowGuestSelection: true,
    minGuests: 2,
    maxGuests: 3,
  },
};

type PriceValue = number | Record<number, number>;

export const PRICES: Record<string, PriceValue> = {
  refugio: 25000,          
  camping: 13000,
  cabana: 200000,
  habitacion1: { 2: 100000, 3: 140000, 4: 150000 },
  habitacion2: { 2: 100000, 3: 140000 },
  breakfastC: 12000,  
  breakfastA: 16000,
  residentDiscount: 3000,
};

// --- HELPERS DE PRECIO ---

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

export const getRoomPrice = (unitType: UnitKey, persons: number): number => {
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
  if (unitType === "refugio" || unitType === "camping") {
    return (PRICES.residentDiscount as number) * persons * nights;
  }
  return 0;
};

export const getRoomTotalPrice = (
  unitType: string,
  persons: number,
  nights: number,
  isResident?: boolean
): number => {
  const basePrice = getRoomPrice(unitType as UnitKey, persons);
  const selectedUnit = UNITS[unitType];

  if (selectedUnit?.isIndividual) {
    const subtotal = basePrice * persons * nights;
    const discount = getResidentDiscount(unitType, persons, nights, isResident);
    return Math.max(0, subtotal - discount);
  }

  return basePrice * nights;
};

export const getExtrasPrice = (
  persons: number,
  nights: number,
  includeBreakfastCampo?: boolean,
  includeBreakfastAmericano?: boolean
): number => {
  let extras = 0;
  if (includeBreakfastCampo) extras += (PRICES.breakfastC as number) * persons * nights;
  if (includeBreakfastAmericano) extras += (PRICES.breakfastA as number) * persons * nights;
  return extras;
};

export const getTotalPrice = (
  unitType: string,
  persons: number,
  nights: number,
  isResident?: boolean,
  includeBreakfastCampo?: boolean,
  includeBreakfastAmericano?: boolean
): number => {
  return (
    getRoomTotalPrice(unitType, persons, nights, isResident) +
    getExtrasPrice(persons, nights, includeBreakfastCampo, includeBreakfastAmericano)
  );
};

export type UnitKey = keyof typeof PRICES;

export const RESERVATION_STATUS = ["pendiente", "confirmada", "cancelada"];

export const ADMIN_EMAILS = [
  "ramospaula1996@gmail.com",
  "lucianoguasco@gmail.com",
  "piltriquitronpatagonia@gmail.com"
];
