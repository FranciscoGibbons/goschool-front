import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  RotateCcw,
  Send,
  Award,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelfAssessable } from "@/hooks/useSelfAssessable";
import userInfoStore from "@/store/userInfoStore";
import { toast } from "sonner";
import type { 
  SelfAssessableSubmission
} from "@/types/selfassessable";

interface EnhancedAnswerSelfAssessableProps {
  assessmentId: number;
  assessmentName: string;
  subjectName: string;
  dueDate?: string;
}

export default function EnhancedAnswerSelfAssessable({
  assessmentId,
  assessmentName,
  subjectName,
  dueDate,
}: EnhancedAnswerSelfAssessableProps) {
  const router = useRouter();
  const { userInfo } = userInfoStore();
  
  const {
    questions,
    isLoading,
    isSubmitting,
    error,
    isAnswered,
    stats,
    loadSelfAssessableData,
    submitAnswers,
    reset,
  } = useSelfAssessable({ assessmentId, autoLoad: true });

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'quiz' | 'review' | 'results'>('quiz');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Reset cuando cambia el assessment
  useEffect(() => {
    reset();
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setViewMode('quiz');
  }, [assessmentId, reset]);

  // Determinar el modo de vista inicial
  useEffect(() => {
    if (isAnswered) {
      setViewMode('results');
    } else {
      setViewMode('quiz');
    }
  }, [isAnswered]);

  // Manejar selección de respuesta
  const handleAnswerSelect = (questionId: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Calcular progreso
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Verificar si todas las preguntas están respondidas
  const allAnswered = questions.every(q => selectedAnswers[q.id]);

  // Navegar entre preguntas
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Enviar respuestas
  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error("Debes responder todas las preguntas antes de enviar");
      return;
    }

    try {
      const answers = questions.map(q => selectedAnswers[q.id] || "");
      const submission: SelfAssessableSubmission = {
        assessment_id: assessmentId,
        answers,
      };

      await submitAnswers(submission);
      setViewMode('results');
    } catch (error) {
      console.error("Error submitting answers:", error);
    }
  };

  // Reiniciar autoevaluable
  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setViewMode('quiz');
    setShowConfirmSubmit(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-surface-muted rounded-lg w-1/3"></div>
            <div className="h-4 bg-surface-muted rounded w-1/2"></div>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="h-6 bg-surface-muted rounded w-3/4"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-4 bg-surface-muted rounded w-full"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="bg-error-muted border border-border rounded-lg p-4 text-error">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-muted flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-text-muted" />
            </div>
            <p className="text-text-secondary">No se pudieron cargar las preguntas</p>
            <Button 
              className="mt-4" 
              onClick={() => loadSelfAssessableData(assessmentId)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-muted flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-text-muted" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sin preguntas disponibles</h3>
            <p className="text-text-secondary mb-6">
              Este autoevaluable no tiene preguntas configuradas
            </p>
            <Button onClick={() => router.back()}>
              Volver a exámenes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          {isAnswered && (
            <Badge variant="success">
              Completado
            </Badge>
          )}
        </div>

        {/* Title and Info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {assessmentName}
          </h1>
          <div className="flex items-center gap-4 text-text-secondary">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{subjectName}</span>
            </div>
            {dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Vence: {dueDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {viewMode === 'quiz' && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-text-secondary mb-2">
              <span>Progreso</span>
              <span>{answeredQuestions} de {totalQuestions} respondidas</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Results View */}
        {viewMode === 'results' && isAnswered && (
          <Card className="mb-8 border-border bg-success-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <Award className="h-5 w-5" />
                Autoevaluación Completada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {totalQuestions}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Preguntas respondidas
                  </div>
                </div>
                {stats?.best_score && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {stats.best_score.toFixed(1)}%
                    </div>
                    <div className="text-sm text-text-secondary">
                      Puntuación obtenida
                    </div>
                  </div>
                )}
                {stats?.total_attempts && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {stats.total_attempts}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {stats.total_attempts === 1 ? "Intento" : "Intentos"}
                    </div>
                  </div>
                )}
              </div>
              
              {userInfo?.role === "student" && (
                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    onClick={handleRestart}
                    disabled={isSubmitting}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Hacer nuevamente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quiz View */}
        {viewMode === 'quiz' && !isAnswered && (
          <>
            {/* Question Card */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                  </CardTitle>
                  <Badge variant="outline">
                    {selectedAnswers[currentQuestion.id] ? "Respondida" : "Pendiente"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <h3 className="text-xl font-medium leading-relaxed">
                  {currentQuestion.question}
                </h3>
                
                <RadioGroup
                  value={selectedAnswers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                >
                  <div className="space-y-3">
                    {currentQuestion.op1 && (
                      <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent transition-colors">
                        <RadioGroupItem value={currentQuestion.op1} id={`${currentQuestion.id}-op1`} />
                        <Label htmlFor={`${currentQuestion.id}-op1`} className="flex-1 cursor-pointer">
                          {currentQuestion.op1}
                        </Label>
                      </div>
                    )}
                    {currentQuestion.op2 && (
                      <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent transition-colors">
                        <RadioGroupItem value={currentQuestion.op2} id={`${currentQuestion.id}-op2`} />
                        <Label htmlFor={`${currentQuestion.id}-op2`} className="flex-1 cursor-pointer">
                          {currentQuestion.op2}
                        </Label>
                      </div>
                    )}
                    {currentQuestion.op3 && (
                      <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent transition-colors">
                        <RadioGroupItem value={currentQuestion.op3} id={`${currentQuestion.id}-op3`} />
                        <Label htmlFor={`${currentQuestion.id}-op3`} className="flex-1 cursor-pointer">
                          {currentQuestion.op3}
                        </Label>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
              >
                Anterior
              </Button>

              <div className="flex gap-2">
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={index === currentQuestionIndex ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "w-10 h-10",
                      selectedAnswers[questions[index].id] && index !== currentQuestionIndex &&
                      "bg-success-muted border-border text-success hover:bg-success-muted/80"
                    )}
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>

              {currentQuestionIndex === totalQuestions - 1 ? (
                <Button
                  onClick={() => setShowConfirmSubmit(true)}
                  disabled={!allAnswered || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                >
                  Siguiente
                </Button>
              )}
            </div>

            {/* Confirm Submit Dialog */}
            {showConfirmSubmit && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle>Confirmar envío</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text-secondary mb-4">
                      ¿Estás seguro que quieres enviar tus respuestas? Una vez enviadas no podrás modificarlas.
                    </p>
                    <div className="text-sm space-y-1">
                      <div>Total de preguntas: <strong>{totalQuestions}</strong></div>
                      <div>Respondidas: <strong>{answeredQuestions}</strong></div>
                    </div>
                  </CardContent>
                  <div className="flex gap-2 p-6 pt-0">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmSubmit(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        setShowConfirmSubmit(false);
                        handleSubmit();
                      }}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Confirmar envío
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}