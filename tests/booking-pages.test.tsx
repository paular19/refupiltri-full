import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import type React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SuccessPage from "@/app/booking/success/page";
import PendingPage from "@/app/booking/pending/page";
import FailurePage from "@/app/booking/failure/page";
import { createPaymentPreference } from "@/lib/mercadopago";
import { mocks } from "./helpers/mocks";

const html = (Page: () => React.ReactElement) => renderToStaticMarkup(<Page />);

describe("pantallas de vuelta desde Mercado Pago", () => {
  it("cada back_url de la preferencia tiene su página", async () => {
    await createPaymentPreference({
      unit: "camping", persons: 1, startDate: "2027-03-01", endDate: "2027-03-02",
      contactName: "Ana", contactLastName: "", contactEmail: "ana@example.com", contactPhone: "2944000000",
      includeBreakfastCampo: false, includeBreakfastAmericano: false,
    });
    const { back_urls } = (mocks.preferenceCreate.mock.calls.at(-1)![0] as any).body;
    expect(Object.keys(back_urls).sort()).toEqual(["failure", "pending", "success"]);
    for (const url of Object.values(back_urls) as string[]) {
      const route = new URL(url).pathname; // ej. /booking/failure
      expect(existsSync(path.join(__dirname, "..", "app", route, "page.tsx")), route).toBe(true);
    }
  });

  it("pago aprobado: reserva confirmada", () => {
    const page = html(SuccessPage);
    expect(page).toContain("¡Reserva Confirmada!");
    expect(page).toContain('href="/"');
  });

  it("pago pendiente: avisa que las fechas se reservan recién al acreditarse", () => {
    const page = html(PendingPage);
    expect(page).toContain("Tu pago está pendiente");
    expect(page).toContain("Las fechas quedan reservadas recién cuando se acredita el pago");
    expect(page).toContain('href="https://wa.me/5492944120310"');
  });

  it("pago rechazado: sin cobro, permite reintentar o escribir por WhatsApp", () => {
    const page = html(FailurePage);
    expect(page).toContain("No se pudo completar el pago");
    expect(page).toContain("no se hizo ningún cobro");
    expect(page).toContain('href="/#booking"');
    expect(page).toContain('href="https://wa.me/5492944120310"');
  });
});
