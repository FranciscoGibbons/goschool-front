import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, BookOpenIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Exam, translateExamType, getExamTypeColor } from "@/utils/types";
import Link from "next/link";

interface Props {
  exams: Exam[];
}

export async function DashStudentFatherServer({ exams }: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getExamTypeLabel = (type: string) => {
    return translateExamType(type);
  };

  const getExamTypeColorLocal = (type: string) => {
    return getExamTypeColor(type);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Card de Exámenes */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <BookOpenIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            Próximos Exámenes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-8">
              <BookOpenIcon className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary text-lg">
                No hay exámenes asignados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.slice(0, 3).map((exam) => (
                <Link 
                  key={exam.id}
                  href="/examenes"
                  className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        {exam.task}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-text-secondary">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(exam.due_date)}</span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getExamTypeColorLocal(
                            exam.type
                          )}`}
                        >
                          {getExamTypeLabel(exam.type)}
                        </span>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-text-secondary ml-2" />
                  </div>
                </Link>
              ))}

              {exams.length > 3 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-text-secondary">
                    Y {exams.length - 3} exámenes más...
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <Button asChild className="w-full" variant="outline">
              <Link href="/examenes">Ver todos los exámenes</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}