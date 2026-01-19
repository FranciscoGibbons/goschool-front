import { Progress, Card } from "@/components/sacred";



interface QuizResultsProps {
  questions: string[];
  correct: string[];
  userAnswers: string[];
  score: number;
}

export function QuizResults({
  questions,
  correct,
  userAnswers,
  score,
}: QuizResultsProps) {
  const percentage = (score / questions.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Resultados del Quiz</h2>
          <span className="text-sm text-text-muted">{Math.round(percentage)}% correcto</span>
        </div>
        <div className="mt-4">

          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Puntuación total</span>
            <span className="font-semibold text-text-primary">
              {score}/{questions.length}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </Card>


      <div className="space-y-4">
        {questions.map((question, index) => {
          const isCorrect = userAnswers[index] === correct[index];
          return (
            <Card key={index} className={isCorrect ? "border-success/40" : "border-error/40"}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    Pregunta {index + 1}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">{question}</p>
                </div>
                <span
                  className={`sacred-badge ${
                    isCorrect ? "sacred-badge-success" : "sacred-badge-error"
                  }`}
                >
                  {isCorrect ? "Correcta" : "Incorrecta"}
                </span>
              </div>
              <div className="space-y-2 text-sm mt-4">
                <p className="text-text-secondary">
                  <span className="font-medium text-text-primary">Tu respuesta:</span> {userAnswers[index]}
                </p>
                {!isCorrect && (
                  <p className="text-text-secondary">
                    <span className="font-medium text-text-primary">Respuesta correcta:</span> {correct[index]}
                  </p>
                )}
              </div>
            </Card>

          );
        })}
      </div>
    </div>
  );
}
