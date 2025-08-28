import { BookingData } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function generateAdminEmailTemplate(
  bookingData: BookingData,
  reservationId: string,
  isAdminCreated: boolean = false
): string {
  const startDateFormatted = format(bookingData.startDate, 'dd/MM/yyyy', { locale: es });
  const endDateFormatted = format(bookingData.endDate, 'dd/MM/yyyy', { locale: es });

  return `
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
}