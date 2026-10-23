import { describe, it, expect, vi } from "vitest";
import { createReservationWithEmail, updateReservationWithEmail } from "@/app/actions/emailAdmin";
import { updatePathStatusAction } from "@/app/actions/roadUpdate";
import { formToReservationData } from "@/lib/utils";
import { fake, reservation } from "./helpers/fakeFirestore";
import { mocks } from "./helpers/mocks";

// Las páginas importan el formulario (componente de cliente): no hace falta renderizarlo
vi.mock("@/components/Admin/AdminReservationForm", () => ({ default: () => null }));
vi.mock("@/components/Admin/Reservations", () => ({ default: () => null }));
vi.mock("@/components/Admin/Filters", () => ({ default: () => null }));
vi.mock("@/components/Admin/PathStatusSection", () => ({ default: () => null }));
vi.mock("@/components/Admin/LogOut", () => ({ LogOut: () => null }));

describe("acciones del admin sin sesión", () => {
  it("crear reserva tira No autorizado y no guarda", async () => {
    await expect(createReservationWithEmail(reservation(), true)).rejects.toThrow("No autorizado");
    expect(fake.all("reservations")).toHaveLength(0);
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("editar reserva tira No autorizado y no cambia nada", async () => {
    fake.seed("reservations", "r1", reservation());
    await expect(updateReservationWithEmail("r1", { contactPhone: "999" }, false)).rejects.toThrow("No autorizado");
    expect(fake.get("reservations", "r1")!.contactPhone).toBe("123");
  });

  it("estado del camino devuelve error y no escribe", async () => {
    expect(await updatePathStatusAction("Cortado", "admin-panel")).toEqual({ success: false, error: "No autorizado" });
    expect(fake.get("pathStatus", "current")).toBeUndefined();
  });
});

describe("acciones del admin con sesión", () => {
  it("crear reserva y avisar al cliente", async () => {
    mocks.checkAdminAuth.mockResolvedValue(true);
    const r = await createReservationWithEmail(reservation({ reason: "Grupo escolar" }), true);
    expect(r.success).toBe(true);
    expect(fake.get("reservations", r.id!)!.reason).toBe("Grupo escolar");
    const subjects = mocks.resendSend.mock.calls.map((c: any) => c[0].subject);
    expect(subjects).toContain(`Confirmación de Reserva #${r.id} - Refugio Piltri`);
    expect(subjects).toContain("Reserva Creada - Test Tester");
  });

  it("sin tildar avisar no manda mails", async () => {
    mocks.checkAdminAuth.mockResolvedValue(true);
    await createReservationWithEmail(reservation(), false);
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("sin email del cliente no manda mails aunque se tilde avisar", async () => {
    mocks.checkAdminAuth.mockResolvedValue(true);
    await createReservationWithEmail(reservation({ contactEmail: "" }), true);
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("crear en fechas ocupadas tira el motivo", async () => {
    mocks.checkAdminAuth.mockResolvedValue(true);
    fake.seed("reservations", "c", reservation({ unit: "cabana", persons: 8 }));
    await expect(createReservationWithEmail(reservation({ unit: "cabana", persons: 8 }), false)).rejects.toThrow(/no están disponibles/);
  });

  it("editar en fechas ocupadas tira el motivo", async () => {
    mocks.checkAdminAuth.mockResolvedValue(true);
    fake.seed("reservations", "r1", reservation({ unit: "cabana", persons: 8 }));
    fake.seed("reservations", "r2", reservation({ unit: "cabana", persons: 8, startDate: "2026-11-20", endDate: "2026-11-22" }));
    await expect(
      updateReservationWithEmail("r1", { unit: "cabana", persons: 8, startDate: "2026-11-21", endDate: "2026-11-23" }, false)
    ).rejects.toThrow(/no están disponibles/);
  });

  it("estado del camino se guarda", async () => {
    mocks.checkAdminAuth.mockResolvedValue(true);
    expect(await updatePathStatusAction("Transitable con precaución", "admin-panel")).toEqual({ success: true });
    expect(fake.get("pathStatus", "current")).toMatchObject({ status: "Transitable con precaución", origin: "admin-panel" });
  });

  it("el formulario del admin llega bien a la acción (FormData -> reserva)", () => {
    const fd = new FormData();
    for (const [k, v] of Object.entries({
      unit: "dormitorio", persons: "2", startDate: "2026-11-10", endDate: "2026-11-12", reason: "", origin: "admin",
      status: "cancelada", contactName: "A", contactLastName: "B", contactEmail: "", contactPhone: "",
      includeBreakfastCampo: "true", includeBreakfastAmericano: "false", includeDinner: "true", isResident: "false",
    })) fd.append(k, v);
    expect(formToReservationData(fd)).toMatchObject({
      unit: "dormitorio", persons: 2, status: "cancelada", includeBreakfastCampo: true,
      includeBreakfastAmericano: false, includeDinner: true, isResident: false,
    });
  });
});

describe("páginas del admin sin sesión redirigen al login", () => {
  it.each([
    ["@/app/admin/page", { searchParams: Promise.resolve({}) }],
    ["@/app/admin/reservations/new/page", {}],
    ["@/app/admin/reservations/[id]/edit/page", { params: Promise.resolve({ id: "r1" }) }],
    ["@/app/admin/update/new/page", {}],
  ])("%s", async (path, props) => {
    const Page = (await import(/* @vite-ignore */ path)).default;
    await expect(Page(props)).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("con sesión la página de nueva reserva se muestra", async () => {
    mocks.checkAdminAuth.mockResolvedValue(true);
    const Page = (await import("@/app/admin/reservations/new/page")).default;
    await expect(Page()).resolves.toBeTruthy();
  });
});
