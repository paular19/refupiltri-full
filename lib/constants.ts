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
    capacity: 35,
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
  },
  habitacion2: {
    type: "habitacion2",
    name: "Habitación Oeste",
    capacity: 4,
    isIndividual: false,
  },
};

export const PRICES = {
  refugio: 1, // per person per night
  camping: 3000, // per person per night
  cabana: 40000, // total per night
  habitacion1: 20000, // total per night
  habitacion2: 20000, // total per night
  breakfast: 1, // per person per day
  lunch: 3000, // per person per day
};

export type UnitKey = keyof typeof PRICES; 

export const RESERVATION_STATUS = ["pendiente", "confirmada", "cancelada"];
