import { describe, it, expect } from "vitest";
import { generateCustomerEmailTemplate } from "@/lib/emails/templates/customer";
import { generateAdminEmailTemplate } from "@/lib/emails/templates/admin";
import { sendBookingConfirmation, sendAdminAlert } from "@/lib/email";
import { BookingData } from "@/lib/types";
import { mocks } from "./helpers/mocks";

const booking = (overrides: Partial<BookingData> = {}): BookingData => ({
  unit: "cabana",
  persons: 6,
  startDate: "2026-12-06",
  endDate: "2026-12-09",
  contactName: "Ana",
  contactLastName: "Gómez",
  contactEmail: "ana@example.com",
  contactPhone: "2944",
  includeBreakfastCampo: true,
  includeBreakfastAmericano: false,
  includeDinner: true,
  ...overrides,
});

describe("mail al cliente", () => {
  const html = generateCustomerEmailTemplate(booking(), "mp-1");

  it("saluda por el nombre", () => {
    expect(html).toContain("¡Hola, Ana! Gracias por elegir el <strong>Refugio del Piltriquitrón</strong>");
  });

  it("muestra el nombre de la unidad, no la clave interna", () => {
    expect(html).toContain("Unidad:</strong> Cabaña completa");
    expect(html).not.toMatch(/Unidad:<\/strong> cabana/);
  });

  it("detalles de la reserva con entrada en dd/MM/yyyy", () => {
    expect(html).toContain("ID:</strong> mp-1");
    expect(html).toContain("Personas:</strong> 6");
    expect(html).toContain("Entrada:</strong> 06/12/2026");
  });

  it("incluye cómo llegar, alojamientos, contacto y cancelaciones", () => {
    expect(html).toContain("https://maps.app.goo.gl/okpeSHCLDV3UwupP9");
    expect(html).toContain("DORMITORIO DEL REFUGIO");
    expect(html).toContain("HABITACIÓN EN LA CABAÑA");
    expect(html).toContain("CABAÑA COMPLETA");
    expect(html).toContain("DORMITORIO CON VISTA AL VALLE");
    expect(html).toContain("https://wa.me/5492944120310");
    expect(html).toContain("01/12/2026 al 01/03/2027");
    expect(html).not.toContain("$");
  });

  it("escapa el nombre del cliente", () => {
    expect(generateCustomerEmailTemplate(booking({ contactName: "<b>x</b>" }), "x")).toContain("&lt;b&gt;x&lt;/b&gt;");
  });
});

describe("mail al admin", () => {
  it("lista las comidas pedidas y los datos de contacto", () => {
    const html = generateAdminEmailTemplate(booking({ unit: "dormitorio" }), "mp-1");
    expect(html).toContain("Dormitorio");
    expect(html).toContain("Servicios extras:</strong> Desayuno de campo, Cena");
    expect(html).toContain("ana@example.com");
    expect(html).toContain("Reserva web con pago confirmado");
  });

  it("sin comidas dice Ninguno", () => {
    const html = generateAdminEmailTemplate(
      booking({ includeBreakfastCampo: false, includeDinner: false }),
      "x",
      true
    );
    expect(html).toContain("Servicios extras:</strong> Ninguno");
    expect(html).toContain("Creada por administrador");
  });
});

describe("envío", () => {
  it("manda al cliente y al admin", async () => {
    await sendBookingConfirmation(booking(), "mp-1");
    const to = mocks.resendSend.mock.calls.map((c: any) => c[0].to[0]);
    expect(to).toEqual(["ana@example.com", "admin@example.com"]);
  });

  it("sin email del cliente manda solo al admin", async () => {
    await sendBookingConfirmation(booking({ contactEmail: "" }), "x");
    expect(mocks.resendSend).toHaveBeenCalledTimes(1);
  });

  it("si Resend falla no corta la reserva", async () => {
    mocks.resendSend.mockRejectedValue(new Error("caído"));
    await expect(sendBookingConfirmation(booking(), "x")).resolves.toBeUndefined();
    await expect(sendAdminAlert("a", "b")).resolves.toBeUndefined();
  });
});
