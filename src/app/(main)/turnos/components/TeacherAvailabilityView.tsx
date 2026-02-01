"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar, Clock } from "lucide-react";
import { useTeacherAvailability, useMeetingBookings } from "@/hooks/useTurnos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import type { TeacherAvailability, MeetingBookingWithNames } from "@/types/turnos";

export default function TeacherAvailabilityView() {
  const { availability, isLoading, createAvailability, deleteAvailability } = useTeacherAvailability();
  const { bookings, fetchBookings, addNotes, cancelBooking } = useMeetingBookings();
  const [showForm, setShowForm] = useState(false);
  const [notesBookingId, setNotesBookingId] = useState<number | null>(null);
  const [notesText, setNotesText] = useState("");

  // Form state
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("15");
  const [location, setLocation] = useState("");
  const [isVirtual, setIsVirtual] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");

  const handleSubmit = async () => {
    if (!date || !startTime || !endTime) return;
    const success = await createAvailability({
      date,
      start_time: startTime,
      end_time: endTime,
      slot_duration_minutes: parseInt(duration),
      location: location || undefined,
      is_virtual: isVirtual,
      meeting_link: isVirtual ? meetingLink : undefined,
    });
    if (success) {
      setShowForm(false);
      setDate("");
      setStartTime("");
      setEndTime("");
      setDuration("15");
      setLocation("");
      setIsVirtual(false);
      setMeetingLink("");
    }
  };

  const handleAddNotes = async (bookingId: number) => {
    if (!notesText.trim()) return;
    await addNotes(bookingId, { notes: notesText });
    setNotesBookingId(null);
    setNotesText("");
    fetchBookings();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Turnos para reuniones</h1>
            <p className="page-subtitle">Configura tu disponibilidad para reuniones con padres</p>
          </div>
          <Button variant="default" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar disponibilidad
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        {showForm && (
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-base">Nueva disponibilidad</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Fecha</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Desde</Label>
                  <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <div>
                  <Label>Hasta</Label>
                  <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Duracion por turno</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                >
                  <option value="10">10 minutos</option>
                  <option value="15">15 minutos</option>
                  <option value="20">20 minutos</option>
                  <option value="30">30 minutos</option>
                </select>
              </div>
              <div>
                <Label>Ubicacion</Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: Sala de profesores" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isVirtual} onCheckedChange={setIsVirtual} />
                <Label>Reunion virtual</Label>
              </div>
              {isVirtual && (
                <div>
                  <Label>Link de reunion</Label>
                  <Input value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." />
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="default" onClick={handleSubmit} disabled={isLoading || !date || !startTime || !endTime}>Guardar</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Availability list + Schedule */}
        <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="space-y-6">
            {/* Availability blocks */}
            <Card>
              <CardHeader><CardTitle className="text-base">Mi disponibilidad</CardTitle></CardHeader>
              <CardContent>
                {isLoading && availability.length === 0 ? (
                  <div className="flex justify-center py-4"><LoadingSpinner /></div>
                ) : availability.length === 0 ? (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-text-muted mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No hay disponibilidad configurada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availability.map((a: TeacherAvailability) => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-md bg-surface-muted">
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {new Date(a.date + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
                          </p>
                          <p className="text-sm text-text-muted">
                            {a.start_time.slice(0, 5)} - {a.end_time.slice(0, 5)} · {a.slot_duration_minutes} min/turno
                            {a.location && ` · ${a.location}`}
                            {a.is_virtual && " · Virtual"}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteAvailability(a.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My schedule */}
            <Card>
              <CardHeader><CardTitle className="text-base">Proximas reuniones</CardTitle></CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-text-muted mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No hay reuniones programadas</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookings.filter((b: MeetingBookingWithNames) => b.status === "booked").map((b: MeetingBookingWithNames) => (
                      <div key={b.id} className="p-3 rounded-md bg-surface-muted">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {b.parent_name} - {b.student_name}
                            </p>
                            <p className="text-sm text-text-muted">
                              {new Date(b.date + "T00:00:00").toLocaleDateString("es-AR")} · {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}
                              {b.location && ` · ${b.location}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setNotesBookingId(b.id)}>Notas</Button>
                            <Button variant="ghost" size="sm" onClick={() => cancelBooking(b.id)}>Cancelar</Button>
                          </div>
                        </div>
                        {notesBookingId === b.id && (
                          <div className="mt-3 space-y-2">
                            <Textarea value={notesText} onChange={e => setNotesText(e.target.value)} placeholder="Notas post-reunion..." rows={2} />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAddNotes(b.id)}>Guardar notas</Button>
                              <Button variant="ghost" size="sm" onClick={() => { setNotesBookingId(null); setNotesText(""); }}>Cancelar</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
