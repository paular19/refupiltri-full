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
    refugio: 12000,
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
  return nights * roomPrice * (formData?.persons || 1);
};

export const Step3 = ({ formData }: { formData: ReservationData }) => (
  <div className="space-y-6">
    {/* Inputs ocultos para enviar todos los datos, formData en HTML solo manda los inputs en el dom y
      aca ya perdimos los del step1 y step2 porque estan en el estado pero no en el DOM
    */}
    <input type="hidden" name="startDate" value={formData.startDate} />
    <input type="hidden" name="endDate" value={formData.endDate} />
    <input type="hidden" name="persons" value={formData.persons as number} />
    <input type="hidden" name="unit" value={formData.unit as string} />
    <input type="hidden" name="origin" value={"web"} />
    <input type="hidden" name="status" value={"confirmada"} />
    <input
      type="hidden"
      name="contactName"
      value={formData.contactName as string}
    />
    <input
      type="hidden"
      name="contactEmail"
      value={formData.contactEmail as string}
    />
    <input
      type="hidden"
      name="contactPhone"
      value={formData.contactPhone as string}
    />
    <input
      type="hidden"
      name="includeBreakfast"
      value={String(formData.includeBreakfast)}
    />
    <input
      type="hidden"
      name="includeLunch"
      value={String(formData.includeLunch)}
    />
    <input
      type="hidden"
      name="notifyUser"
      value={String(formData.notifyUser)}
    />
    <div className="p-6 rounded-lg" style={{ color: "#F7F8FA" }}>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="font-poppins font-normal">Fechas:</span>
          <span>
            {formData.startDate} - {formData.endDate}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-poppins font-normal">Noches:</span>
          <span>{calculateNights(formData)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-poppins font-normal">Huéspedes:</span>
          <span>{formData.persons}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-poppins font-normal">Habitación:</span>
          <span>{formData.unit}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-poppins font-normal">Precio por noche:</span>
          <span>${getRoomPrice(formData).toLocaleString()}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between text-xl font-poppins font-normal">
            <span>Total:</span>
            <span>${getTotalPrice(formData).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
