import { Reservation, ReservationData } from "@/lib/types";

export const Step2 = ({
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
        Información Personal
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className="block text-sm font-poppins font-extralight mb-2"
            style={{ color: "#F7F8FA" }}
          >
            Nombre Completo
          </label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName as string}
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
            Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail as string}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label
          className="block text-sm font-poppins font-extralight mb-2"
          style={{ color: "#F7F8FA" }}
        >
          Teléfono
        </label>
        <input
          type="tel"
          name="contactPhone"
          value={formData.contactPhone as string}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
