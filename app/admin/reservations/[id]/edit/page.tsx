// app/admin/reservations/[id]/edit/page.tsx
import { getReservationById, updateReservationAction } from "@/app/actions/reservations";
import { sendBookingConfirmation } from "@/lib/email";
import { reservationToBookingData, formToReservationData } from "@/lib/utils";
import { redirect } from "next/navigation";
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
import { UNITS, RESERVATION_STATUS } from "@/lib/constants";
import { format } from "date-fns";
import Link from "next/link";


interface EditReservationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditReservationPage({ params }: EditReservationPageProps) {
  const { id } = await params;
  
  // Obtener la reserva existente
  const reservation = await getReservationById(id);
  
  if (!reservation) {
    redirect("/admin");
  }

  const handleAction = async (formData: FormData) => {
    "use server";
    
    try {
      const updatedReservation = formToReservationData(formData);
      const shouldNotify = formData.get("notifyUser") === "on";
      
      // Actualizar reserva
      await updateReservationAction(id, updatedReservation);
      
      // Enviar email solo si el checkbox está marcado Y hay email
      if (shouldNotify && updatedReservation.contactEmail) {
        const bookingData = reservationToBookingData(updatedReservation);
        await sendBookingConfirmation(bookingData, id, true);
      }
      
      console.log("Admin reservation updated:", id, "Email sent:", shouldNotify);
      
    } catch (error) {
      console.error("Error updating admin reservation:", error);
      throw error;
    }
    
    redirect("/admin");
  };

  // Formatear fechas para los inputs (compatible con Firebase Admin Timestamp)
  const formatDateForInput = (timestamp: any) => {
    if (!timestamp) return "";
    // Firebase Admin Timestamp tiene el método toDate()
    const dateObj = timestamp.toDate();
    return format(dateObj, "yyyy-MM-dd");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold ml-4">Editar Reserva</h1>
          </div>

          <form action={handleAction} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unidad *</Label>
                    <Select name="unit" defaultValue={reservation.unit}>
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
                    <Select name="persons" defaultValue={reservation.persons.toString()}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha de Entrada *</Label>
                    <Input 
                      type="date" 
                      name="startDate" 
                      defaultValue={formatDateForInput(reservation.startDate)}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha de Salida *</Label>
                    <Input 
                      type="date" 
                      name="endDate" 
                      defaultValue={formatDateForInput(reservation.endDate)}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Motivo (Opcional)</Label>
                    <Textarea
                      name="reason"
                      defaultValue={reservation.reason || ""}
                      placeholder="Motivo del bloqueo o reserva especial"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Origen</Label>
                    <Input 
                      name="origin" 
                      defaultValue={reservation.origin || "manual"} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select name="status" defaultValue={reservation.status}>
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
                      name="contactName" 
                      defaultValue={reservation.contactName}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Apellido *</Label>
                    <Input 
                      name="contactLastName" 
                      defaultValue={reservation.contactLastName}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      name="contactEmail" 
                      defaultValue={reservation.contactEmail || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input 
                      name="contactPhone" 
                      defaultValue={reservation.contactPhone || ""}
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeBreakfast" 
                      name="includeBreakfast" 
                      defaultChecked={reservation.includeBreakfast}
                    />
                    <Label htmlFor="includeBreakfast">Incluir Desayuno</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeLunch" 
                      name="includeLunch" 
                      defaultChecked={reservation.includeLunch}
                    />
                    <Label htmlFor="includeLunch">Incluir Almuerzo</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifyUser"
                      name="notifyUser"
                      defaultChecked={false}
                    />
                    <Label htmlFor="notifyUser">
                      Notificar al usuario por email sobre los cambios
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-row justify-between">
              <Link href="/admin">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit">Actualizar Reserva</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}