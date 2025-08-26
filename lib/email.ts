// lib/email.ts - Configuración actualizada de Resend
import { Resend } from 'resend';
import { BookingData } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(
  bookingData: BookingData,
  reservationId: string,
  isAdminCreated: boolean = false
) {
  const startDateFormatted = format(bookingData.startDate, 'dd/MM/yyyy', { locale: es });
  const endDateFormatted = format(bookingData.endDate, 'dd/MM/yyyy', { locale: es });

  const customerEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c5530; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { background-color: #2c5530; color: white; padding: 15px; text-align: center; }
        ul { list-style: none; padding: 0; }
        li { padding: 8px 0; border-bottom: 1px solid #eee; }
        li:last-child { border-bottom: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Confirmación de Reserva</h1>
          <p>Refugio de Montaña Piltri</p>
        </div>
        
        <div class="content">
          <p>Estimado/a <strong>${bookingData.contactName} ${bookingData.contactLastName}</strong>,</p>
          
          <p>${isAdminCreated 
            ? 'Su reserva ha sido registrada por nuestro equipo administrativo.' 
            : 'Su reserva ha sido confirmada exitosamente tras el pago.'}</p>
          
          <div class="details">
            <h3>Detalles de la Reserva</h3>
            <ul>
              <li><strong>ID de Reserva:</strong> ${reservationId}</li>
              <li><strong>Unidad:</strong> ${bookingData.unit}</li>
              <li><strong>Personas:</strong> ${bookingData.persons}</li>
              <li><strong>Fecha de Entrada:</strong> ${startDateFormatted}</li>
              <li><strong>Fecha de Salida:</strong> ${endDateFormatted}</li>
              <li><strong>Desayuno:</strong> ${bookingData.includeBreakfast ? 'Incluido' : 'No incluido'}</li>
              <li><strong>Almuerzo:</strong> ${bookingData.includeLunch ? 'Incluido' : 'No incluido'}</li>
            </ul>
          </div>

          <p>Por favor, conserve este email como comprobante de su reserva.</p>
          <p>Si tiene alguna consulta, puede contactarnos a este email.</p>
        </div>
        
        <div class="footer">
          <p>Refugio de Montaña Piltri<br>
          Email: ${process.env.ADMIN_EMAIL}<br>
          Esperamos verlo pronto!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const adminEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f3f4f6; }
        .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge-web { background-color: #10b981; color: white; }
        .badge-admin { background-color: #f59e0b; color: white; }
        ul { list-style: none; padding: 0; }
        li { padding: 8px 0; border-bottom: 1px solid #eee; }
        li:last-child { border-bottom: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isAdminCreated ? 'Reserva Creada por Admin' : 'Nueva Reserva desde Web'}</h1>
          <span class="badge ${isAdminCreated ? 'badge-admin' : 'badge-web'}">
            ${isAdminCreated ? 'ADMIN' : 'WEB'}
          </span>
        </div>
        
        <div class="content">
          <div class="details">
            <h3>Información de la Reserva</h3>
            <ul>
              <li><strong>ID:</strong> ${reservationId}</li>
              <li><strong>Cliente:</strong> ${bookingData.contactName} ${bookingData.contactLastName}</li>
              <li><strong>Email:</strong> ${bookingData.contactEmail}</li>
              <li><strong>Teléfono:</strong> ${bookingData.contactPhone}</li>
              <li><strong>Unidad:</strong> ${bookingData.unit}</li>
              <li><strong>Personas:</strong> ${bookingData.persons}</li>
              <li><strong>Check-in:</strong> ${startDateFormatted}</li>
              <li><strong>Check-out:</strong> ${endDateFormatted}</li>
              <li><strong>Servicios extras:</strong> ${[
                bookingData.includeBreakfast && 'Desayuno',
                bookingData.includeLunch && 'Almuerzo'
              ].filter(Boolean).join(', ') || 'Ninguno'}</li>
              <li><strong>Origen:</strong> ${isAdminCreated ? 'Creada por administrador' : 'Reserva web con pago confirmado'}</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const emailPromises = [];

    // Email al cliente (solo si tiene email)
    if (bookingData.contactEmail) {
      emailPromises.push(
        resend.emails.send({
          from: 'Refugio Piltri <onboarding@resend.dev>', // Dominio sandbox de Resend
          to: [bookingData.contactEmail],
          subject: `Confirmación de Reserva #${reservationId} - Refugio Piltri`,
          html: customerEmailHtml,
        })
      );
    }

    // Email al admin siempre
    emailPromises.push(
      resend.emails.send({
        from: 'Sistema Reservas <onboarding@resend.dev>', // Dominio sandbox de Resend  
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

// Función auxiliar para convertir Reservation a BookingData
export function reservationToBookingData(reservation: any): BookingData {
  return {
    unit: reservation.unit,
    persons: reservation.persons,
    startDate: reservation.startDate instanceof Date ? reservation.startDate : reservation.startDate.toDate(),
    endDate: reservation.endDate instanceof Date ? reservation.endDate : reservation.endDate.toDate(),
    contactName: reservation.contactName || '',
    contactLastName: reservation.contactLastName || '',
    contactEmail: reservation.contactEmail || '',
    contactPhone: reservation.contactPhone || '',
    includeBreakfast: reservation.includeBreakfast || false,
    includeLunch: reservation.includeLunch || false,
  };
}