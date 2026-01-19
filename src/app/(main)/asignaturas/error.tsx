"use client";

import { ErrorDisplay } from "@/components/ui/error-boundary";
import { BookOpenIcon } from "@heroicons/react/24/outline";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpenIcon className="size-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">

          Asignaturas
        </h1>
      </div>
      <ErrorDisplay 
        error={error.message || "Error al cargar las asignaturas"}
        retry={reset}
      />
    </div>
  );
}