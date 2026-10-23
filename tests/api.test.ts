import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as createPayment } from "@/app/api/create-payment/route";
import { GET as availabilityGET } from "@/app/api/availability/route";
import { POST as webhook } from "@/app/api/webhooks/mercadopago/route";
import { createPaymentPreference } from "@/lib/mercadopago";
import { getBookingTotal } from "@/lib/constants";
import { fake, reservation } from "./helpers/fakeFirestore";
import { mocks } from "./helpers/mocks";

const post = (url: string, body: any) =>
  new NextRequest(url, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });

const webBooking = {
  unit: "refugio",
  persons: "2", // el <select> del form lo manda como texto
  startDate: "2026-11-10",
  endDate: "2026-11-12",
  contactName: "Ana",
  contactLastName: "Gómez",
  contactEmail: "ana@example.com",
  contactPhone: "2944000000",
  includeBreakfastCampo: true,
  includeBreakfastAmericano: false,
  includeDinner: true,
  isResident: false,
};

const lastPreferenceBody = () => (mocks.preferenceCreate.mock.calls.at(-1)![0] as any).body;

describe("POST /api/create-payment", () => {
  it("crea la preferencia de MP con el total del resumen", async () => {
    const res = await createPayment(post("https://x/api/create-payment", webBooking));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ preferenceId: "pref-123" });

    const body = lastPreferenceBody();
    expect(body.items[0].unit_price).toBe(38000 * 2 * 2);
    expect(body.items[0].title).toBe("Reserva Refugio - 2 noches");
    expect(body.notification_url).toBe("https://refugio.test/api/webhooks/mercadopago");
    expect(body.payer.email).toBe("ana@example.com");
  });

  it("solo pasa a MP los campos permitidos y persons como número", async () => {
    await createPayment(
      post("https://x/api/create-payment", { ...webBooking, status: "confirmada", origin: "admin", notifyUser: true, reason: "x", price: 1 })
    );
    const saved = JSON.parse(lastPreferenceBody().metadata.booking_data);
    expect(saved.persons).toBe(2);
    expect(Object.keys(saved).sort()).toEqual(
      [
        "unit", "persons", "startDate", "endDate", "contactName", "contactLastName", "contactEmail",
        "contactPhone", "includeBreakfastCampo", "includeBreakfastAmericano", "includeDinner", "isResident",
      ].sort()
    );
  });

  it("el precio de residente llega a MP", async () => {
    await createPayment(post("https://x/api/create-payment", { ...webBooking, unit: "camping", persons: "1", endDate: "2026-11-11", isResident: true }));
    expect(lastPreferenceBody().items[0].unit_price).toBe(13000);
  });

  it("400 con mensaje si las fechas ya no están disponibles", async () => {
    fake.seed("reservations", "c", reservation({ unit: "refugio", persons: 20 }));
    const res = await createPayment(post("https://x/api/create-payment", webBooking));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/no están disponibles/);
    expect(mocks.preferenceCreate).not.toHaveBeenCalled();
  });

  it("400 si el total da 0 (habitación con más personas de las permitidas)", async () => {
    const res = await createPayment(post("https://x/api/create-payment", { ...webBooking, unit: "habitacion2", persons: "4" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Datos de reserva inválidos");
    expect(mocks.preferenceCreate).not.toHaveBeenCalled();
  });

  it("400 con fechas inválidas", async () => {
    const res = await createPayment(post("https://x/api/create-payment", { ...webBooking, endDate: "2026-11-10" }));
    expect(res.status).toBe(400);
  });

  it("modo sin MP (NEXT_PUBLIC_AVOID_MP): crea la reserva y manda mails", async () => {
    process.env.NEXT_PUBLIC_AVOID_MP = "true";
    const res = await createPayment(post("https://x/api/create-payment", webBooking));
    expect(await res.json()).toEqual({ preferenceId: "666" });
    const [saved] = fake.all("reservations");
    expect(saved).toMatchObject({ origin: "web", status: "sin mp", persons: 2, includeDinner: true });
    expect(mocks.resendSend).toHaveBeenCalledTimes(2);
    expect(mocks.preferenceCreate).not.toHaveBeenCalled();
  });

  it("500 si MP falla", async () => {
    mocks.preferenceCreate.mockRejectedValueOnce(new Error("MP caído"));
    const res = await createPayment(post("https://x/api/create-payment", webBooking));
    expect(res.status).toBe(500);
  });
});

describe("createPaymentPreference", () => {
  it.each([
    ["cabana", 8, "2026-12-06", "2026-12-09"],
    ["dormitorio", 3, "2026-11-10", "2026-11-12"],
    ["habitacion1", 4, "2026-11-13", "2026-11-15"],
  ])("%s: unit_price = getBookingTotal", async (unit, persons, startDate, endDate) => {
    const b: any = { ...webBooking, unit, persons, startDate, endDate };
    await createPaymentPreference(b);
    expect(lastPreferenceBody().items[0].unit_price).toBe(getBookingTotal(b));
    expect(lastPreferenceBody().items[0].currency_id).toBe("ARS");
  });
});

describe("GET /api/availability", () => {
  const get = (qs: string) => availabilityGET(new NextRequest(`https://x/api/availability?${qs}`));

  it("400 si faltan parámetros", async () => {
    expect((await get("unit=refugio")).status).toBe(400);
  });

  it("devuelve las fechas no disponibles", async () => {
    fake.seed("reservations", "c", reservation({ unit: "cabana", persons: 8 }));
    const res = await get("unit=cabana&persons=8&startDate=2026-11-09&endDate=2026-11-13");
    expect(await res.json()).toEqual({ unavailableDates: ["2026-11-10", "2026-11-11"] });
  });

  it("validate", async () => {
    fake.seed("reservations", "c", reservation({ unit: "cabana", persons: 8 }));
    const ocupado = await get("action=validate&unit=cabana&persons=8&startDate=2026-11-10&endDate=2026-11-12");
    expect((await ocupado.json()).available).toBe(false);
    const salida = await get("action=validate&unit=cabana&persons=8&startDate=2026-11-12&endDate=2026-11-13");
    expect((await salida.json()).available).toBe(true);
  });

  it("excludeReservationId en las dos acciones", async () => {
    fake.seed("reservations", "yo", reservation({ unit: "cabana", persons: 8 }));
    const v = await get("action=validate&unit=cabana&persons=8&startDate=2026-11-10&endDate=2026-11-12&excludeReservationId=yo");
    expect((await v.json()).available).toBe(true);
    const u = await get("unit=cabana&persons=8&startDate=2026-11-09&endDate=2026-11-13&excludeReservationId=yo");
    expect((await u.json()).unavailableDates).toEqual([]);
  });
});

describe("POST /api/webhooks/mercadopago", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const approved = (overrides: any = {}) => ({
    id: 123,
    status: "approved",
    transaction_amount: 152000,
    metadata: { booking_data: JSON.stringify({ ...webBooking, persons: 2 }) },
    ...overrides,
  });
  const notify = () => webhook(post("https://x/api/webhooks/mercadopago", { type: "payment", data: { id: "123" } }));

  it("pago aprobado: crea la reserva mp-<id> y manda los mails", async () => {
    mocks.paymentGet.mockResolvedValue(approved());
    const res = await notify();
    expect(res.status).toBe(200);
    expect(fake.get("reservations", "mp-123")).toMatchObject({
      origin: "web",
      status: "approved",
      paymentId: "123",
      unit: "refugio",
      persons: 2,
      includeDinner: true,
    });
    expect(mocks.resendSend).toHaveBeenCalledTimes(2);
    const subjects = mocks.resendSend.mock.calls.map((c: any) => c[0].subject);
    expect(subjects).toContain("Confirmación de Reserva #mp-123 - Refugio Piltri");
    expect(subjects).toContain("Nueva Reserva Web - Ana Gómez");
  });

  it("aviso repetido del mismo pago: no duplica reserva ni mails", async () => {
    mocks.paymentGet.mockResolvedValue(approved());
    await notify();
    await notify();
    expect(fake.all("reservations")).toHaveLength(1);
    expect(mocks.resendSend).toHaveBeenCalledTimes(2);
  });

  it("pago aprobado sin lugar: alerta urgente al admin y responde 200", async () => {
    fake.seed("reservations", "lleno", reservation({ unit: "refugio", persons: 20 }));
    mocks.paymentGet.mockResolvedValue(approved());
    const res = await notify();
    expect(res.status).toBe(200);
    expect(fake.get("reservations", "mp-123")).toBeUndefined();
    expect(mocks.resendSend).toHaveBeenCalledTimes(1);
    const alert = mocks.resendSend.mock.calls[0][0] as any;
    expect(alert.to).toEqual(["admin@example.com"]);
    expect(alert.subject).toBe("URGENTE: pago aprobado sin reserva - Ana Gómez");
    expect(alert.text).toContain("Pago MP: 123");
    expect(alert.text).toContain("Monto: $152000");
  });

  it.each(["pending", "in_process", "rejected"])("pago %s: no hace nada", async (status) => {
    mocks.paymentGet.mockResolvedValue(approved({ status }));
    const res = await notify();
    expect(res.status).toBe(200);
    expect(fake.all("reservations")).toHaveLength(0);
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("notificaciones que no son de pago se ignoran", async () => {
    const res = await webhook(post("https://x/api/webhooks/mercadopago", { type: "merchant_order", data: { id: "9" } }));
    expect(res.status).toBe(200);
    expect(mocks.paymentGet).not.toHaveBeenCalled();
  });

  it("sin booking_data en el pago: 400", async () => {
    mocks.paymentGet.mockResolvedValue(approved({ metadata: {} }));
    expect((await notify()).status).toBe(400);
  });

  it("booking_data corrupto: 400", async () => {
    mocks.paymentGet.mockResolvedValue(approved({ metadata: { booking_data: "{no es json" } }));
    expect((await notify()).status).toBe(400);
  });

  it("si MP tarda, reintenta y después procesa", async () => {
    vi.useFakeTimers();
    mocks.paymentGet
      .mockRejectedValueOnce(Object.assign(new Error("no"), { status: 404 }))
      .mockResolvedValueOnce(approved());
    const pending = notify();
    await vi.advanceTimersByTimeAsync(2000);
    const res = await pending;
    expect(res.status).toBe(200);
    expect(fake.get("reservations", "mp-123")).toBeDefined();
  });

  it("si MP nunca encuentra el pago: 404", async () => {
    vi.useFakeTimers();
    mocks.paymentGet.mockRejectedValue(Object.assign(new Error("no"), { status: 404 }));
    const pending = notify();
    await vi.advanceTimersByTimeAsync(10000);
    expect((await pending).status).toBe(404);
    expect(mocks.paymentGet).toHaveBeenCalledTimes(5);
  });

  it("error de MP distinto de 404: 500", async () => {
    mocks.paymentGet.mockRejectedValue(Object.assign(new Error("auth"), { status: 401 }));
    expect((await notify()).status).toBe(500);
  });
});
