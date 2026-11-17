import { vi } from "vitest";

// Dobles de los servicios externos, compartidos entre setup y tests
export const mocks = {
  // Resend devuelve { data, error }: cuando falla, data es null y error trae el motivo
  resendSend: vi.fn(async (_email: any): Promise<{ data: { id: string } | null; error: { name: string; message: string } | null }> => ({ data: { id: "email-1" }, error: null })),
  preferenceCreate: vi.fn(async (_args: any) => ({ id: "pref-123" })),
  paymentGet: vi.fn(async (_args: any): Promise<any> => undefined),
  checkAdminAuth: vi.fn(async () => false),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
};
