import { ReservationData } from "@/lib/types";

export const Step1 = ({
  formData,
  handleInputChange,
  setCurrentStep,
}: {
  formData: ReservationData;
  handleInputChange: any;
  setCurrentStep: any;
}) => {
  return (
    <div className="space-y-6">
      <h3
        className="text-xl font-poppins font-thin mb-4"
        style={{ color: "#F7F8FA" }}
      >
        Detalles de la Reserva
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className="block text-sm font-poppins font-extralight mb-2"
            style={{ color: "#F7F8FA" }}
          >
            Fecha de Entrada
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-poppins font-extralight mb-2"
            style={{ color: "#F7F8FA" }}
          >
            Fecha de Salida
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className="block text-sm font-poppins font-extralight mb-2"
            style={{ color: "#F7F8FA" }}
          >
            Número de Huéspedes
          </label>
          <select
            name="persons"
            value={formData.persons as number}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
          >
            {[...Array(8)].map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1} {i === 0 ? "Huésped" : "Huéspedes"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-poppins font-extralight mb-2"
            style={{ color: "#F7F8FA" }}
          >
            Tipo de Habitación
          </label>
          <select
            name="unit"
            value={formData.unit as string}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
          >
            <option value="private">Habitación Privada ($12,000/noche)</option>
            <option value="shared">Habitación Compartida ($8,000/noche)</option>
            <option value="dorm">Dormitorio ($5,000/noche)</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setCurrentStep(2)}
        className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
      >
        Continuar
      </button>
    </div>
  );
};
