import { ReservationData } from "@/lib/types";
import { UNITS } from "@/lib/constants";
import React from "react";

export const Step1 = ({
  formData,
  handleInputChange,
  setCurrentStep,
  setFormData,
}: {
  formData: ReservationData;
  handleInputChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
  setFormData: React.Dispatch<React.SetStateAction<ReservationData>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const selectedUnit = formData.unit ? UNITS[formData.unit] : UNITS.refugio;

  const getPersonsOptions = () => {
    if (selectedUnit.isIndividual) {
      return Array.from({ length: selectedUnit.capacity }, (_, i) => i + 1);
    }
    return [selectedUnit.capacity];
  };

  const prevUnitRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (prevUnitRef.current !== selectedUnit.type) {
      setFormData((prev) => ({
        ...prev,
        persons: selectedUnit.isIndividual ? 1 : selectedUnit.capacity,
      }));
    }
    prevUnitRef.current = selectedUnit.type;
  }, [selectedUnit.type, selectedUnit.capacity, selectedUnit.isIndividual, setFormData]);

  return (
    <div className="space-y-6">
      <h3
        className="text-xl font-poppins font-thin mb-4"
        style={{ color: "#F7F8FA" }}
      >
        Detalles de la Reserva
      </h3>

      {/* Tipo de habitación y número de huéspedes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            className="block text-sm font-poppins font-extralight mb-2"
            style={{ color: "#F7F8FA" }}
          >
            Tipo de Habitación
          </label>
          <select
            name="unit"
            value={formData.unit ?? "refugio"}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
            required
          >
            {Object.values(UNITS).map((unit) => (
              <option key={unit.type} value={unit.type}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-sm font-poppins font-extralight mb-2"
            style={{ color: "#F7F8FA" }}
          >
            Número de Huéspedes
          </label>
          {selectedUnit.isIndividual ? (
            <select
              name="persons"
              value={formData.persons ?? 1}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
            >
              {getPersonsOptions().map((num) => (
                <option key={num} value={num.toString()}>
                  {num}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              name="persons"
              value={formData.persons ?? selectedUnit.capacity}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-200 cursor-not-allowed"
            />
          )}
        </div>
      </div>

      {/* Fecha de entrada y salida */}
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

      {/* Checkboxes de desayuno y almuerzo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeBreakfast"
            name="includeBreakfast"
            checked={formData.includeBreakfast  ?? false}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                includeBreakfast: e.target.checked,
              }))
            }
          />
          <label
            htmlFor="includeBreakfast"
            className="text-sm font-poppins font-extralight"
            style={{ color: "#F7F8FA" }}
          >
            Incluir Desayuno
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeLunch"
            name="includeLunch"
            checked={formData.includeLunch  ?? false}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                includeLunch: e.target.checked,
              }))
            }
          />
          <label
            htmlFor="includeLunch"
            className="text-sm font-poppins font-extralight"
            style={{ color: "#F7F8FA" }}
          >
            Incluir Almuerzo
          </label>
        </div>
      </div>

      {/* Botón continuar */}
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
