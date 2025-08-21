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
}

export interface Reservation {
  id: string;
  unit: UnitType;
  persons: number;
  startDate: Timestamp;
  endDate: Timestamp;
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
}

export interface AvailabilityDate {
  date: Date;
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
}

export interface BookingData {
  unit: UnitType;
  persons: number;
  startDate: Date;
  endDate: Date;
  contactName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  includeBreakfast: boolean;
  includeLunch: boolean;
}

export type ReservationData = any;
