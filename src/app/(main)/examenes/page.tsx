import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import verifyToken from "@/utils/verifyToken";
import axios from "axios";
import { Exam, Role } from "@/utils/types";
import getRole from "@/utils/getRole";
import ExamList from "./components/ExamList";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

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
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <AcademicCapIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Evaluaciones</h1>
      </div>

      <ExamList exams={exams} role={role} subjects={subjects} />
    </div>
  );
}
