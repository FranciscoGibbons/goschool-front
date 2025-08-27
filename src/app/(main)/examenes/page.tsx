"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/utils/types";
import ExamList from "./components/ExamList";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import userInfoStore from "@/store/userInfoStore";
import axios from "axios";

import { Exam as BaseExam } from "@/utils/types";

interface Exam extends Omit<BaseExam, 'questions' | 'correct' | 'incorrect1' | 'incorrect2' | 'created_at'> {
  // Add any additional fields specific to this component
  subject_id: number;
}

interface Subject {
  id: number;
  name: string;
}

export default function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { userInfo, fetchUserInfo } = userInfoStore();
  const router = useRouter();

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Fetch user info if not already loaded
        if (!userInfo) {
          await fetchUserInfo();
        }

        // If still no user info after fetch, redirect to login
        if (!userInfo) {
          router.push("/login");
          return;
        }

        // Fetch exams and subjects
        const [examsResponse, subjectsResponse] = await Promise.all([
          axios.get("/api/proxy/assessments/", { withCredentials: true }),
          axios.get("/api/proxy/subjects/", { withCredentials: true }),
        ]);

        setExams(examsResponse.data);
        setSubjects(subjectsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error initializing exams page:", err);
        setError("Error al cargar los datos");
        setLoading(false);
      }
    };

    initializePage();
  }, [userInfo, fetchUserInfo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Evaluaciones</h1>
        </div>
        <div className="flex justify-center py-16">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>Cargando evaluaciones...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Evaluaciones</h1>
        </div>
        <div className="flex justify-center py-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no user info, don't render anything (will redirect)
  if (!userInfo) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <AcademicCapIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Evaluaciones</h1>
      </div>

      <ExamList 
        exams={exams} 
        role={userInfo.role as Role} 
        subjects={subjects} 
      />
    </div>
  );
}
