import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import verifyToken from "@/utils/verifyToken";
import axios from "axios";
import { Exam, Role } from "@/utils/types";
import getRole from "@/utils/getRole";
import ExamList from "./components/ExamList";
import "./examenes.css";

export default async function Exams() {
  const cookiesData = await cookies();
  const token = cookiesData.get("jwt")?.value;

  if (!token) redirect("/login");

  const isValidToken = await verifyToken(token);
  if (!isValidToken) redirect("/login");

  const role: Role = await getRole(token);

  const getExams = async (jwt: string): Promise<Exam[]> => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/assessments/", {
        headers: { Cookie: `jwt=${jwt}` },
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching exams:", error);
      return [];
    }
  };

  const getSubjects = async (
    jwt: string
  ): Promise<{ id: number; name: string }[]> => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/subjects/", {
        headers: { Cookie: `jwt=${jwt}` },
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  };

  const [exams, subjects] = await Promise.all([
    getExams(token),
    getSubjects(token),
  ]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/30 exam-vercel-font">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Evaluaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona y completa tus evaluaciones asignadas
          </p>
        </div>

        {/* Content */}
        <div className="exam-fade-in">
          <ExamList exams={exams} role={role} subjects={subjects} />
        </div>
      </div>
    </div>
  );
}
