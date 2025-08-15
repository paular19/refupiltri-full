import React from "react";
import { Check } from "lucide-react";

export const StepHeaders = ({ currentStep }: { currentStep: number }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step ? "text-[#6E6F30]" : "text-[#F7F8FA]"
              }`}
              style={{
                backgroundColor: currentStep >= step ? "#C0DAE0" : "#E5E7EB",
              }}
            >
              {currentStep > step ? <Check size={16} /> : `${step}`}
            </div>
            {step < 3 && (
              <div
                className={`w-16 h-1 ${
                  currentStep >= step + 1 ? "" : "bg-[#F7F8FA]"
                }`}
                style={{
                  backgroundColor:
                    currentStep >= step + 1 ? "#C0DAE0" : undefined,
                }}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
