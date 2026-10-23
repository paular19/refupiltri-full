import { vi, beforeEach } from "vitest";
import { fake } from "./helpers/fakeFirestore";
import { mocks } from "./helpers/mocks";

// Servicios externos: siempre simulados (nada de Firestore, MercadoPago ni Resend reales)
vi.mock("@/lib/firebase/config", async () => {
  const { fakeFirebaseModule } = await import("./helpers/fakeFirestore");
  return fakeFirebaseModule();
});

vi.mock("resend", async () => {
  const { mocks } = await import("./helpers/mocks");
  return {
    Resend: class {
      emails = { send: mocks.resendSend };
    },
  };
});

vi.mock("mercadopago", async () => {
  const { mocks } = await import("./helpers/mocks");
  return {
    MercadoPagoConfig: class {},
    Preference: class {
      create = mocks.preferenceCreate;
    },
    Payment: class {
      get = mocks.paymentGet;
    },
  };
});

vi.mock("@/lib/auth/server", async () => {
  const { mocks } = await import("./helpers/mocks");
  return { checkAdminAuth: mocks.checkAdminAuth };
});

vi.mock("next/navigation", async () => {
  const { mocks } = await import("./helpers/mocks");
  return { redirect: mocks.redirect, useRouter: () => ({ push: () => {} }) };
});

vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

process.env.ADMIN_EMAIL = "admin@example.com";
process.env.NEXT_PUBLIC_RETURN_URL = "https://refugio.test";

beforeEach(() => {
  fake.reset();
  vi.clearAllMocks();
  mocks.checkAdminAuth.mockResolvedValue(false);
  mocks.preferenceCreate.mockResolvedValue({ id: "pref-123" });
  mocks.resendSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
  delete process.env.NEXT_PUBLIC_AVOID_MP;
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
