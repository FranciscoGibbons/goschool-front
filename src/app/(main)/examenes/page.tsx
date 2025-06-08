import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import verifyToken from "@/utils/verifyToken";
import axios from "axios";
import { Exam, Role } from "@/utils/types";
import getRole from "@/utils/getRole";
import ExamList from "./components/ExamList";

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

  const exams = await getExams(token);

  return (
    <div className="p-6 space-y-6">
      <ExamList exams={exams} role={role} />
    </div>
  );
}
