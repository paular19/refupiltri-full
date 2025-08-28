import { Resend } from 'resend';
import { BookingData } from './types';
import { generateCustomerEmailTemplate } from './emails/templates/customer';
import { generateAdminEmailTemplate } from './emails/templates/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(
  bookingData: BookingData,
  reservationId: string,
  isAdminCreated: boolean = false
) {
  const customerEmailHtml = generateCustomerEmailTemplate(bookingData, reservationId, isAdminCreated);
  const adminEmailHtml = generateAdminEmailTemplate(bookingData, reservationId, isAdminCreated);

  try {
    const emailPromises = [];

    // Email al cliente (solo si tiene email)
    if (bookingData.contactEmail) {
      emailPromises.push(
        resend.emails.send({
          from: 'Refugio Piltri <onboarding@resend.dev>',
          to: [bookingData.contactEmail],
          subject: `Confirmación de Reserva #${reservationId} - Refugio Piltri`,
          html: customerEmailHtml,
        })
      );
    }

    // Email al admin siempre
    emailPromises.push(
      resend.emails.send({
        from: 'Sistema Reservas <onboarding@resend.dev>',
        to: [process.env.ADMIN_EMAIL!],
        subject: `${isAdminCreated ? 'Reserva Creada' : 'Nueva Reserva Web'} - ${bookingData.contactName} ${bookingData.contactLastName}`,
        html: adminEmailHtml,
      })
    );

    await Promise.all(emailPromises);
    console.log('Emails enviados correctamente para reserva:', reservationId);
    
  } catch (error) {
    console.error('Error enviando emails:', error);
    // No lanzar error para no interrumpir el flujo de creación de reservas
  }
}