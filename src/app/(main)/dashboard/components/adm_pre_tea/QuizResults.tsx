import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Resultados del Quiz</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Puntuación total</span>
              <span className="font-bold">
                {score}/{questions.length}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const isCorrect = userAnswers[index] === correct[index];
          return (
            <Card
              key={index}
              className={`p-6 ${
                isCorrect ? "border-green-500" : "border-red-500"
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">
                Pregunta {index + 1}: {question}
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Tu respuesta: </span>
                  {userAnswers[index]}
                </p>
                {!isCorrect && (
                  <p>
                    <span className="font-medium">Respuesta correcta: </span>
                    {correct[index]}
                  </p>
                )}
                <p
                  className={`font-medium ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCorrect ? "✓ Correcta" : "✗ Incorrecta"}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
