"use client";

import { motion, useReducedMotion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  scaleUp,
  viewportConfig,
  instantVariants,
} from "../lib/animations";

const testimonials = [
  {
    quote:
      "Klass nos permitio digitalizar toda la gestion academica. Los padres ahora consultan las notas y la asistencia de sus hijos desde el celular.",
    name: "Maria Laura Rodriguez",
    role: "Directora",
    initials: "MR",
  },
  {
    quote:
      "Cargar las calificaciones y tomar asistencia es mucho mas rapido. El cuaderno de comunicaciones digital nos ahorra horas de trabajo.",
    name: "Carlos Alberto Gomez",
    role: "Docente",
    initials: "CG",
  },
  {
    quote:
      "Como madre, puedo ver las notas de mis hijos al instante y comunicarme con los docentes sin tener que ir al colegio. Es muy practico.",
    name: "Ana Paula Fernandez",
    role: "Madre",
    initials: "AF",
  },
];

export default function TestimonialsSection() {
  const prefersReducedMotion = useReducedMotion();

  const cardVariants = prefersReducedMotion ? instantVariants : scaleUp;

  return (
    <section
      id="testimonios"
      aria-labelledby="testimonials-heading"
      className="py-20 lg:py-28 bg-surface"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={prefersReducedMotion ? instantVariants : scaleUp}
        >
          <p className="text-sm font-medium text-primary tracking-wide uppercase mb-3">
            Testimonios
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          >
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-muted-foreground text-lg">
            La experiencia de quienes usan Klass todos los dias.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: prefersReducedMotion ? 0 : 0.1 },
            },
          }}
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={cardVariants}>
              <Card className="h-full">
                <CardContent className="p-6 space-y-4">
                  {/* Quote mark */}
                  <span
                    className="text-5xl font-serif text-primary/20 leading-none select-none"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>

                  <blockquote className="text-sm text-muted-foreground italic leading-relaxed -mt-4">
                    {t.quote}
                  </blockquote>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {t.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <cite className="not-italic text-sm font-medium block">
                        {t.name}
                      </cite>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
