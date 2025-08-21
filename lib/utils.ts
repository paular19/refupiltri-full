import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ReservationData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formToReservationData = (formData: FormData): ReservationData => {
  return {
    unit: formData.get("unit") as string,
    persons: Number(formData.get("persons")),
    startDate: new Date(formData.get("startDate") as string),
    endDate: new Date(formData.get("endDate") as string),
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
