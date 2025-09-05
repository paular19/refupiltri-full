'use client';

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { parseISO, addMonths, startOfDay, format } from 'date-fns';
import { UnitType, FormReservation } from '@/lib/types';
import { UNITS } from '@/lib/constants';
import 'react-day-picker/dist/style.css';
import React from 'react';

export const Step1 = ({
  formData,
  handleInputChange,
  setCurrentStep,
  setFormData,
}: {
  formData: FormReservation;
  handleInputChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
  setFormData: React.Dispatch<React.SetStateAction<FormReservation>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [unavailableDatesSet, setUnavailableDatesSet] = useState<Set<string>>(new Set());
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [validatingReservation, setValidatingReservation] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);

  const selectedUnit = formData.unit ? UNITS[formData.unit] : UNITS.refugio;

  const validateAvailability = async (unit: UnitType, persons: number, startDate: string, endDate: string) => {
    const response = await fetch(`/api/availability?action=validate&unit=${unit}&persons=${persons}&startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) throw new Error('Error validating availability');
    return await response.json();
  };

  useEffect(() => {
    if (!formData.unit) {
      setUnavailableDatesSet(new Set());
      return;
    }

    const loadUnavailableDates = async () => {
      setLoadingAvailability(true);
      setAvailabilityError('');

      try {
        const today = startOfDay(new Date());
        const future = addMonths(today, 12);
        const apiUrl = `/api/availability?unit=${formData.unit}&persons=${formData.persons || 1}&startDate=${format(today,'yyyy-MM-dd')}&endDate=${format(future,'yyyy-MM-dd')}`;

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Error fetching availability');

        const data = await response.json();
        const unavailable = data.unavailableDates || [];
        setUnavailableDatesSet(new Set<string>(unavailable as string[]));
      } catch (error) {
        setAvailabilityError('Error al cargar la disponibilidad');
        setUnavailableDatesSet(new Set());
      } finally {
        setLoadingAvailability(false);
      }
    };

    loadUnavailableDates();
  }, [formData.unit, formData.persons]);

  const getPersonsOptions = () => {
    if (selectedUnit.isIndividual) {
      return Array.from({ length: selectedUnit.capacity }, (_, i) => i + 1);
    }
    return [selectedUnit.capacity];
  };

  const prevUnitRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (prevUnitRef.current !== selectedUnit.type) {
      setFormData((prev: any) => ({
        ...prev,
        persons: selectedUnit.isIndividual ? 1 : selectedUnit.capacity,
      }));
    }
    prevUnitRef.current = selectedUnit.type;
  }, [selectedUnit.type, selectedUnit.capacity, selectedUnit.isIndividual, setFormData]);

  const isDateUnavailable = (date: Date) => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    return dateStr < todayStr || unavailableDatesSet.has(dateStr);
  };

  const handleContinue = async () => {
    if (!formData.unit || !formData.startDate || !formData.endDate) return;

    setValidatingReservation(true);
    setAvailabilityError('');

    try {
      const availabilityCheck = await validateAvailability(
        formData.unit as UnitType,
        formData.persons || 1,
        formData.startDate,
        formData.endDate
      );

      if (!availabilityCheck.available) {
        setAvailabilityError(availabilityCheck.message || 'No hay disponibilidad para las fechas seleccionadas');
        return;
      }

      setCurrentStep(2);
    } catch (error) {
      setAvailabilityError('Error al validar la reserva. Intente nuevamente.');
    } finally {
      setValidatingReservation(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-poppins font-thin mb-4" style={{ color: "#F7F8FA" }}>
        Detalles de la Reserva
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-poppins font-extralight mb-2" style={{ color: "#F7F8FA" }}>
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
          <label className="block text-sm font-poppins font-extralight mb-2" style={{ color: "#F7F8FA" }}>
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

      {/* Inputs separados para fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-poppins font-extralight mb-1" style={{ color: "#F7F8FA" }}>Fecha de Ingreso</label>
          <input
            type="text"
            readOnly
            value={formData.startDate ? format(parseISO(formData.startDate), 'dd/MM/yyyy') : ''}
            onClick={() => { setShowCalendar(true); setSelectingStart(true); }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer"
            placeholder="Seleccionar fecha de ingreso"
          />
        </div>

        <div>
          <label className="block text-sm font-poppins font-extralight mb-1" style={{ color: "#F7F8FA" }}>Fecha de Salida</label>
          <input
            type="text"
            readOnly
            value={formData.endDate ? format(parseISO(formData.endDate), 'dd/MM/yyyy') : ''}
            onClick={() => { setShowCalendar(true); setSelectingStart(false); }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer"
            placeholder="Seleccionar fecha de salida"
          />
        </div>
      </div>

      {/* Calendario */}
      {showCalendar && (
        <div className="bg-white p-4 rounded-lg mt-2">
          {loadingAvailability ? (
            <div className="flex items-center justify-center p-8 text-white">
              Cargando disponibilidad...
            </div>
          ) : (
            <DayPicker
              mode="single"
              selected={selectingStart
                ? formData.startDate ? parseISO(formData.startDate) : undefined
                : formData.endDate ? parseISO(formData.endDate) : undefined
              }
              onSelect={(date) => {
                if (!date) return;
                const formattedISO = format(date, 'yyyy-MM-dd');
                if (selectingStart) {
                  setFormData(prev => ({ ...prev, startDate: formattedISO }));
                  setSelectingStart(false);
                } else {
                  setFormData(prev => ({ ...prev, endDate: formattedISO }));
                  setShowCalendar(false);
                  setSelectingStart(true);
                }
              }}
              disabled={isDateUnavailable}
              locale={es}
              numberOfMonths={2}
              defaultMonth={formData.startDate ? parseISO(formData.startDate) : new Date()}
              classNames={{
                months: "flex gap-2",
                month: "rounded-lg border border-[#1A222B] p-2", // borde oscuro del mes
                caption: "flex justify-between items-center mb-2 text-[#1A222B] font-bold", // título del mes azul oscuro
                nav_button: "text-[#1A222B] hover:text-[#1A222B] transition-colors duration-200", // flechas azul oscuro
                day_selected: "bg-[#1A222B] text-white hover:bg-[#1A222B]",
                day_range_middle: "bg-[#C0DAE0] text-[#1A222B]",
                day_disabled: "text-red-300 line-through cursor-not-allowed opacity-50 bg-red-50",
                day: "hover:bg-blue-100",
              }}
            />
          )}
        </div>
      )}

      {/* Checkboxes de desayuno y almuerzo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeBreakfast"
            name="includeBreakfast"
            checked={formData.includeBreakfast ?? false}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                includeBreakfast: e.target.checked,
              }))
            }
          />
          <label htmlFor="includeBreakfast" className="text-sm font-poppins font-extralight" style={{ color: "#F7F8FA" }}>
            Incluir Desayuno
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeLunch"
            name="includeLunch"
            checked={formData.includeLunch ?? false}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                includeLunch: e.target.checked,
              }))
            }
          />
          <label htmlFor="includeLunch" className="text-sm font-poppins font-extralight" style={{ color: "#F7F8FA" }}>
            Incluir Almuerzo
          </label>
        </div>
      </div>

      {availabilityError && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {availabilityError}
        </div>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={validatingReservation || !formData.startDate || !formData.endDate || !formData.unit}
        className="w-full bg-[#C0DAE0] text-[#6E6F30] py-3 rounded-lg font-poppins font-extralight hover:bg-[#A9C5CE] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {validatingReservation ? 'Validando...' : 'Continuar'}
      </button>
    </div>
  );
};
