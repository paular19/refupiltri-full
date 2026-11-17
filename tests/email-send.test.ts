import { describe, it, expect } from "vitest";
import { sendAdminAlert, sendBookingConfirmation } from "@/lib/email";
import { BookingData } from "@/lib/types";
import { mocks } from "./helpers/mocks";

// Resend no tira excepción cuando rechaza un envío: devuelve { data: null, error }
const rejected = { data: null, error: { name: "validation_error", message: "API key is invalid" } };

const booking: BookingData = {
  unit: "refugio",
  persons: 2,
  startDate: "2026-12-06",
  endDate: "2026-12-08",
  contactName: "Ana",
  contactLastName: "Gómez",
  contactEmail: "ana@example.com",
  contactPhone: "2944000000",
  includeBreakfastCampo: false,
  includeBreakfastAmericano: false,
  includeDinner: false,
};

const sentTo = () => mocks.resendSend.mock.calls.map((c: any) => c[0].to[0]);
const subjects = () => mocks.resendSend.mock.calls.map((c: any) => c[0].subject as string);
const errorLogs = () => (console.error as any).mock.calls.map((c: any[]) => String(c[0]));
const infoLogs = () => (console.log as any).mock.calls.map((c: any[]) => String(c[0]));

describe("errores que Resend devuelve sin tirar excepción", () => {
  it("todo bien: lo registra como enviado", async () => {
    await sendBookingConfirmation(booking, "r1");
    expect(infoLogs()).toContain("Emails enviados correctamente para reserva:");
    expect(errorLogs()).toEqual([]);
  });

  it("Resend rechaza todo: registra el error y no dice 'enviados correctamente'", async () => {
    mocks.resendSend.mockResolvedValue(rejected);
    await expect(sendBookingConfirmation(booking, "r1")).resolves.toBeUndefined();
    expect(infoLogs()).not.toContain("Emails enviados correctamente para reserva:");
    expect(errorLogs()).toEqual(
      expect.arrayContaining([expect.stringContaining("mail al cliente (reserva r1)"), expect.stringContaining("mail al admin (reserva r1)")])
    );
    // el admin tampoco recibe nada: no tiene sentido mandar otra alerta
    expect(mocks.resendSend).toHaveBeenCalledTimes(2);
  });

  it("falla solo el mail al cliente: se avisa al admin para que lo contacte", async () => {
    mocks.resendSend.mockImplementation(async (email: any) =>
      email.to[0] === "ana@example.com" ? rejected : { data: { id: "ok" }, error: null }
    );
    await sendBookingConfirmation(booking, "r1");
    expect(sentTo()).toEqual(["ana@example.com", "admin@example.com", "admin@example.com"]);
    expect(subjects()[2]).toBe("No se pudo enviar la confirmación al cliente - Ana Gómez");
    const alert = mocks.resendSend.mock.calls[2][0] as any;
    expect(alert.text).toContain("Reserva: r1");
    expect(alert.text).toContain("Teléfono: 2944000000");
  });

  it("falla solo el mail al admin: no manda alerta extra", async () => {
    mocks.resendSend.mockImplementation(async (email: any) =>
      email.to[0] === "admin@example.com" ? rejected : { data: { id: "ok" }, error: null }
    );
    await sendBookingConfirmation(booking, "r1");
    expect(mocks.resendSend).toHaveBeenCalledTimes(2);
    expect(errorLogs()).toEqual([expect.stringContaining("mail al admin (reserva r1)")]);
  });

  it("reserva sin email del cliente: no lo cuenta como falla", async () => {
    await sendBookingConfirmation({ ...booking, contactEmail: "" }, "r1");
    expect(sentTo()).toEqual(["admin@example.com"]);
    expect(infoLogs()).toContain("Emails enviados correctamente para reserva:");
  });

  it("alerta al admin rechazada: queda registrada", async () => {
    mocks.resendSend.mockResolvedValue(rejected);
    await expect(sendAdminAlert("URGENTE: algo", "detalle")).resolves.toBeUndefined();
    expect(errorLogs()).toEqual([expect.stringContaining('alerta al admin "URGENTE: algo"')]);
  });
});
