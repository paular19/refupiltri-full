import { ReservationData } from "@/lib/types";

const calculateNights = (formData: ReservationData) => {
  if (formData.startDate && formData.endDate) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return 0;
};

const getRoomPrice = (formData: ReservationData) => {
  const prices: Record<string, number> = {
    refugio: 1,
    camping: 8000,
    cabana: 15000,
    habitacion1: 10000,
    habitacion2: 10000,
  };
  return prices[formData.unit as keyof typeof prices];
};

const getTotalPrice = (formData: ReservationData) => {
  const nights = calculateNights(formData);
  const roomPrice = getRoomPrice(formData);
  const persons = formData.persons || 1;
  let extras = 0;
  if (formData.includeBreakfast) extras += 1500 * persons;
  if (formData.includeLunch) extras += 2000 * persons;
  return nights * roomPrice * persons + extras;
};

export const Step3 = ({ formData }: { formData: ReservationData }) => {
  const nights = calculateNights(formData);
  const roomPrice = getRoomPrice(formData);
  const persons = formData.persons || 1;
  const breakfastPrice = formData.includeBreakfast ? 1 * persons : 0;
  const lunchPrice = formData.includeLunch ? 2000 * persons : 0;

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
            <span>{formData.startDate} - {formData.endDate}</span>
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
            <span>{formData.unit}</span>
          </div>
          <div className="flex justify-between">
            <span>Precio por noche:</span>
            <span>${roomPrice.toLocaleString()}</span>
          </div>

          {/* Extras */}
          {formData.includeBreakfast && (
            <div className="flex justify-between">
              <span>Desayuno:</span>
              <span>${breakfastPrice.toLocaleString()}</span>
            </div>
          )}
          {formData.includeLunch && (
            <div className="flex justify-between">
              <span>Almuerzo:</span>
              <span>${lunchPrice.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-400 pt-3">
          <div className="flex justify-between text-xl font-poppins font-bold">
            <span>Total:</span>
            <span>${getTotalPrice(formData).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
