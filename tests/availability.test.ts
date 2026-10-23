import { describe, it, expect } from "vitest";
import { checkAvailability, getUnavailableDates, getAvailabilityForUnit, isUnitConflict } from "@/lib/availability";
import { fake, reservation } from "./helpers/fakeFirestore";
import { UnitType } from "@/lib/types";

const seed = (id: string, overrides: Record<string, any>) => fake.seed("reservations", id, reservation(overrides));

// martes 10/11 a jueves 12/11 = noches del 10 y del 11
const S = "2026-11-10";
const E = "2026-11-12";

describe("cupos sin otras reservas", () => {
  it.each([
    ["refugio", 20],
    ["camping", 50],
    ["dormitorio", 3],
  ])("%s acepta hasta su cupo (%i)", async (unit, cap) => {
    expect((await checkAvailability(unit as UnitType, cap, S, E)).available).toBe(true);
    expect((await checkAvailability(unit as UnitType, cap + 1, S, E)).available).toBe(false);
  });

  it.each(["cabana", "habitacion1", "habitacion2"])("%s está libre", async (unit) => {
    expect((await checkAvailability(unit as UnitType, 2, S, E)).available).toBe(true);
  });
});

describe("refugio comparte espacio con la cabaña", () => {
  it("baja a 15 con una habitación reservada", async () => {
    seed("h1", { unit: "habitacion1", persons: 2 });
    expect((await checkAvailability("refugio", 15, S, E)).available).toBe(true);
    expect((await checkAvailability("refugio", 16, S, E)).available).toBe(false);
  });

  it("baja a 10 con la cabaña completa", async () => {
    seed("c", { unit: "cabana", persons: 8 });
    expect((await checkAvailability("refugio", 10, S, E)).available).toBe(true);
    expect((await checkAvailability("refugio", 11, S, E)).available).toBe(false);
  });

  it("baja a 10 con las dos habitaciones reservadas por personas distintas", async () => {
    seed("h1", { unit: "habitacion1", persons: 2, contactName: "Ana" });
    seed("h2", { unit: "habitacion2", persons: 1, contactName: "Beto" });
    expect((await checkAvailability("refugio", 10, S, E)).available).toBe(true);
    expect((await checkAvailability("refugio", 11, S, E)).available).toBe(false);
  });

  it("resta las personas ya anotadas en el refugio", async () => {
    seed("c", { unit: "cabana", persons: 8 });
    seed("r", { unit: "refugio", persons: 7 });
    expect((await checkAvailability("refugio", 3, S, E)).available).toBe(true);
    expect((await checkAvailability("refugio", 4, S, E)).available).toBe(false);
  });

  it("reservas viejas con persons como texto también se restan", async () => {
    seed("r", { unit: "refugio", persons: "15" });
    expect((await checkAvailability("refugio", 5, S, E)).available).toBe(true);
    expect((await checkAvailability("refugio", 6, S, E)).available).toBe(false);
  });

  it("solo baja las noches en que la habitación está ocupada", async () => {
    seed("h1", { unit: "habitacion1", startDate: "2026-11-10", endDate: "2026-11-11" });
    const dias = await getAvailabilityForUnit("refugio", "2026-11-10", "2026-11-11");
    expect(dias.find((d) => d.date === "2026-11-10")!.remainingCapacity).toBe(15);
    expect(dias.find((d) => d.date === "2026-11-11")!.remainingCapacity).toBe(20);
  });
});

describe("cabaña y habitaciones se excluyen", () => {
  it("cabaña reservada bloquea las dos habitaciones", async () => {
    seed("c", { unit: "cabana", persons: 8 });
    expect((await checkAvailability("habitacion1", 1, S, E)).available).toBe(false);
    expect((await checkAvailability("habitacion2", 1, S, E)).available).toBe(false);
  });

  it("una habitación reservada bloquea la cabaña pero no la otra habitación", async () => {
    seed("h1", { unit: "habitacion1", persons: 2 });
    expect((await checkAvailability("cabana", 8, S, E)).available).toBe(false);
    expect((await checkAvailability("habitacion1", 1, S, E)).available).toBe(false);
    expect((await checkAvailability("habitacion2", 1, S, E)).available).toBe(true);
  });

  it("isUnitConflict", () => {
    expect(isUnitConflict("cabana", "habitacion1")).toBe(true);
    expect(isUnitConflict("habitacion2", "cabana")).toBe(true);
    expect(isUnitConflict("habitacion1", "habitacion2")).toBe(false);
    expect(isUnitConflict("refugio", "cabana")).toBe(false);
    expect(isUnitConflict("dormitorio", "refugio")).toBe(false);
  });
});

describe("dormitorio: 3 camas compartidas entre reservas", () => {
  it("dos reservas que suman más de 3 no entran", async () => {
    seed("d1", { unit: "dormitorio", persons: 2 });
    expect((await checkAvailability("dormitorio", 1, S, E)).available).toBe(true);
    expect((await checkAvailability("dormitorio", 2, S, E)).available).toBe(false);
  });

  it("no afecta el cupo del refugio", async () => {
    seed("d1", { unit: "dormitorio", persons: 3 });
    expect((await checkAvailability("refugio", 20, S, E)).available).toBe(true);
  });
});

describe("día de salida libre: alguien sale el sábado y otro entra el sábado", () => {
  const cases: [UnitType, number][] = [
    ["refugio", 20],
    ["camping", 50],
    ["dormitorio", 3],
    ["cabana", 8],
    ["habitacion1", 4],
    ["habitacion2", 3],
  ];

  it.each(cases)("%s", async (unit, full) => {
    // sáb 14/11 a sáb 21/11, lleno
    seed("x", { unit, persons: full, startDate: "2026-11-14", endDate: "2026-11-21" });
    // entra el mismo sábado que el otro se va
    expect((await checkAvailability(unit, full, "2026-11-21", "2026-11-22")).available).toBe(true);
    // sale el mismo sábado que el otro entra
    expect((await checkAvailability(unit, full, "2026-11-13", "2026-11-14")).available).toBe(true);
    // pero la última noche sigue ocupada
    expect((await checkAvailability(unit, full, "2026-11-20", "2026-11-21")).available).toBe(false);
  });

  it("la cabaña libera el refugio el día de salida", async () => {
    seed("c", { unit: "cabana", persons: 8, startDate: "2026-11-14", endDate: "2026-11-21" });
    expect((await checkAvailability("refugio", 20, "2026-11-21", "2026-11-22")).available).toBe(true);
    expect((await checkAvailability("refugio", 11, "2026-11-20", "2026-11-21")).available).toBe(false);
  });
});

describe("reservas canceladas no ocupan lugar", () => {
  it.each(["cancelada", "cancelled"])("estado %s", async (status) => {
    seed("c", { unit: "cabana", persons: 8, status });
    expect((await checkAvailability("cabana", 8, S, E)).available).toBe(true);
    expect((await checkAvailability("refugio", 20, S, E)).available).toBe(true);
  });

  it.each(["confirmada", "pendiente", "approved", "sin mp"])("estado %s sí ocupa", async (status) => {
    seed("c", { unit: "cabana", persons: 8, status });
    expect((await checkAvailability("cabana", 8, S, E)).available).toBe(false);
  });
});

describe("edición: la reserva no choca consigo misma", () => {
  it("excludeReservationId la ignora", async () => {
    seed("yo", { unit: "cabana", persons: 8 });
    expect((await checkAvailability("cabana", 8, S, E)).available).toBe(false);
    expect((await checkAvailability("cabana", 8, S, E, "yo")).available).toBe(true);
  });

  it("pero sigue chocando con las demás", async () => {
    seed("yo", { unit: "cabana", persons: 8 });
    seed("otro", { unit: "habitacion1", persons: 2 });
    expect((await checkAvailability("cabana", 8, S, E, "yo")).available).toBe(false);
  });
});

describe("datos inválidos", () => {
  it("fecha de inicio igual o posterior a la de fin", async () => {
    expect((await checkAvailability("refugio", 1, S, S)).available).toBe(false);
    expect((await checkAvailability("refugio", 1, E, S)).available).toBe(false);
  });

  it("personas en cero, negativas, decimales o texto", async () => {
    for (const persons of [0, -1, 2.5, "abc" as any]) {
      expect((await checkAvailability("refugio", persons, S, E)).available).toBe(false);
    }
  });

  it("acepta persons como texto numérico", async () => {
    expect((await checkAvailability("refugio", "2" as any, S, E)).available).toBe(true);
  });

  it("más personas que el cupo", async () => {
    const r = await checkAvailability("refugio", 21, S, E);
    expect(r.available).toBe(false);
    expect(r.message).toContain("capacidad máxima de 20");
  });

  it("unidad inexistente o faltante", async () => {
    expect((await checkAvailability("suite" as any, 1, S, E)).message).toBe("Unidad de reserva no válida");
    expect((await checkAvailability("" as any, 1, S, E)).available).toBe(false);
  });

  it("el mensaje lista las noches sin lugar", async () => {
    seed("r", { unit: "refugio", persons: 20, startDate: "2026-11-11", endDate: "2026-11-12" });
    const r = await checkAvailability("refugio", 1, S, E);
    expect(r.available).toBe(false);
    expect(r.message).toContain("2026-11-11");
    expect(r.message).not.toContain("2026-11-10");
  });
});

describe("getUnavailableDates (calendario)", () => {
  it("marca las noches llenas y no el día de salida", async () => {
    seed("c", { unit: "cabana", persons: 8, startDate: "2026-11-14", endDate: "2026-11-16" });
    const dates = await getUnavailableDates("cabana", 8, "2026-11-12", "2026-11-18");
    expect(dates).toEqual(["2026-11-14", "2026-11-15"]);
  });

  it("depende de la cantidad de personas en unidades por cupo", async () => {
    seed("r", { unit: "refugio", persons: 18 });
    expect(await getUnavailableDates("refugio", 2, S, E)).toEqual([]);
    expect(await getUnavailableDates("refugio", 3, S, E)).toEqual(["2026-11-10", "2026-11-11"]);
  });

  it("ignora la reserva que se está editando", async () => {
    seed("yo", { unit: "cabana", persons: 8 });
    expect(await getUnavailableDates("cabana", 8, S, E, "yo")).toEqual([]);
  });
});
