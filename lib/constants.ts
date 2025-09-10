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
  refugio: {
    type: "refugio",
    name: "Refugio",
    capacity: 20,
    isIndividual: true,
  },
  camping: {
    type: "camping",
    name: "Camping",
    capacity: 50,
    isIndividual: true,
  },
  cabana: {
    type: "cabana",
    name: "Cabaña completa",
    capacity: 8,
    isIndividual: false,
  },
  habitacion1: {
    type: "habitacion1",
    name: "Habitación Este",
    capacity: 4,
    isIndividual: false,
    allowGuestSelection: true, // Nueva propiedad para permitir selección de huéspedes
    minGuests: 2, // Mínimo de huéspedes
    maxGuests: 4, // Máximo de huéspedes
  },
  habitacion2: {
    type: "habitacion2",
    name: "Habitación Oeste",
    capacity: 3,
    isIndividual: false,
    allowGuestSelection: true, // Nueva propiedad para permitir selección de huéspedes
    minGuests: 2, // Mínimo de huéspedes
    maxGuests: 3, // Máximo de huéspedes
  },
};

type PriceValue = number | Record<number, number>;

export const PRICES: Record<string, PriceValue> = {
  refugio: 1,
  camping: 13000,
  cabana: 200000,
  habitacion1: { 2: 100000, 3: 140000, 4: 150000 },
  habitacion2: { 2: 100000, 3: 140000 },
  breakfast: 1,
  lunch: 3000,
  residentDiscount: 3000,
};

// Función helper para obtener el precio de una habitación según el número de personas
export const getRoomPrice = (unitType: UnitKey, persons: number): number => {
  const price = PRICES[unitType];

  if (typeof price === 'number') return price;
  if (typeof price === 'object' && price !== null) return price[persons] || 0;

  return 0;
};


// Función helper para obtener el descuento de residente
export const getResidentDiscount = (
  unitType: string,
  persons: number,
  nights: number,
  isResident: boolean
): number => {
  if (!isResident) return 0;

  // Solo aplicar descuento para refugio y camping
  if (unitType === 'refugio' || unitType === 'camping') {
    return (PRICES.residentDiscount as number) * persons * nights;
  }

  return 0;
};

export type UnitKey = keyof typeof PRICES;

export const RESERVATION_STATUS = ["pendiente", "confirmada", "cancelada"];

export const ADMIN_EMAILS = [
  "ramospaula1996@gmail.com",
  "lucianoguasco@gmail.com",
];