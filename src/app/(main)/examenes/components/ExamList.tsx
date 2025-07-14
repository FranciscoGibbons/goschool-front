"use client";

import { useState } from "react";
import { Exam, Role, SelfAssessableExam } from "@/utils/types";
import AnswerSelfAssessable from "./AnswerSelfAssessable";
import { Button } from "@/components/ui/button";
import SelfAssessableCard from "./SelfAssessableCard";
import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import EmptyStateSVG from "@/components/ui/EmptyStateSVG";

interface Props {
  exams: Exam[];
  role: Role;
  subjects: { id: number; name: string }[];
}

export default function ExamList({ exams, role, subjects }: Props) {
  const [activeExamId, setActiveExamId] = useState<number | null>(null);

  const getSubjectName = (id: number) => {
    const subject = subjects.find((s) => s.id === id);
    return subject ? subject.name : `ID: ${id}`;
  };

  const isSelfAssessableExam = (exam: Exam): exam is SelfAssessableExam => {
    return (
      exam.type === "selfassessable" &&
      "questions" in exam &&
      Array.isArray(exam.questions)
    );
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <EmptyStateSVG className="w-96 h-72 mb-4 opacity-80" />
        <span className="text-muted-foreground text-lg opacity-60">
          No hay evaluaciones asignadas
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {exams.map((exam, index) =>
        exam.type === "selfassessable" ? (
          <div
            key={exam.id}
            className="exam-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <SelfAssessableCard
              exam={exam}
              subjectName={getSubjectName(exam.subject_id)}
              role={role}
            />
          </div>
        ) : (
          <div
            key={exam.id}
            className="relative rounded-xl border border-border bg-card shadow-sm px-6 py-4 exam-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Status indicator */}
            <div className="absolute top-6 right-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {exam.type}
                </span>
              </div>
            </div>

            {/* Main content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {exam.task}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Evaluación de {getSubjectName(exam.subject_id)}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Entrega: {formatDate(exam.due_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpenIcon className="w-4 h-4" />
                  <span>{getSubjectName(exam.subject_id)}</span>
                </div>
              </div>

              {/* Special notice for oral exams */}
              {role !== "student" && exam.type === "oral" && (
                <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white font-medium">!</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Evaluación oral
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Requiere corrección manual por parte del docente
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
