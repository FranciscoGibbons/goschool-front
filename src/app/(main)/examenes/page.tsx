"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

import { useCourseStudentSelection } from "@/hooks/useCourseStudentSelection";
import { ProtectedPage } from "@/components/ProtectedPage";
import CourseSelector from "@/components/CourseSelector";
import ExamList from "./components/ExamList";
import userInfoStore from "@/store/userInfoStore";
import { Role, Exam } from "@/utils/types";
import axios from "axios";
import {
  ErrorBoundary,
  ErrorDisplay,
  LoadingSpinner,
  Button,
  PageHeader,
} from "@/components/sacred";

import { toast } from "sonner";

type ExamWithSubjectId = Exam & { subject_id: number };

interface Subject {
  id: number;
  name: string;
  course_id: number;
  course_name?: string;
}

function ExamsContent() {
  const { userInfo } = userInfoStore();
  const {
    courses,
    selectedCourseId,
    isLoading: coursesLoading,
    error: coursesError,
    setSelectedCourseId,
  } = useCourseStudentSelection(userInfo?.role || null);

  const [currentStep, setCurrentStep] = useState<"course" | "exams">("course");
  const [exams, setExams] = useState<ExamWithSubjectId[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (userInfo?.role === "student" || userInfo?.role === "father") {
      setCurrentStep("exams");
    }
  }, [userInfo?.role]);

  const handleCourseSelect = async (courseId: number) => {
    setSelectedCourseId(courseId);
    setCurrentStep("exams");
  };

  const handleBack = () => {
    setCurrentStep("course");
  };

  useEffect(() => {
    const loadData = async () => {
      if (currentStep === "exams") {
        setDataLoading(true);
        try {
          const [examsRes, subjectsRes] = await Promise.all([
            axios.get("/api/proxy/assessments/", { withCredentials: true }),
            axios.get("/api/proxy/subjects/", { withCredentials: true }),
          ]);

          // Handle paginated response for exams
          let examsData: ExamWithSubjectId[];
          if (examsRes.data && typeof examsRes.data === 'object' && 'data' in examsRes.data) {
            examsData = examsRes.data.data;
          } else if (Array.isArray(examsRes.data)) {
            examsData = examsRes.data;
          } else {
            examsData = [];
          }

          // Handle paginated response for subjects
          let subjectsData: Subject[];
          if (subjectsRes.data && typeof subjectsRes.data === 'object' && 'data' in subjectsRes.data) {
            subjectsData = subjectsRes.data.data;
          } else if (Array.isArray(subjectsRes.data)) {
            subjectsData = subjectsRes.data;
          } else {
            subjectsData = [];
          }

          setExams(examsData);
          setSubjects(subjectsData);
        } catch (err) {
          console.error("Error loading data:", err);
          toast.error("Error al cargar evaluaciones");
        } finally {
          setDataLoading(false);
        }
      }
    };
    loadData();
  }, [currentStep]);

  const filteredSubjects = selectedCourseId
    ? subjects.filter((s) => Number(s.course_id) === Number(selectedCourseId))
    : subjects;

  const subjectIdSet = new Set(filteredSubjects.map((s) => s.id));
  const filteredExams = selectedCourseId
    ? exams.filter((e) => subjectIdSet.has(e.subject_id))
    : exams;

  if (coursesLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Evaluaciones" />
        <ErrorDisplay error={coursesError} retry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <PageHeader
        title="Evaluaciones"
        subtitle={
          currentStep === "course"
            ? "Selecciona un curso"
            : "Examenes y tareas programadas"
        }
        action={
          currentStep === "exams" &&
          userInfo?.role !== "student" &&
          userInfo?.role !== "father" ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : null
        }
      />


      {currentStep === "course" && (
        <CourseSelector
          courses={courses}
          onCourseSelect={handleCourseSelect}
          selectedCourseId={selectedCourseId}
        />
      )}

      {currentStep === "exams" && (
        <ExamList
          exams={filteredExams}
          role={userInfo?.role as Role}
          subjects={filteredSubjects}
        />
      )}
    </div>
  );
}

export default function Exams() {
  return (
    <ProtectedPage>
      <ErrorBoundary>
        <ExamsContent />
      </ErrorBoundary>
    </ProtectedPage>
  );
}
