import { FormReservation } from "@/lib/types";
import {
  UNITS,
  PRICES,
  calculateNights,
  countWeekendNights,
  getRoomPrice,
  getResidentDiscount,
  getRoomTotalPrice,
  isPricedPerPerson,
} from "@/lib/constants";

export const Step3 = ({ formData }: { formData: FormReservation }) => {
  const nights = calculateNights(formData.startDate, formData.endDate);
  const weekendNights = countWeekendNights(formData.startDate, formData.endDate);
  const weekdayNights = nights - weekendNights;
  const persons = formData.persons || 1;
  const unitType = formData.unit || "refugio";
  const selectedUnit = UNITS[unitType];

  // Precios
  const roomTotalPrice = getRoomTotalPrice(unitType, persons, formData.startDate, formData.endDate, formData.isResident);
  const baseRoomPrice = getRoomPrice(unitType, persons);
  const residentDiscount = getResidentDiscount(unitType, persons, nights, formData.isResident);

  return (
    <div className="space-y-6">
      {/* Inputs ocultos */}
      {Object.entries({
        startDate: formData.startDate,
        endDate: formData.endDate,
        persons,
        unit: unitType,
        origin: "web",
        status: "confirmada",
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        includeBreakfastCampo: formData.includeBreakfastCampo,
        includeBreakfastAmericano: formData.includeBreakfastAmericano,
        includeDinner: formData.includeDinner,
        isResident: formData.isResident,
        notifyUser: formData.notifyUser,
      }).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={String(value)} />
      ))}

      <div className="p-6 rounded-lg bg-[#6E6F30] space-y-4 text-[#F7F8FA]">
        <h3 className="text-lg font-poppins font-semibold border-b border-gray-400 pb-2">
          Resumen de la Reserva
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Fechas:</span>
            <span>
              {formData.startDate} - {formData.endDate}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Noches:</span>
            <span>{nights}</span>
          </div>
          <div className="flex justify-between">
            <span>Huéspedes:</span>
            <span>{persons}</span>
          </div>
          <div className="flex justify-between">
            <span>Habitación:</span>
            <span>{selectedUnit?.name || unitType}</span>
          </div>

          {unitType === "cabana" ? (
            <>
              {weekdayNights > 0 && (
                <div className="flex justify-between">
                  <span>Noches de semana ({weekdayNights} x ${(PRICES.cabana as number).toLocaleString("es-AR")}):</span>
                  <span>${(weekdayNights * (PRICES.cabana as number)).toLocaleString("es-AR")}</span>
                </div>
              )}
              {weekendNights > 0 && (
                <div className="flex justify-between">
                  <span>Noches de fin de semana/feriado ({weekendNights} x ${(PRICES.cabanaWeekend as number).toLocaleString("es-AR")}):</span>
                  <span>${(weekendNights * (PRICES.cabanaWeekend as number)).toLocaleString("es-AR")}</span>
                </div>
              )}
            </>
          ) : isPricedPerPerson(unitType) ? (
            <div className="flex justify-between">
              <span>Precio por persona/noche:</span>
              <span>${baseRoomPrice.toLocaleString("es-AR")}</span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span>Precio por noche ({persons} {persons === 1 ? "persona" : "personas"}):</span>
              <span>${baseRoomPrice.toLocaleString("es-AR")}</span>
            </div>
          )}

          {residentDiscount > 0 && (
            <div className="flex justify-between text-[#C0DAE0]">
              <span>Descuento residente:</span>
              <span>- ${residentDiscount.toLocaleString("es-AR")}</span>
            </div>
          )}

          {formData.includeBreakfastCampo && (
            <div className="flex justify-between">
              <span>Desayuno de campo:</span>
              <span>Pedido</span>
            </div>
          )}
          {formData.includeBreakfastAmericano && (
            <div className="flex justify-between">
              <span>Desayuno americano:</span>
              <span>Pedido</span>
            </div>
          )}
          {formData.includeDinner && (
            <div className="flex justify-between">
              <span>Cena:</span>
              <span>Pedida</span>
            </div>
          )}
          {(formData.includeBreakfastCampo || formData.includeBreakfastAmericano || formData.includeDinner) && (
            <div className="text-sm text-[#C0DAE0]">
              Las comidas no se cobran en la reserva: solo nos avisás para tenerlas en cuenta.
            </div>
          )}
        </div>

        <div className="border-t border-gray-400 pt-3">
          <div className="flex justify-between text-xl font-poppins font-bold">
            <span>Total:</span>
            <span>${roomTotalPrice.toLocaleString("es-AR")}</span>
          </div>
          {formData.isResident && residentDiscount > 0 && (
            <div className="text-sm text-[#C0DAE0] mt-1">
              * Recordá que deberás mostrar tu DNI en el refugio
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
