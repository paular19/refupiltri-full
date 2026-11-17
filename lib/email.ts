import { Resend } from 'resend';
import { BookingData } from './types';
import { generateCustomerEmailTemplate } from './emails/templates/customer';
import { generateAdminEmailTemplate } from './emails/templates/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailPayload = Parameters<typeof resend.emails.send>[0];

// Resend no tira excepción cuando rechaza un envío (clave inválida, dominio sin
// verificar, límite de envíos...): devuelve { error }. Hay que revisarlo a mano.
async function sendEmail(payload: EmailPayload, label: string): Promise<boolean> {
  try {
    const { error } = await resend.emails.send(payload);
    if (error) {
      console.error(`Error enviando ${label}:`, error);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Error enviando ${label}:`, error);
    return false;
  }
}

export async function sendBookingConfirmation(
  bookingData: BookingData,
  reservationId: string,
  isAdminCreated: boolean = false
): Promise<void> {
  const customerEmailHtml = generateCustomerEmailTemplate(bookingData, reservationId, isAdminCreated);
  const adminEmailHtml = generateAdminEmailTemplate(bookingData, reservationId, isAdminCreated);

  // Email al cliente (solo si tiene email). Los errores no cortan la creación de la reserva.
  const customerPromise = bookingData.contactEmail
    ? sendEmail(
        {
          from: 'Refugio Piltri <reservas@refugiopiltriquitron.com>',
          to: [bookingData.contactEmail],
          subject: `Confirmación de Reserva #${reservationId} - Refugio Piltri`,
          html: customerEmailHtml,
        },
        `mail al cliente (reserva ${reservationId})`
      )
    : Promise.resolve(true);

  // Email al admin siempre
  const adminPromise = sendEmail(
    {
      from: 'Sistema Reservas <reservas@refugiopiltriquitron.com>',
      to: [process.env.ADMIN_EMAIL!],
      subject: `${isAdminCreated ? 'Reserva Creada' : 'Nueva Reserva Web'} - ${bookingData.contactName} ${bookingData.contactLastName}`,
      html: adminEmailHtml,
    },
    `mail al admin (reserva ${reservationId})`
  );

  const [customerOk, adminOk] = await Promise.all([customerPromise, adminPromise]);

  if (customerOk && adminOk) {
    console.log('Emails enviados correctamente para reserva:', reservationId);
    return;
  }

  // El cliente se quedó sin confirmación: avisar al admin para que lo contacte
  if (!customerOk && adminOk) {
    await sendAdminAlert(
      `No se pudo enviar la confirmación al cliente - ${bookingData.contactName} ${bookingData.contactLastName}`,
      [
        'La reserva se creó, pero falló el mail de confirmación al cliente.',
        'Conviene escribirle por otro medio.',
        '',
        `Reserva: ${reservationId}`,
        `Fechas: ${bookingData.startDate} a ${bookingData.endDate}`,
        `Email: ${bookingData.contactEmail}`,
        `Teléfono: ${bookingData.contactPhone}`,
      ].join('\n')
    );
  }
}

// Aviso al admin de algo que requiere acción manual (ej. pago aprobado sin reserva)
export async function sendAdminAlert(subject: string, text: string): Promise<void> {
  await sendEmail(
    {
      from: 'Sistema Reservas <reservas@refugiopiltriquitron.com>',
      to: [process.env.ADMIN_EMAIL!],
      subject,
      text,
    },
    `alerta al admin "${subject}"`
  );
}
