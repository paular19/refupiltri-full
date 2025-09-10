import { FormReservation } from "@/lib/types";
import { UNITS, PRICES, getRoomPrice } from "@/lib/constants";

const calculateNights = (formData: FormReservation) => {
  if (formData.startDate && formData.endDate) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return 0;
};

// Función para calcular descuento de residente
const getResidentDiscount = (formData: FormReservation) => {
  if (!formData.isResident) return 0;

  // Solo aplicar descuento para refugio y camping
  if (formData.unit === 'refugio' || formData.unit === 'camping') {
    const nights = calculateNights(formData);
    const persons = formData.persons || 1;
    return 3000 * persons * nights; // $3000 por persona por noche
  }

  return 0;
};

const getRoomTotalPrice = (formData: FormReservation) => {
  const nights = calculateNights(formData);
  const persons = formData.persons || 1;
  const unitType = formData.unit || 'refugio';

  // Obtener el precio base por noche usando la función helper
  const basePrice = getRoomPrice(unitType, persons);

  // Para habitaciones individuales, multiplicar por personas y noches
  const selectedUnit = UNITS[unitType];
  if (selectedUnit?.isIndividual) {
    const totalPrice = basePrice * persons * nights;
    // Aplicar descuento de residente si corresponde
    const discount = getResidentDiscount(formData);
    return Math.max(0, totalPrice - discount); // No permitir precios negativos
  }

  // Para habitaciones grupales, el precio ya está calculado para el grupo completo
  return basePrice * nights;
};


const getExtrasPrice = (formData: FormReservation) => {
  const nights = calculateNights(formData);
  const persons = formData.persons || 1;
  let extras = 0;

  if (formData.includeBreakfast) {
    extras += (PRICES.breakfast as number) * persons * nights;
  }
  if (formData.includeLunch) {
    extras += (PRICES.lunch as number) * persons * nights;
  }

  return extras;
};

//TODO VER SI SE AGREGA 
// const getExtrasPrice = (formData: FormReservation) => {
//   const nights = calculateNights(formData);
//   const persons = formData.persons || 1;
//   let extras = 0;

//   if (formData.includeBreakfast) {
//     extras += PRICES.breakfast * persons * nights;
//   }
//   if (formData.includeLunch) {
//     extras += PRICES.lunch * persons * nights;
//   }

//   return extras;
// };

const getTotalPrice = (formData: FormReservation) => {
  return getRoomTotalPrice(formData) + getExtrasPrice(formData);
};

export const Step3 = ({ formData }: { formData: FormReservation }) => {
  const nights = calculateNights(formData);
  const persons = formData.persons || 1;
  const unitType = formData.unit || 'refugio';
  const selectedUnit = UNITS[unitType];

  // Precios calculados
  const roomTotalPrice = getRoomTotalPrice(formData);
  const baseRoomPrice = getRoomPrice(unitType, persons);
  const residentDiscount = getResidentDiscount(formData); // CORREGIDO: era calculateResidentDiscount
  const breakfastTotalPrice = formData.includeBreakfast
    ? (PRICES.breakfast as number) * persons * nights
    : 0;

  const lunchTotalPrice = formData.includeLunch
    ? (PRICES.lunch as number) * persons * nights
    : 0;
  //TODO VER SI SE AGREGA 
  // const breakfastTotalPrice = formData.includeBreakfast ? PRICES.breakfast * persons * nights : 0;
  // const lunchTotalPrice = formData.includeLunch ? PRICES.lunch * persons * nights : 0;

  return (
    <div className="space-y-6">
      {/* Inputs ocultos para enviar datos */}
      {Object.entries({
        startDate: formData.startDate,
        endDate: formData.endDate,
        persons,
        unit: formData.unit,
        origin: "web",
        status: "confirmada",
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        includeBreakfast: formData.includeBreakfast,
        includeLunch: formData.includeLunch,
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

          {/* Mostrar precio base diferente según el tipo */}
          {selectedUnit?.isIndividual ? (
            <div className="flex justify-between">
              <span>Precio por persona/noche:</span>
              <span>${baseRoomPrice.toLocaleString('es-AR')}</span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span>Precio por noche ({persons} personas):</span>
              <span>${baseRoomPrice.toLocaleString('es-AR')}</span>
            </div>
          )}

          {/* Mostrar descuento de residente si aplica */}
          {residentDiscount > 0 && (
            <div className="flex justify-between text-[#C0DAE0]">
              <span>Descuento residente:</span>
              <span>-${residentDiscount.toLocaleString('es-AR')}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold">
            <span>Subtotal habitación:</span>
            <span>${roomTotalPrice.toLocaleString('es-AR')}</span>
          </div>

          {/* Extras */}
          {formData.includeBreakfast && (
            <div className="flex justify-between">
              <span>Desayuno ({persons} personas x {nights} noches):</span>
              <span>${breakfastTotalPrice.toLocaleString('es-AR')}</span>
            </div>
          )}
          {formData.includeLunch && (
            <div className="flex justify-between">
              <span>Almuerzo ({persons} personas x {nights} noches):</span>
              <span>${lunchTotalPrice.toLocaleString('es-AR')}</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-400 pt-3">
          <div className="flex justify-between text-xl font-poppins font-bold">
            <span>Total:</span>
            <span>${getTotalPrice(formData).toLocaleString('es-AR')}</span>
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