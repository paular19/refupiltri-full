import { BookingData } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function generateCustomerEmailTemplate(
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
              <li><strong>Desayuno de campo:</strong> ${bookingData.includeBreakfastCampo ? 'Incluido' : 'No incluido'}</li>
              <li><strong>Desayuno americano:</strong> ${bookingData.includeBreakfastAmericano ? 'Incluido' : 'No incluido'}</li>
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
}
