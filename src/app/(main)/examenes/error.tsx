"use client";

import { ErrorDisplay, PageHeader } from "@/components/sacred";



export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Evaluaciones" subtitle="Se produjo un error" />
      <ErrorDisplay
        error={error.message || "Error al cargar las evaluaciones"}
        retry={reset}
      />
    </div>
  );

}