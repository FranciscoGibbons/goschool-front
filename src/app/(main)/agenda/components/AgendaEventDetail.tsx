"use client";

import { CalendarEvent } from "@/components/FullCalendarAgenda";
import { translateExamType, getExamTypeColor } from "@/utils/examUtils";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Badge,
} from "@/components/sacred";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  FileText,
} from "lucide-react";
import type { AgendaEventType } from "@/hooks/useAgendaEvents";

interface AgendaEventDetailProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

function AssessmentDetail({ event }: { event: CalendarEvent }) {
  const props = event.extendedProps || {};
  const examType = props.type as string;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={getExamTypeColor(examType)}>
          {translateExamType(examType)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <BookOpen className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-text-secondary">Materia</p>
            <p className="text-sm text-text-primary">
              {(props.subjectName as string) || "-"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Calendar className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-text-secondary">
              Fecha de entrega
            </p>
            <p className="text-sm text-text-primary">
              {props.dueDate
                ? new Date(props.dueDate as string).toLocaleDateString("es-AR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "-"}
            </p>
          </div>
        </div>

        {props.task && (
          <div className="flex items-start gap-2.5">
            <FileText className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Descripcion
              </p>
              <p className="text-sm text-text-primary">
                {props.task as string}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingDetail({ event }: { event: CalendarEvent }) {
  const props = event.extendedProps || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="info">Reunion</Badge>
        <Badge variant="success">{(props.status as string) || "aceptada"}</Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <FileText className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-text-secondary">Motivo</p>
            <p className="text-sm text-text-primary">
              {(props.subject as string) || "-"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <User className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-text-secondary">
              Solicitante
            </p>
            <p className="text-sm text-text-primary">
              {(props.requesterName as string) || "-"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <User className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-text-secondary">
              Receptor
            </p>
            <p className="text-sm text-text-primary">
              {(props.receiverName as string) || "-"}
            </p>
          </div>
        </div>

        {props.studentName && (
          <div className="flex items-start gap-2.5">
            <User className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Alumno
              </p>
              <p className="text-sm text-text-primary">
                {props.studentName as string}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5">
          <Calendar className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-text-secondary">Fecha</p>
            <p className="text-sm text-text-primary">
              {props.scheduledDate
                ? new Date(props.scheduledDate as string).toLocaleDateString(
                    "es-AR",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "-"}
            </p>
          </div>
        </div>

        {props.scheduledTime && (
          <div className="flex items-start gap-2.5">
            <Clock className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-text-secondary">Hora</p>
              <p className="text-sm text-text-primary">
                {props.scheduledTime as string}
              </p>
            </div>
          </div>
        )}

        {props.location && (
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-text-secondary">Lugar</p>
              <p className="text-sm text-text-primary">
                {props.location as string}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClassDetail({ event }: { event: CalendarEvent }) {
  const props = event.extendedProps || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="info">Clase</Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <BookOpen className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-text-secondary">Materia</p>
            <p className="text-sm text-text-primary">
              {(props.subjectName as string) || "-"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Calendar className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-text-secondary">Dia</p>
            <p className="text-sm text-text-primary">
              {(props.day as string) || "-"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Clock className="h-4 w-4 text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-text-secondary">Horario</p>
            <p className="text-sm text-text-primary">
              {(props.startTime as string) || "-"} -{" "}
              {(props.endTime as string) || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgendaEventDetail({
  event,
  onClose,
}: AgendaEventDetailProps) {
  const eventType = event?.extendedProps?.eventType as AgendaEventType | undefined;

  const getTitle = () => {
    if (!event) return "";
    switch (eventType) {
      case "assessment":
        return (event.extendedProps?.subjectName as string) || event.title;
      case "meeting":
        return "Reunion";
      case "class":
        return (event.extendedProps?.subjectName as string) || "Clase";
      default:
        return event.title;
    }
  };

  return (
    <Modal open={!!event} onOpenChange={() => onClose()}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle>{getTitle()}</ModalTitle>
          <ModalDescription>Detalle del evento</ModalDescription>
        </ModalHeader>

        {event && eventType === "assessment" && (
          <AssessmentDetail event={event} />
        )}
        {event && eventType === "meeting" && <MeetingDetail event={event} />}
        {event && eventType === "class" && <ClassDetail event={event} />}

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
