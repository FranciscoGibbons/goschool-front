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
        <div className="w-16 h-16 bg-gray-900/10 rounded-full flex items-center justify-center mb-4 exam-gradient-bg">
          <BookOpenIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay evaluaciones
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          No se encontraron evaluaciones asignadas para este período.
        </p>
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
            className="group relative bg-white dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-6 hover:border-gray-300/50 dark:hover:border-gray-700/50 transition-all duration-200 hover:shadow-sm exam-card-hover exam-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Status indicator */}
            <div className="absolute top-6 right-6">
              <div className="flex items-center gap-2">
                <div className="exam-status-indicator animate-pulse"></div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {exam.type}
                </span>
              </div>
            </div>

            {/* Main content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {exam.task}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Evaluación de {getSubjectName(exam.subject_id)}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Entrega: {formatDate(exam.due_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
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

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          </div>
        )
      )}
    </div>
  );
}
