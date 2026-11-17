import { describe, it, expect } from "vitest";
import { isPastDate, todayInArgentina, validateContact } from "@/lib/validation";

const ok = { contactName: "Ana Gómez", contactEmail: "ana@example.com", contactPhone: "+54 9 2944 12-0310" };

describe("validateContact", () => {
  it("datos completos: sin errores", () => {
    expect(validateContact(ok)).toEqual({});
  });

  it("todo vacío: un error por campo", () => {
    expect(validateContact({})).toEqual({
      contactName: "Ingresá tu nombre",
      contactEmail: "Ingresá tu email",
      contactPhone: "Ingresá tu teléfono",
    });
  });

  it("espacios solos cuentan como vacío", () => {
    expect(validateContact({ ...ok, contactName: "   " }).contactName).toBe("Ingresá tu nombre");
  });

  it.each(["ana", "ana@", "ana@example", "ana @example.com", "@example.com"])("email inválido: %s", (email) => {
    expect(validateContact({ ...ok, contactEmail: email }).contactEmail).toBe("El email no es válido");
  });

  it.each(["12345", "llamame", "2944-abc-123"])("teléfono inválido: %s", (phone) => {
    expect(validateContact({ ...ok, contactPhone: phone }).contactPhone).toBe("El teléfono no es válido");
  });

  it.each(["2944120310", "(0294) 412-0310", "+1 555 123 4567"])("teléfono válido: %s", (phone) => {
    expect(validateContact({ ...ok, contactPhone: phone })).toEqual({});
  });
});

describe("fechas en hora de Argentina", () => {
  it("de noche en Argentina sigue siendo el mismo día aunque en UTC ya sea mañana", () => {
    expect(todayInArgentina(new Date("2026-11-18T02:59:00Z"))).toBe("2026-11-17");
    expect(todayInArgentina(new Date("2026-11-18T03:00:00Z"))).toBe("2026-11-18");
  });

  it("isPastDate: ayer sí, hoy y mañana no", () => {
    const now = new Date("2026-11-17T15:00:00Z");
    expect(isPastDate("2026-11-16", now)).toBe(true);
    expect(isPastDate("2026-11-17", now)).toBe(false);
    expect(isPastDate("2026-11-18", now)).toBe(false);
  });
});
