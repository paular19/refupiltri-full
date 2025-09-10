'use client';

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { parseISO, addMonths, startOfDay, format } from 'date-fns';
import { UnitType, FormReservation, Reservation } from '@/lib/types';
import { UNITS, RESERVATION_STATUS, getRoomPrice } from '@/lib/constants';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { createReservationWithEmail, updateReservationWithEmail } from "@/app/actions/emailAdmin";
import { formToReservationData } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import 'react-day-picker/dist/style.css';
import React from 'react';

// Tipo para representar un Timestamp de Firebase
type Timestamp = {
  toDate(): Date;
};

interface AdminReservationFormProps {
  reservation?: Reservation & { 
    createdAt?: string | Timestamp;
    updatedAt?: string | Timestamp;
  };
  mode?: 'create' | 'edit';
}

function normalizeTimestamp(timestamp: string | Timestamp | undefined): string {
  if (!timestamp) return '';
  if (typeof timestamp === 'string') return timestamp;
  return timestamp.toDate().toISOString();
}

export default function AdminReservationForm({ reservation, mode = 'create' }: AdminReservationFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit' && reservation;
  
  const [formData, setFormData] = useState<FormReservation>(() => {
    if (isEditMode) {
      return {
        createdAt: normalizeTimestamp(reservation.createdAt),
        updatedAt: normalizeTimestamp(reservation.updatedAt),
        startDate: reservation.startDate ? format(new Date(reservation.startDate), 'yyyy-MM-dd') : '',
        endDate: reservation.endDate ? format(new Date(reservation.endDate), 'yyyy-MM-dd') : '',
        contactName: reservation.contactName || '',
        contactLastName: reservation.contactLastName || '',
        contactEmail: reservation.contactEmail || '',
        contactPhone: reservation.contactPhone || '',
        unit: reservation.unit || 'refugio',
        persons: reservation.persons || 1,
        reason: reservation.reason || '',
        includeBreakfast: reservation.includeBreakfast || false,
        includeLunch: reservation.includeLunch || false,
        isResident: reservation.isResident || false, 
        notifyUser: false,
        status: reservation.status || 'confirmed',
        origin: reservation.origin || 'admin',
      };
    }
    
    return {
      createdAt: '',
      updatedAt: '',
      startDate: '',
      endDate: '',
      contactName: '',
      contactLastName: '',
      contactEmail: '',
      contactPhone: '',
      unit: 'refugio',
      persons: 1,
      reason: '',
      includeBreakfast: false,
      includeLunch: false,
      isResident: false,
      notifyUser: true,
      status: 'confirmed',
      origin: 'admin',
    };
  });

  const [unavailableDatesSet, setUnavailableDatesSet] = useState<Set<string>>(new Set());
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const selectedUnit = formData.unit ? UNITS[formData.unit as UnitType] : UNITS.refugio;

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
        let apiUrl = `/api/availability?unit=${formData.unit}&persons=${formData.persons || 1}&startDate=${format(today,'yyyy-MM-dd')}&endDate=${format(future,'yyyy-MM-dd')}`;
        
        if (isEditMode && reservation?.id) {
          apiUrl += `&excludeReservationId=${reservation.id}`;
        }

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
  }, [formData.unit, formData.persons, isEditMode, reservation?.id]);

  // Función para obtener opciones de personas (coherente con Step1)
  const getPersonsOptions = () => {
    if (selectedUnit.isIndividual) {
      return Array.from({ length: selectedUnit.capacity }, (_, i) => i + 1);
    }
    
    // Para habitaciones que permiten selección de huéspedes
    if (selectedUnit.allowGuestSelection && selectedUnit.minGuests && selectedUnit.maxGuests) {
      const options = [];
      for (let i = selectedUnit.minGuests; i <= selectedUnit.maxGuests; i++) {
        options.push(i);
      }
      return options;
    }
    
    // Para otras habitaciones grupales, mantener capacidad fija
    return [selectedUnit.capacity];
  };

  // Effect para ajustar personas cuando cambie el tipo de unidad
  const prevUnitRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (prevUnitRef.current !== selectedUnit.type && !isEditMode) {
      let defaultPersons;
      
      if (selectedUnit.isIndividual) {
        defaultPersons = 1;
      } else if (selectedUnit.allowGuestSelection && selectedUnit.minGuests) {
        defaultPersons = selectedUnit.minGuests;
      } else {
        defaultPersons = selectedUnit.capacity;
      }
      
      setFormData(prev => ({
        ...prev,
        persons: defaultPersons,
      }));
    }
    prevUnitRef.current = selectedUnit.type;
  }, [selectedUnit.type, selectedUnit.capacity, selectedUnit.isIndividual, selectedUnit.allowGuestSelection, selectedUnit.minGuests, isEditMode]);

  const validateAvailability = async (unit: UnitType, persons: number, startDate: string, endDate: string) => {
    let apiUrl = `/api/availability?action=validate&unit=${unit}&persons=${persons}&startDate=${startDate}&endDate=${endDate}`;
    
    if (isEditMode && reservation?.id) {
      apiUrl += `&excludeReservationId=${reservation.id}`;
    }
    
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Error validating availability');
    return await response.json();
  };

  const isDateUnavailable = (date: Date) => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
    return dateStr < todayStr || unavailableDatesSet.has(dateStr);
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Función para verificar si el descuento de residente aplica
  const isResidentDiscountApplicable = () => {
    return formData.unit === 'refugio' || formData.unit === 'camping';
  };

  const handleSubmit = async () => {
    if (!formData.unit || !formData.startDate || !formData.endDate || !formData.contactName || !formData.contactLastName) {
      setSubmitError('Por favor complete todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
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

      const formDataToSubmit = new FormData();
      formDataToSubmit.append('unit', formData.unit);
      formDataToSubmit.append('persons', formData.persons?.toString() || '1');
      formDataToSubmit.append('startDate', formData.startDate);
      formDataToSubmit.append('endDate', formData.endDate);
      formDataToSubmit.append('contactName', formData.contactName || '');
      formDataToSubmit.append('contactLastName', formData.contactLastName || '');
      formDataToSubmit.append('contactEmail', formData.contactEmail || '');
      formDataToSubmit.append('contactPhone', formData.contactPhone || '');
      formDataToSubmit.append('reason', formData.reason || '');
      formDataToSubmit.append('origin', formData.origin || 'admin');
      formDataToSubmit.append('status', formData.status || 'confirmed');
      formDataToSubmit.append('includeBreakfast', formData.includeBreakfast ? 'true' : 'false');
      formDataToSubmit.append('includeLunch', formData.includeLunch ? 'true' : 'false');
      formDataToSubmit.append('isResident', formData.isResident ? 'true' : 'false'); // ✅ AGREGADO

      const reservationData = formToReservationData(formDataToSubmit);
      const shouldNotify = Boolean(formData.notifyUser && formData.contactEmail);

      if (isEditMode) {
        await updateReservationWithEmail(
          reservation.id!,
          reservationData,
          shouldNotify
        );
        console.log("Admin reservation updated:", reservation.id, "Email sent:", shouldNotify);
      } else {
        const result = await createReservationWithEmail(
          reservationData,
          shouldNotify
        );
        console.log("Admin reservation created:", result.id, "Email sent:", shouldNotify);
      }
      
      router.push('/admin');

    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} admin reservation:`, error);
      setSubmitError(error instanceof Error ? error.message : `Error al ${isEditMode ? 'actualizar' : 'crear'} la reserva`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Reserva</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unidad *</Label>
              <Select 
                value={formData.unit || 'refugio'} 
                onValueChange={(value) => handleInputChange('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una unidad" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UNITS).map((unit) => (
                    <SelectItem key={unit.type} value={unit.type}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Personas *</Label>
              {selectedUnit.isIndividual || selectedUnit.allowGuestSelection ? (
                <Select 
                  value={formData.persons?.toString() || (selectedUnit.minGuests || 1).toString()} 
                  onValueChange={(value) => handleInputChange('persons', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getPersonsOptions().map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'persona' : 'personas'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="number"
                  value={formData.persons || selectedUnit.capacity}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              )}
            </div>
          </div>

          {/* Inputs de fechas con calendario */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Entrada *</Label>
              <Input
                type="text"
                readOnly
                value={formData.startDate ? format(parseISO(formData.startDate), 'dd/MM/yyyy') : ''}
                onClick={() => { setShowCalendar(true); setSelectingStart(true); }}
                className="cursor-pointer"
                placeholder="Seleccionar fecha de entrada"
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de Salida *</Label>
              <Input
                type="text"
                readOnly
                value={formData.endDate ? format(parseISO(formData.endDate), 'dd/MM/yyyy') : ''}
                onClick={() => { setShowCalendar(true); setSelectingStart(false); }}
                className="cursor-pointer"
                placeholder="Seleccionar fecha de salida"
              />
            </div>
          </div>

          {/* Calendario */}
          {showCalendar && (
            <div className="bg-white p-4 rounded-lg border">
              {loadingAvailability ? (
                <div className="flex items-center justify-center p-8">
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
                      handleInputChange('startDate', formattedISO);
                      setSelectingStart(false);
                    } else {
                      handleInputChange('endDate', formattedISO);
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
                    month: "rounded-lg border border-gray-300 p-2",
                    caption: "flex justify-between items-center mb-2 text-gray-800 font-bold",
                    nav_button: "text-gray-600 hover:text-gray-800 transition-colors duration-200",
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                    day_range_middle: "bg-blue-100 text-blue-800",
                    day_disabled: "text-red-300 line-through cursor-not-allowed opacity-50 bg-red-50",
                    day: "hover:bg-blue-100",
                  }}
                />
              )}
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCalendar(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Motivo (Opcional)</Label>
              <Textarea
                value={formData.reason || ''}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Motivo del bloqueo o reserva especial"
              />
            </div>

            {isEditMode && (
              <>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select 
                    value={formData.status || 'confirmed'} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESERVATION_STATUS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Origen</Label>
                  <Input 
                    value={formData.origin || 'admin'}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input 
                value={formData.contactName || ''}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Apellido *</Label>
              <Input 
                value={formData.contactLastName || ''}
                onChange={(e) => handleInputChange('contactLastName', e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email" 
                value={formData.contactEmail || ''}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input 
                value={formData.contactPhone || ''}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeBreakfast" 
                checked={formData.includeBreakfast || false}
                onCheckedChange={(checked) => handleInputChange('includeBreakfast', checked)}
              />
              <Label htmlFor="includeBreakfast">Incluir Desayuno</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeLunch" 
                checked={formData.includeLunch || false}
                onCheckedChange={(checked) => handleInputChange('includeLunch', checked)}
              />
              <Label htmlFor="includeLunch">Incluir Almuerzo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isResident"
                checked={formData.isResident || false}
                disabled={!isResidentDiscountApplicable()}
                onCheckedChange={(checked) => handleInputChange('isResident', checked)}
              />
              <Label 
                htmlFor="isResident"
                className={!isResidentDiscountApplicable() ? 'opacity-50' : ''}
              >
                Es Residente
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notifyUser"
                checked={formData.notifyUser || false}
                onCheckedChange={(checked) => handleInputChange('notifyUser', checked)}
              />
              <Label htmlFor="notifyUser">
                {isEditMode 
                  ? "Notificar al usuario por email sobre los cambios"
                  : "Notificar al usuario por email"
                }
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensajes de error */}
      {(availabilityError || submitError) && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {availabilityError || submitError}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-between">
        <Link href="/admin">
          <Button variant="outline">
            Cancelar
          </Button>
        </Link>
        
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.startDate || !formData.endDate || !formData.unit || !formData.contactName || !formData.contactLastName}
          className="min-w-32"
        >
          {isSubmitting 
            ? (isEditMode ? 'Actualizando...' : 'Creando...')
            : (isEditMode ? 'Actualizar Reserva' : 'Crear Reserva')
          }
        </Button>
      </div>
    </div>
  );
}