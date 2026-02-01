"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNotasIndividuales } from "@/hooks/useCuaderno";
import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InlineSelectionBar from "@/components/InlineSelectionBar";
import userInfoStore from "@/store/userInfoStore";

interface Props {
  onClose: () => void;
}

export default function NotaForm({ onClose }: Props) {
  const { createNota, isLoading } = useNotasIndividuales();
  const { userInfo } = userInfoStore();
  const {
    courses,
    students,
    selectedCourseId,
    selectedStudentId,
    setSelectedCourseId,
    setSelectedStudentId,
  } = useCourseStudentSelection(userInfo?.role || null);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async () => {
    if (!subject.trim() || !body.trim() || !selectedStudentId) return;
    const success = await createNota({ student_id: selectedStudentId, subject, body });
    if (success) onClose();
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <Button variant="ghost" size="sm" onClick={onClose} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="page-title">Nueva nota individual</h1>
      </div>

      <InlineSelectionBar
        courses={courses}
        selectedCourseId={selectedCourseId}
        onCourseChange={setSelectedCourseId}
        students={students}
        selectedStudentId={selectedStudentId}
        onStudentChange={setSelectedStudentId}
        showStudentSelector={true}
      />

      {selectedStudentId && (
        <Card>
          <CardHeader><CardTitle className="text-base">Datos de la nota</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Asunto</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Asunto de la nota" />
            </div>
            <div>
              <Label>Mensaje</Label>
              <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Escriba su mensaje..." rows={5} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="default" onClick={handleSubmit} disabled={isLoading || !subject.trim() || !body.trim()}>
                Enviar nota
              </Button>
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
