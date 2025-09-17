import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadMore from "./LoadMore";
import { Reservation } from "@/lib/types";
import { UNITS } from "@/lib/constants";
import DeleteReservationButton from "./DeleteReservation";

interface ReservationsProps {
  reservations: Reservation[];
  deleteAction: (formData: FormData) => Promise<void>;
}

export default function Reservations({ reservations, deleteAction }: ReservationsProps) {
  const hasResidentInfo = reservations.some(reservation => reservation.isResident !== undefined);
  return (
    <div className="space-y-6">
      {reservations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay reservas que mostrar
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contacto</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Personas</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Desayuno de Campo</TableHead>
                <TableHead>Desayuno Americano</TableHead>
                <TableHead>Residente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <p className="font-medium">
                      {reservation.contactName} {reservation.contactLastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.contactEmail}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {UNITS[reservation.unit]?.name}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {reservation.persons}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{reservation.startDate}</p>
                    <p className="text-sm text-muted-foreground">
                      {reservation.endDate}
                    </p>
                  </TableCell>
                  <TableCell>
                    {reservation.includeBreakfastCampo ? (
                      <Badge variant="default">Sí</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {reservation.includeBreakfastAmericano ? (
                      <Badge variant="default">Sí</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {reservation.isResident !== undefined ? (
                      reservation.isResident ? (
                        <Badge variant="default">Sí</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{reservation.status}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{reservation.origin}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Link href={`/admin/reservations/${reservation.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteReservationButton
                      reservationId={reservation.id}
                      contactName={reservation.contactName}
                      deleteAction={deleteAction}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <LoadMore listLength={reservations.length} />
    </div>
  );
}