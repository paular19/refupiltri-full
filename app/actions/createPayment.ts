"use server";
import { ReservationData } from "@/lib/types";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";

export async function createPaymentAction(formData: ReservationData) {
  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });

  const { persons, unit, startDate, endDate } = formData;
  const id = randomUUID();
  const title = `${unit} x ${persons}, ${startDate} - ${endDate}`;

  // TODO: necesitamos que saque de la BD, los precios por unidad
  const PRICE = 1;

  //TODO: cambiar DIAS a una funcion que calcula endDate - startDate
  const DIAS = 1;

  const preference = await new Preference(client).create({
    body: {
      items: [
        {
          id,
          title,
          quantity: persons || 1 * DIAS,
          currency_id: "ARS",
          unit_price: PRICE,
        },
      ],
      back_urls: {
        success: `${process.env.BASE_URL}/payment/success`,
        failure: `${process.env.BASE_URL}/payment/failure`,
        pending: `${process.env.BASE_URL}/payment/pending`,
      },
      auto_return: "approved",
    },
  });
  redirect(preference.init_point!); // URL to redirect user
}
