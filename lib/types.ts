export type UnitType =
  | "refugio"
  | "camping"
  | "cabana"
  | "habitacion1"
  | "habitacion2";
import { Timestamp } from "firebase-admin/firestore";
import { MP_RESERVATION_STATUS, ORIGIN_TYPES } from "./constants";

export interface ReservationUnit {
  type: UnitType;
  name: string;
  capacity: number;
  isIndividual: boolean; // true for refugio/camping, false for cabana/habitaciones
  allowGuestSelection?: boolean; // Nueva propiedad opcional
  minGuests?: number; // Nueva propiedad opcional
  maxGuests?: number; 
}

export interface Reservation {
  id: string;
  unit: UnitType;
  persons: number;
  startDate: string;
  endDate: string;
  contactName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  includeBreakfast: boolean;
  includeLunch: boolean;
  origin: "web" | "admin";
  status: "pending" | "confirmed" | "cancelled";
  paymentId?: string;
  reason?: string; // For admin bookings/blocks
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isResident?: boolean;
}

export interface AvailabilityDate {
  date: string;
  available: boolean;
  remainingCapacity: number;
}

export interface FormReservation {
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  contactName: string | null;
  contactLastName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  unit: string | null;
  persons: number | null;
  reason: string | null;
  includeBreakfast: boolean | null;
  includeLunch: boolean | null;
  notifyUser: boolean | null;
  origin?: "web" | "admin" | null;
  status?: "pending" | "confirmed" | "cancelled" | null;
  isResident: boolean | null;
}

export interface BookingData {
  unit: UnitType;
  persons: number;
  startDate: string;
  endDate: string;
  contactName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  includeBreakfast: boolean;
  includeLunch: boolean;
}

export type ReservationData = any;
