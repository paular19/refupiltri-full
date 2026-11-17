import { BookingData } from '@/lib/types';
import { UNITS } from '@/lib/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const ESTACIONAMIENTO_URL = 'https://maps.app.goo.gl/okpeSHCLDV3UwupP9';
const WHATSAPP_URL = 'https://wa.me/5492944120310';

const h2 = (text: string) =>
  `<h2 style="font-size:16px;margin:28px 0 8px;color:#2c5530;">${text}</h2>`;
const h3 = (text: string) =>
  `<h3 style="font-size:14px;margin:18px 0 4px;">${text}</h3>`;
const list = (items: string[]) =>
  `<ul style="margin:0;padding-left:20px;">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const link = (url: string) => `<a href="${url}" style="color:#2c5530;">${url}</a>`;

export function generateCustomerEmailTemplate(
  bookingData: BookingData,
  reservationId: string,
  isAdminCreated: boolean = false
): string {
  const startDateFormatted = format(bookingData.startDate, 'dd/MM/yyyy', { locale: es });
  const unitName = UNITS[bookingData.unit]?.name ?? bookingData.unit;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin:0;padding:0;background-color:#f9f9f9;">
      <div style="max-width:600px;margin:0 auto;padding:24px 20px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;background-color:#ffffff;">
        <p>¡Hola, ${escapeHtml(bookingData.contactName)}! Gracias por elegir el <strong>Refugio del Piltriquitrón</strong> 🏔️</p>

        <p>Te dejamos algunos datos importantes para tu estadía.</p>

        ${h2('📍 CÓMO LLEGAR')}
        <p>Desde El Bolsón son 10 km en vehículo hasta la Plataforma. Desde allí, 1,5 km de caminata hasta el refugio (aprox. 1 hora de ascenso y 400 m de desnivel positivo).</p>
        <p><strong>Estacionamiento:</strong> ${link(ESTACIONAMIENTO_URL)}</p>
        <p>🥾 Llevar calzado cómodo, bastones, protector solar, lentes de sol y hasta 1 litro de agua. A mitad del recorrido encontrarán un punto para recargar las botellas.</p>

        ${h2('🏡 INFORMACIÓN SOBRE TU ALOJAMIENTO')}

        ${h3('DORMITORIO DEL REFUGIO')}
        ${list([
          'Traer bolsa de dormir.',
          'Salón compartido en planta superior.',
          'Sin cocina para huéspedes.',
          'Check-in hasta las 21 h.',
        ])}

        ${h3('HABITACIÓN EN LA CABAÑA')}
        ${list([
          'Traer bolsa de dormir.',
          'Uso exclusivo como dormitorio, sin cocina.',
          'Check-in coordinado con el equipo.',
        ])}

        ${h3('CABAÑA COMPLETA')}
        ${list([
          'Traer bolsa de dormir.',
          'Cocina disponible. Utensilios a solicitar en el refugio.',
          'Check-in coordinado con el equipo.',
        ])}

        ${h3('DORMITORIO CON VISTA AL VALLE')}
        ${list([
          'Ropa de cama incluida.',
          'Sin cocina.',
          'Check-in coordinado con el equipo.',
        ])}

        ${h2('📲 CONSULTAS Y ACTIVIDADES')}
        <p>Senderos, actividades o cualquier consulta:<br>${link(WHATSAPP_URL)}</p>

        ${h2('CANCELACIONES')}
        <p>En temporada alta (01/12/2026 al 01/03/2027), las cancelaciones requieren un mínimo de 7 días de anticipación.</p>

        <hr style="border:none;border-top:1px solid #ddd;margin:28px 0;">

        ${h2('DETALLES DE TU RESERVA')}
        <p><strong>ID:</strong> ${escapeHtml(reservationId)}</p>
        <p><strong>Unidad:</strong> ${unitName}</p>
        <p><strong>Personas:</strong> ${bookingData.persons}</p>
        <p><strong>Entrada:</strong> ${startDateFormatted}</p>
      </div>
    </body>
    </html>
  `;
}
