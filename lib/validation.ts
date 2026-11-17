// Validaciones de las reservas web. Las usa el formulario (para avisar al cliente)
// y la API (porque un pedido puede llegar directo, sin pasar por el formulario).

export type ContactFields = {
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PHONE_DIGITS = 6;

export function validateContact(data: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  const name = (data.contactName ?? "").trim();
  const email = (data.contactEmail ?? "").trim();
  const phone = (data.contactPhone ?? "").trim();

  if (!name) errors.contactName = "Ingresá tu nombre";

  if (!email) errors.contactEmail = "Ingresá tu email";
  else if (!EMAIL_REGEX.test(email)) errors.contactEmail = "El email no es válido";

  if (!phone) errors.contactPhone = "Ingresá tu teléfono";
  else if (!/^[\d\s+()-]+$/.test(phone) || phone.replace(/\D/g, "").length < MIN_PHONE_DIGITS)
    errors.contactPhone = "El teléfono no es válido";

  return errors;
}

// Fecha de hoy en Argentina como 'YYYY-MM-DD'. El servidor corre en UTC:
// a las 22 h de Argentina en UTC ya es el día siguiente.
export function todayInArgentina(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function isPastDate(date: string, now: Date = new Date()): boolean {
  return date < todayInArgentina(now);
}
