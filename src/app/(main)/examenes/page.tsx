// app/exams/page.tsx (o donde tengas esta página)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import verifyToken from "@/utils/verifyToken";
import axios from "axios";
import { Exam } from "@/utils/types";
import AnswerSelfAssessable from "./components/AnswerSelfAssessable";

export default async function Exams() {
  const cookiesData = await cookies();
  const token = cookiesData.get("jwt")?.value;

  if (!token) redirect("/login");

  // Validar token (opcional si ya haces esto en middleware)
  const isValidToken = await verifyToken(token);
  if (!isValidToken) redirect("/login");

  // Obtener rol del usuario
  const getRole = async (jwt: string): Promise<string> => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/get_role/", {
        headers: { Cookie: `jwt=${jwt}` },
        withCredentials: true,
      });
      return res.data.role; // Asegúrate que el backend retorna { role: "student" } o "professor" etc
    } catch (error) {
      console.error("Error obteniendo rol:", error);
      return "unknown";
    }
  };

  // Obtener evaluaciones (puedes aplicar filtro si backend lo soporta)
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

  const role = await getRole(token);
  let exams = await getExams(token);

  // Filtrar para estudiantes: solo mostrar autoevaluables y exámenes asignados (si backend no lo hace)
  if (role === "student") {
    // Supongo que cada exam tiene una propiedad `assigned_to_students` o similar,
    // si no la hay, simplemente filtra sólo los autoevaluables para que respondan.

    // Si no hay info de asignación, mostrar sólo autoevaluables:
    exams = exams.filter((exam) => exam.type === "selfassessable");

    // Si tienes una propiedad que indica asignación al estudiante, filtra aquí según corresponda.
  }

  return (
    <div className="p-6 space-y-6">
      {exams.length === 0 && (
        <div className="p-6 text-gray-700">
          No se encontraron evaluaciones asignadas.
        </div>
      )}

      {exams.map((exam) => (
        <div
          key={exam.id}
          className="bg-white shadow-md rounded-xl p-6 border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-blue-900">{exam.task}</h2>
          <p className="text-gray-600">Fecha de entrega: {exam.due_date}</p>
          <p className="text-gray-600">Materia ID: {exam.subject_id}</p>
          <p className="text-gray-600 mb-4">Tipo: {exam.type}</p>

          {/* Mostrar preguntas y formulario sólo para autoevaluables */}
          {exam.type === "selfassessable" && exam.questions && (
            <>
              <div className="space-y-1 mb-4">
                <h3 className="text-md font-medium text-blue-800">
                  Preguntas:
                </h3>
                <ul className="list-disc list-inside text-gray-700">
                  {exam.questions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>

              {role === "student" && (
                <AnswerSelfAssessable
                  assessmentId={exam.id}
                  questions={exam.questions}
                />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
