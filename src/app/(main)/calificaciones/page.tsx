import { AcademicCapIcon } from "@heroicons/react/24/outline";
import GradesDisplay from "./components/GradesDisplay";

export default function Calificaciones() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <AcademicCapIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calificaciones</h1>
      </div>

      <GradesDisplay />
    </div>
  );
}
