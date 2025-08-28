import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ReservationData, BookingData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export const formToReservationData = (formData: FormData): ReservationData => {
//   return {
//     unit: formData.get("unit") as string,
//     persons: Number(formData.get("persons")),
//     startDate: new Date(formData.get("startDate") as string),
//     endDate: new Date(formData.get("endDate") as string),
//     reason: (formData.get("reason") as string) || "",
//     origin: (formData.get("origin") as string) || "",
//     status: (formData.get("status") as string) || "",
//     contactName: (formData.get("contactName") as string) || "",
//     contactLastName: (formData.get("contactLastName") as string) || "",
//     contactEmail: (formData.get("contactEmail") as string) || "",
//     contactPhone: (formData.get("contactPhone") as string) || "",
//     includeBreakfast:
//       formData.get("includeBreakfast") === "on" ||
//       formData.get("includeBreakfast") === "true",
//     includeLunch:
//       formData.get("includeLunch") === "on" ||
//       formData.get("includeLunch") === "true",
//   };
// };

export function reservationToBookingData(reservation: any): BookingData {
  return {
    unit: reservation.unit,
    persons: reservation.persons,
    startDate: reservation.startDate instanceof Date ? reservation.startDate : reservation.startDate.toDate(),
    endDate: reservation.endDate instanceof Date ? reservation.endDate : reservation.endDate.toDate(),
    contactName: reservation.contactName || '',
    contactLastName: reservation.contactLastName || '',
    contactEmail: reservation.contactEmail || '',
    contactPhone: reservation.contactPhone || '',
    includeBreakfast: reservation.includeBreakfast || false,
    includeLunch: reservation.includeLunch || false,
  };
}

// Agregar esta función auxiliar ANTES de formToReservationData
function createLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  
  // Si es formato YYYY-MM-DD del input date
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const parts = dateString.split("-");
    return new Date(
      Number(parts[0]), // year
      Number(parts[1]) - 1, // month (0-indexed)
      Number(parts[2]), // day
      0, 0, 0, 0 // medianoche local
    );
  }
  
  // Para otros formatos, usar Date constructor normal
  return new Date(dateString);
}

// REEMPLAZAR tu función formToReservationData existente con esta:
export const formToReservationData = (formData: FormData): ReservationData => {
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  
  return {
    unit: formData.get("unit") as string,
    persons: Number(formData.get("persons")),
    startDate: createLocalDate(startDateStr), // <-- CAMBIO AQUÍ
    endDate: createLocalDate(endDateStr),     // <-- CAMBIO AQUÍ
    reason: (formData.get("reason") as string) || "",
    origin: (formData.get("origin") as string) || "",
    status: (formData.get("status") as string) || "",
    contactName: (formData.get("contactName") as string) || "",
    contactLastName: (formData.get("contactLastName") as string) || "",
    contactEmail: (formData.get("contactEmail") as string) || "",
    contactPhone: (formData.get("contactPhone") as string) || "",
    includeBreakfast:
      formData.get("includeBreakfast") === "on" ||
      formData.get("includeBreakfast") === "true",
    includeLunch:
      formData.get("includeLunch") === "on" ||
      formData.get("includeLunch") === "true",
  };
};