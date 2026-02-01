"use client";

import { useState } from "react";
import { CalendarClock, X } from "lucide-react";
import { useAvailableSlots, useMeetingBookings } from "@/hooks/useTurnos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import childSelectionStore from "@/store/childSelectionStore";
import type { AvailableSlot, MeetingBookingWithNames } from "@/types/turnos";
import { cn } from "@/lib/utils";

export default function ParentBookingView() {
  const { selectedChild } = childSelectionStore();
  const { bookings, isLoading: bookingsLoading, fetchBookings, createBooking, cancelBooking } = useMeetingBookings();
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const { slots, isLoading: slotsLoading, fetchSlots } = useAvailableSlots(selectedTeacherId || undefined);
  const [confirmSlot, setConfirmSlot] = useState<AvailableSlot | null>(null);

  const handleBookSlot = async (slot: AvailableSlot) => {
    if (!selectedChild?.id || !selectedTeacherId) return;
    const success = await createBooking({
      availability_id: slot.availability_id,
      student_id: selectedChild.id,
      teacher_id: selectedTeacherId,
      date: slot.date,
      start_time: slot.start_time,
    });
    if (success) {
      setConfirmSlot(null);
      fetchSlots(selectedTeacherId);
      fetchBookings();
    }
  };

  // Group slots by date
  const slotsByDate = slots.reduce<Record<string, AvailableSlot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Turnos para reuniones</h1>
        <p className="page-subtitle">Reserve un turno con los docentes de su hijo/a</p>
      </div>

      {/* My bookings */}
      <Card>
        <CardHeader><CardTitle className="text-base">Mis proximos turnos</CardTitle></CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div className="flex justify-center py-4"><LoadingSpinner /></div>
          ) : bookings.filter((b: MeetingBookingWithNames) => b.status === "booked").length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No tiene turnos reservados</p>
          ) : (
            <div className="space-y-2">
              {bookings.filter((b: MeetingBookingWithNames) => b.status === "booked").map((b: MeetingBookingWithNames) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-md bg-surface-muted">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{b.teacher_name}</p>
                    <p className="text-sm text-text-muted">
                      {new Date(b.date + "T00:00:00").toLocaleDateString("es-AR")} · {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                    </p>
                    <p className="text-sm text-text-muted">{b.location || "Virtual"}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => cancelBooking(b.id)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Select teacher - for now, enter teacher ID manually */}
      <Card>
        <CardHeader><CardTitle className="text-base">Reservar nuevo turno</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-primary">ID del docente</label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ingrese el ID del docente"
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  if (!isNaN(id) && id > 0) setSelectedTeacherId(id);
                }}
              />
              <Button
                variant="default"
                size="sm"
                onClick={() => selectedTeacherId && fetchSlots(selectedTeacherId)}
                disabled={!selectedTeacherId}
              >
                Buscar
              </Button>
            </div>
          </div>

          {/* Slot picker */}
          {selectedTeacherId && (
            <div>
              {slotsLoading ? (
                <div className="flex justify-center py-4"><LoadingSpinner /></div>
              ) : Object.keys(slotsByDate).length === 0 ? (
                <div className="text-center py-4">
                  <CalendarClock className="h-8 w-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">No hay turnos disponibles para este docente</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                    <div key={date}>
                      <p className="text-sm font-medium text-text-primary mb-2">
                        {new Date(date + "T00:00:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                      <div className="space-y-2">
                        {dateSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            className={cn(
                              "w-full p-2.5 rounded-md text-sm border transition-colors",
                              slot.is_booked
                                ? "bg-surface-muted text-text-muted border-border cursor-not-allowed"
                                : "bg-surface border-border hover:bg-primary hover:text-primary-foreground hover:border-primary cursor-pointer"
                            )}
                            disabled={slot.is_booked}
                            onClick={() => setConfirmSlot(slot)}
                          >
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      {confirmSlot && (
        <Dialog open={!!confirmSlot} onOpenChange={() => setConfirmSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar reserva</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <p className="text-sm">
                <strong>Fecha:</strong> {new Date(confirmSlot.date + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <p className="text-sm">
                <strong>Hora:</strong> {confirmSlot.start_time.slice(0, 5)} - {confirmSlot.end_time.slice(0, 5)}
              </p>
              {confirmSlot.location && <p className="text-sm"><strong>Lugar:</strong> {confirmSlot.location}</p>}
              {confirmSlot.is_virtual && <Badge variant="outline">Virtual</Badge>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmSlot(null)}>Cancelar</Button>
              <Button onClick={() => handleBookSlot(confirmSlot)}>Confirmar reserva</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
