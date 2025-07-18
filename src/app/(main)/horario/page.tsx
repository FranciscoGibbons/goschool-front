import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios from "axios";
import TimetableClient from "./components/TimetableClient";

interface Course {
  id: number;
  year: number;
  division: string;
  level: string;
  shift: string;
  preceptor_id?: number;
}

interface Timetable {
  id: number;
  course_id: number;
  subject_id: number;
  day: string;
  start_time: string;
  end_time: string;
}

async function getCourses(): Promise<Course[]> {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");

  if (!jwtCookie) {
    redirect("/login");
  }

  try {
    const response = await axios.get("http://localhost:8080/api/v1/courses/", {
      headers: {
        Cookie: `jwt=${jwtCookie.value}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    redirect("/login");
  }
}

async function getTimetables(courseId: number): Promise<Timetable[]> {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");

  if (!jwtCookie) {
    redirect("/login");
  }

  try {
    const response = await axios.get(
      `http://localhost:8080/api/v1/timetables/?course_id=${courseId}`,
      {
        headers: {
          Cookie: `jwt=${jwtCookie.value}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching timetables:", error);
    return [];
  }
}

export default async function TimetablePage() {
  const courses = await getCourses();

  if (courses.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No hay cursos disponibles</p>
      </div>
    );
  }

  // Si solo hay un curso, obtener sus timetables directamente
  if (courses.length === 1) {
    const timetables = await getTimetables(courses[0].id);
    return (
      <div className="container mx-auto px-4 py-8">
        <TimetableClient
          courses={courses}
          initialCourseId={courses[0].id}
          initialTimetables={timetables}
        />
      </div>
    );
  }

  // Si hay múltiples cursos, mostrar selector
  return (
    <div className="container mx-auto px-4 py-8">
      <TimetableClient
        courses={courses}
        initialCourseId={null}
        initialTimetables={[]}
      />
    </div>
  );
}
