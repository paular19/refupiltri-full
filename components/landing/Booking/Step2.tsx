import { useState } from "react";
import { ReservationData } from "@/lib/types";
import { ContactErrors, validateContact } from "@/lib/validation";

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent ${
    hasError ? "border-red-500" : "border-gray-300"
  }`;

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="mt-1 text-sm font-poppins text-red-200">
      {message}
    </p>
  ) : null;

export const Step2 = ({
  formData,
  handleInputChange,
  setCurrentStep,
}: {
  formData: ReservationData;
  handleInputChange: any;
  setCurrentStep: any;
}) => {
  const [errors, setErrors] = useState<ContactErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    // al corregir un campo se borra su error
    const name = e.target.name as keyof ContactErrors;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleContinue = () => {
    const found = validateContact(formData);
    setErrors(found);
    if (Object.keys(found).length === 0) setCurrentStep(3);
  };

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
            htmlFor="contactName"
            className="block text-sm font-poppins font-extralight mb-2"
            style={{ color: "#F7F8FA" }}
          >
            Nombre Completo
          </label>
          <input
            id="contactName"
            type="text"
            name="contactName"
            autoComplete="name"
            value={formData.contactName as string}
            onChange={handleChange}
            aria-invalid={!!errors.contactName}
            className={inputClass(!!errors.contactName)}
            required
          />
          <FieldError message={errors.contactName} />
        </div>
        <div>
          <label
            htmlFor="contactEmail"
            className="block text-sm font-poppins font-extralight mb-2"
            style={{ color: "#F7F8FA" }}
          >
            Email
          </label>
          <input
            id="contactEmail"
            type="email"
            name="contactEmail"
            autoComplete="email"
            value={formData.contactEmail as string}
            onChange={handleChange}
            aria-invalid={!!errors.contactEmail}
            className={inputClass(!!errors.contactEmail)}
            required
          />
          <FieldError message={errors.contactEmail} />
        </div>
      </div>

      <div>
        <label
          htmlFor="contactPhone"
          className="block text-sm font-poppins font-extralight mb-2"
          style={{ color: "#F7F8FA" }}
        >
          Teléfono
        </label>
        <input
          id="contactPhone"
          type="tel"
          name="contactPhone"
          autoComplete="tel"
          value={formData.contactPhone as string}
          onChange={handleChange}
          aria-invalid={!!errors.contactPhone}
          className={inputClass(!!errors.contactPhone)}
          required
        />
        <FieldError message={errors.contactPhone} />
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
          onClick={handleContinue}
          className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
