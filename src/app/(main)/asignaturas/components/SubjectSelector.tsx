"use client";

import { useState, useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import SubjectMessages from "./SubjectMessages";
import axios from "axios";

interface Subject {
  id: number;
  name: string;
}

export default function SubjectSelector() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Cargar materias
    const fetchSubjects = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/v1/subjects/", {
          withCredentials: true,
        });
        const subjectsData = res.data;
        setSubjects(subjectsData);

        // Seleccionar automáticamente la primera materia
        if (subjectsData.length > 0) {
          setSelectedSubject(subjectsData[0]);
        }

        setErrorMsg("");
      } catch (error) {
        setSubjects([]);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setErrorMsg("No autorizado. Inicia sesión nuevamente.");
          } else {
            setErrorMsg("Error al cargar materias.");
          }
        } else {
          setErrorMsg("Error desconocido.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Cargando asignaturas...</div>;
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="text-red-500 text-center py-4">{errorMsg}</div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Seleccionar Materia
          </label>
          <Select
            value={selectedSubject?.id.toString() || ""}
            onValueChange={(value) => {
              const subject = subjects.find((s) => s.id.toString() === value);
              setSelectedSubject(subject || null);
            }}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Selecciona una materia" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="size-4" />
                    {subject.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSubject &&
          (() => {
            console.log("Selected subject:", selectedSubject);
            return (
              <SubjectMessages
                subjectId={selectedSubject.id}
                subjectName={selectedSubject.name}
              />
            );
          })()}
      </div>

      {subjects.length === 0 && !errorMsg && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-lg">
            No hay asignaturas disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
