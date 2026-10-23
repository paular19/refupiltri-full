import { MercadoPagoConfig, Preference } from 'mercadopago';
import { BookingData } from './types';
import { calculateNights, getBookingTotal, UNITS } from './constants';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function createPaymentPreference(bookingData: BookingData): Promise<string> {
  const preference = new Preference(client);

  const nights = calculateNights(bookingData.startDate, bookingData.endDate);
  const unit = UNITS[bookingData.unit];

  // Mismo cálculo que ve el cliente en el resumen (incluye descuento residente)
  const totalPrice = getBookingTotal(bookingData);

  const preferenceData = {
    items: [
      {
        id: `booking-${bookingData.unit}`,
        title: `Reserva ${unit.name} - ${nights} noches`,
        quantity: 1,
        unit_price: Number(totalPrice),
        currency_id: 'ARS',
      },
    ],
    payer: {
      name: bookingData.contactName,
      surname: bookingData.contactLastName || "",
      email: bookingData.contactEmail,
      phone: {
        number: String(bookingData.contactPhone || ""),
      },
    },
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_RETURN_URL}/booking/success`,
      failure: `${process.env.NEXT_PUBLIC_RETURN_URL}/booking/failure`,
      pending: `${process.env.NEXT_PUBLIC_RETURN_URL}/booking/pending`,
    },
    auto_return: 'approved',
    notification_url: `${process.env.NEXT_PUBLIC_RETURN_URL}/api/webhooks/mercadopago`,
    metadata: {
      booking_data: JSON.stringify(bookingData),
    },
  };

  const response = await preference.create({ body: preferenceData });
  console.log("Preference created:", response.id);
  return response.id!;
}
