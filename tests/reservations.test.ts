import { describe, it, expect } from "vitest";
import { createReservation, updateReservation, deleteReservation, getReservationById } from "@/lib/reservations";
import { fake, reservation } from "./helpers/fakeFirestore";

describe("createReservation", () => {
  it("crea la reserva con persons numérico y timestamps", async () => {
    const r = await createReservation(reservation({ persons: "3" }));
    expect(r.success).toBe(true);
    const saved = fake.get("reservations", r.id!)!;
    expect(saved.persons).toBe(3);
    expect(saved.createdAt).toBeDefined();
    expect(saved.updatedAt).toBeDefined();
  });

  it("rechaza si no hay disponibilidad y no guarda nada", async () => {
    fake.seed("reservations", "c", reservation({ unit: "cabana", persons: 8 }));
    const r = await createReservation(reservation({ unit: "habitacion1", persons: 2 }));
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/no están disponibles/);
    expect(fake.all("reservations")).toHaveLength(1);
  });

  it("con docId usa ese id", async () => {
    const r = await createReservation(reservation(), "mp-1");
    expect(r).toEqual({ success: true, id: "mp-1" });
    expect(fake.get("reservations", "mp-1")).toBeDefined();
  });

  it("con docId repetido avisa duplicate en vez de fallar", async () => {
    fake.seed("reservations", "mp-1", reservation({ unit: "cabana", startDate: "2027-01-10", endDate: "2027-01-11" }));
    const r = await createReservation(reservation(), "mp-1");
    expect(r).toEqual({ success: true, id: "mp-1", duplicate: true });
    // no pisa la reserva existente
    expect(fake.get("reservations", "mp-1")!.unit).toBe("cabana");
  });

  it("ante un error de la base devuelve error genérico", async () => {
    const original = fake.db.collection;
    (fake.db as any).collection = (name: string) => ({
      ...original(name),
      add: async () => {
        throw new Error("boom");
      },
    });
    try {
      const r = await createReservation(reservation());
      expect(r.success).toBe(false);
      expect(r.error).toMatch(/Error interno/);
    } finally {
      (fake.db as any).collection = original;
    }
  });
});

describe("updateReservation", () => {
  it("cambia datos de contacto sin revisar disponibilidad", async () => {
    fake.seed("reservations", "r1", reservation({ unit: "cabana", persons: 8 }));
    fake.seed("reservations", "r2", reservation({ unit: "cabana", persons: 8 })); // superpuesta a propósito
    const r = await updateReservation("r1", { contactPhone: "999" } as any);
    expect(r.success).toBe(true);
    expect(fake.get("reservations", "r1")!.contactPhone).toBe("999");
  });

  it("puede guardar las mismas fechas (no choca consigo misma)", async () => {
    fake.seed("reservations", "r1", reservation({ unit: "cabana", persons: 8 }));
    const r = await updateReservation("r1", { startDate: "2026-11-10", endDate: "2026-11-12" } as any);
    expect(r.success).toBe(true);
  });

  it("rechaza mover la reserva a fechas ocupadas", async () => {
    fake.seed("reservations", "r1", reservation({ unit: "cabana", persons: 8 }));
    fake.seed("reservations", "r2", reservation({ unit: "cabana", persons: 8, startDate: "2026-11-20", endDate: "2026-11-22" }));
    const r = await updateReservation("r1", { startDate: "2026-11-20", endDate: "2026-11-21" } as any);
    expect(r.success).toBe(false);
    expect(fake.get("reservations", "r1")!.startDate).toBe("2026-11-10");
  });

  it("normaliza persons a número", async () => {
    fake.seed("reservations", "r1", reservation({ unit: "refugio", persons: 2 }));
    await updateReservation("r1", { persons: "4" } as any);
    expect(fake.get("reservations", "r1")!.persons).toBe(4);
  });

  it("reserva inexistente", async () => {
    const r = await updateReservation("nada", { startDate: "2026-11-10" } as any);
    expect(r).toEqual({ success: false, error: "Reserva no encontrada" });
  });

  it("cancelar una reserva libera las fechas para otros", async () => {
    fake.seed("reservations", "r1", reservation({ unit: "cabana", persons: 8 }));
    expect((await createReservation(reservation({ unit: "cabana", persons: 8 }))).success).toBe(false);
    await updateReservation("r1", { status: "cancelada" } as any);
    expect((await createReservation(reservation({ unit: "cabana", persons: 8 }))).success).toBe(true);
  });
});

describe("getReservationById / deleteReservation", () => {
  it("lee y borra", async () => {
    fake.seed("reservations", "r1", reservation());
    expect((await getReservationById("r1"))!.id).toBe("r1");
    await deleteReservation("r1");
    expect(await getReservationById("r1")).toBeNull();
  });
});
