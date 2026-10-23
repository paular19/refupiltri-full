import { describe, it, expect } from "vitest";
import {
  PRICES,
  RESIDENT_PRICES,
  UNITS,
  HOLIDAYS,
  calculateNights,
  countWeekendNights,
  getRoomPrice,
  getResidentDiscount,
  getRoomTotalPrice,
  getBookingTotal,
  isPricedPerPerson,
  isCancelledStatus,
} from "@/lib/constants";
import { BookingData } from "@/lib/types";

const booking = (overrides: Partial<BookingData>): BookingData => ({
  unit: "refugio",
  persons: 1,
  startDate: "2026-11-10", // martes
  endDate: "2026-11-11",
  contactName: "",
  contactLastName: "",
  contactEmail: "",
  contactPhone: "",
  includeBreakfastCampo: false,
  includeBreakfastAmericano: false,
  ...overrides,
});

describe("precios vigentes", () => {
  it("tienen los valores acordados", () => {
    expect(PRICES.refugio).toBe(38000);
    expect(PRICES.camping).toBe(18000);
    expect(PRICES.dormitorio).toEqual({ 1: 120000, 2: 120000, 3: 160000 });
    expect(PRICES.cabana).toBe(250000);
    expect(PRICES.cabanaWeekend).toBe(300000);
    expect(PRICES.habitacion1).toEqual({ 1: 90000, 2: 90000, 3: 120000, 4: 150000 });
    expect(PRICES.habitacion2).toEqual({ 1: 90000, 2: 90000, 3: 120000 });
    expect(RESIDENT_PRICES).toEqual({ refugio: 35000, camping: 13000 });
  });

  it("los desayunos ya no tienen precio", () => {
    expect(PRICES.breakfastC).toBeUndefined();
    expect(PRICES.breakfastA).toBeUndefined();
  });

  it("solo refugio y camping se cobran por persona", () => {
    expect(isPricedPerPerson("refugio")).toBe(true);
    expect(isPricedPerPerson("camping")).toBe(true);
    for (const unit of ["dormitorio", "cabana", "habitacion1", "habitacion2"]) {
      expect(isPricedPerPerson(unit)).toBe(false);
    }
  });

  it("cupos de cada unidad", () => {
    expect(UNITS.refugio.capacity).toBe(20);
    expect(UNITS.camping.capacity).toBe(50);
    expect(UNITS.dormitorio.capacity).toBe(3);
    expect(UNITS.cabana.capacity).toBe(8);
    expect(UNITS.habitacion1).toMatchObject({ capacity: 4, minGuests: 1, maxGuests: 4 });
    expect(UNITS.habitacion2).toMatchObject({ capacity: 3, minGuests: 1, maxGuests: 3 });
    expect(UNITS.dormitorio).toMatchObject({ minGuests: 1, maxGuests: 3 });
  });
});

describe("calculateNights", () => {
  it("cuenta noches entre fechas", () => {
    expect(calculateNights("2026-11-10", "2026-11-11")).toBe(1);
    expect(calculateNights("2026-11-10", "2026-11-17")).toBe(7);
    expect(calculateNights("2026-12-30", "2027-01-02")).toBe(3);
    expect(calculateNights("2026-10-31", "2026-11-01")).toBe(1);
  });

  it("devuelve 0 con fechas faltantes o invertidas", () => {
    expect(calculateNights()).toBe(0);
    expect(calculateNights("2026-11-10")).toBe(0);
    expect(calculateNights("2026-11-10", "2026-11-10")).toBe(0);
    expect(calculateNights("2026-11-12", "2026-11-10")).toBe(0);
  });
});

describe("countWeekendNights", () => {
  it("cuenta las noches de viernes, sábado y domingo", () => {
    // vie 23/10 a lun 26/10: noches vie, sáb, dom
    expect(countWeekendNights("2026-10-23", "2026-10-26")).toBe(3);
    // lun 26/10 a vie 30/10: ninguna
    expect(countWeekendNights("2026-10-26", "2026-10-30")).toBe(0);
    // jue 29/10 a sáb 31/10: solo la del viernes
    expect(countWeekendNights("2026-10-29", "2026-10-31")).toBe(1);
    // una semana entera: 3
    expect(countWeekendNights("2026-11-02", "2026-11-09")).toBe(3);
  });

  it("la noche del día de salida no cuenta", () => {
    // lun 26 a vie 30: el viernes es el día que se va
    expect(countWeekendNights("2026-10-26", "2026-10-30")).toBe(0);
  });

  it("feriados y puentes cuentan como fin de semana", () => {
    expect(HOLIDAYS).toContain("2026-12-07"); // puente
    expect(HOLIDAYS).toContain("2026-12-08");
    // lun 7/12 (puente) y mar 8/12 (feriado)
    expect(countWeekendNights("2026-12-07", "2026-12-09")).toBe(2);
    // lun 23/11 feriado trasladado
    expect(countWeekendNights("2026-11-23", "2026-11-24")).toBe(1);
    // vie 25/12: feriado y viernes a la vez cuenta una sola vez
    expect(countWeekendNights("2026-12-25", "2026-12-26")).toBe(1);
  });

  it("funciona al cruzar mes y año", () => {
    // jue 31/12 a sáb 2/1: noche jue (no) y vie 1/1 (feriado y viernes)
    expect(countWeekendNights("2026-12-31", "2027-01-02")).toBe(1);
    // sáb 31/10 a lun 2/11: sáb y dom
    expect(countWeekendNights("2026-10-31", "2026-11-02")).toBe(2);
  });

  it("devuelve 0 sin noches", () => {
    expect(countWeekendNights("2026-11-10", "2026-11-10")).toBe(0);
    expect(countWeekendNights()).toBe(0);
  });
});

describe("precio por unidad", () => {
  it("refugio y camping: precio por persona por noche", () => {
    expect(getRoomTotalPrice("refugio", 1, "2026-11-10", "2026-11-11")).toBe(38000);
    expect(getRoomTotalPrice("refugio", 3, "2026-11-10", "2026-11-12")).toBe(38000 * 3 * 2);
    expect(getRoomTotalPrice("camping", 2, "2026-11-10", "2026-11-13")).toBe(18000 * 2 * 3);
  });

  it("dormitorio: precio por reserva según personas", () => {
    expect(getRoomTotalPrice("dormitorio", 1, "2026-11-10", "2026-11-11")).toBe(120000);
    expect(getRoomTotalPrice("dormitorio", 2, "2026-11-10", "2026-11-11")).toBe(120000);
    expect(getRoomTotalPrice("dormitorio", 3, "2026-11-10", "2026-11-12")).toBe(160000 * 2);
  });

  it("habitaciones: precio por reserva según personas", () => {
    expect(getRoomTotalPrice("habitacion1", 1, "2026-11-10", "2026-11-11")).toBe(90000);
    expect(getRoomTotalPrice("habitacion1", 2, "2026-11-10", "2026-11-11")).toBe(90000);
    expect(getRoomTotalPrice("habitacion1", 3, "2026-11-10", "2026-11-11")).toBe(120000);
    expect(getRoomTotalPrice("habitacion1", 4, "2026-11-10", "2026-11-12")).toBe(300000);
    expect(getRoomTotalPrice("habitacion2", 1, "2026-11-10", "2026-11-11")).toBe(90000);
    expect(getRoomTotalPrice("habitacion2", 3, "2026-11-10", "2026-11-11")).toBe(120000);
  });

  it("habitación con más personas de las permitidas da 0 (no se puede cobrar)", () => {
    expect(getRoomPrice("habitacion2", 4)).toBe(0);
    expect(getRoomTotalPrice("habitacion2", 4, "2026-11-10", "2026-11-11")).toBe(0);
    expect(getRoomTotalPrice("dormitorio", 4, "2026-11-10", "2026-11-11")).toBe(0);
  });

  it("cabaña: semana 250.000, fin de semana/feriado/puente 300.000, sin importar personas", () => {
    expect(getRoomTotalPrice("cabana", 8, "2026-11-10", "2026-11-12")).toBe(500000);
    expect(getRoomTotalPrice("cabana", 2, "2026-11-10", "2026-11-12")).toBe(500000);
    expect(getRoomTotalPrice("cabana", 8, "2026-11-13", "2026-11-15")).toBe(600000); // vie y sáb
    // jue 12 a lun 16: jue semana + vie, sáb, dom
    expect(getRoomTotalPrice("cabana", 8, "2026-11-12", "2026-11-16")).toBe(250000 + 3 * 300000);
    // dom 6/12 a mié 9/12: dom + puente + feriado
    expect(getRoomTotalPrice("cabana", 8, "2026-12-06", "2026-12-09")).toBe(900000);
  });
});

describe("residentes", () => {
  it("pagan precio de residente solo en refugio y camping", () => {
    expect(getRoomTotalPrice("refugio", 2, "2026-11-10", "2026-11-12", true)).toBe(35000 * 2 * 2);
    expect(getRoomTotalPrice("camping", 1, "2026-11-10", "2026-11-11", true)).toBe(13000);
    expect(getResidentDiscount("refugio", 2, 2, true)).toBe((38000 - 35000) * 4);
  });

  it("no cambia nada en las demás unidades", () => {
    for (const unit of ["dormitorio", "cabana", "habitacion1", "habitacion2"]) {
      expect(getRoomTotalPrice(unit, 2, "2026-11-10", "2026-11-11", true)).toBe(
        getRoomTotalPrice(unit, 2, "2026-11-10", "2026-11-11", false)
      );
      expect(getResidentDiscount(unit, 2, 1, true)).toBe(0);
    }
  });

  it("sin la casilla de residente no hay descuento", () => {
    expect(getResidentDiscount("refugio", 2, 2, false)).toBe(0);
    expect(getResidentDiscount("refugio", 2, 2)).toBe(0);
  });
});

describe("getBookingTotal (lo que se cobra en MercadoPago)", () => {
  it("las comidas pedidas no suman al total", () => {
    const base = booking({ unit: "refugio", persons: 2, endDate: "2026-11-12" });
    const conComidas = { ...base, includeBreakfastCampo: true, includeBreakfastAmericano: true, includeDinner: true };
    expect(getBookingTotal(base)).toBe(152000);
    expect(getBookingTotal(conComidas)).toBe(152000);
  });

  it("incluye el precio de residente", () => {
    expect(getBookingTotal(booking({ unit: "camping", persons: 1, isResident: true }))).toBe(13000);
  });

  it("cabaña con fin de semana", () => {
    expect(getBookingTotal(booking({ unit: "cabana", persons: 8, startDate: "2026-12-06", endDate: "2026-12-09" }))).toBe(900000);
  });
});

describe("isCancelledStatus", () => {
  it("acepta el estado del admin y el viejo en inglés", () => {
    expect(isCancelledStatus("cancelada")).toBe(true);
    expect(isCancelledStatus("cancelled")).toBe(true);
    for (const s of ["confirmada", "pendiente", "approved", "sin mp", "confirmed", undefined, null]) {
      expect(isCancelledStatus(s as any)).toBe(false);
    }
  });
});
