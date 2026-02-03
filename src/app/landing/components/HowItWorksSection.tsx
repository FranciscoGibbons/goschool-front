"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  fadeUp,
  staggerContainerSlow,
  viewportConfig,
  instantVariants,
  instantContainer,
} from "../lib/animations";

const steps = [
  {
    number: 1,
    title: "Configuracion inicial",
    description:
      "Creamos tu instancia dedicada con base de datos exclusiva. Configuramos turnos, niveles y divisiones segun tu colegio.",
  },
  {
    number: 2,
    title: "Carga de usuarios",
    description:
      "Importamos docentes, alumnos y familias. Cada usuario recibe sus credenciales y accede con el rol que le corresponde.",
  },
  {
    number: 3,
    title: "Listo para usar",
    description:
      "Tu colegio comienza a operar de inmediato. Calificaciones, asistencia y comunicaciones desde el primer dia.",
  },
];

export default function HowItWorksSection() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = prefersReducedMotion
    ? instantContainer
    : staggerContainerSlow;
  const itemVariants = prefersReducedMotion ? instantVariants : fadeUp;

  return (
    <section
      id="como-funciona"
      aria-labelledby="how-it-works-heading"
      className="py-20 lg:py-28 bg-background"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={itemVariants}
        >
          <p className="text-sm font-medium text-primary tracking-wide uppercase mb-3">
            Como funciona
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          >
            Implementacion simple, resultados inmediatos
          </h2>
          <p className="text-muted-foreground text-lg">
            En tres pasos tu colegio esta operativo con todas las
            funcionalidades.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="grid lg:grid-cols-3 gap-12 relative"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={containerVariants}
        >
          {/* Connector line - desktop only */}
          <div
            className="hidden lg:block absolute top-12 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px border-t-2 border-dashed border-primary/20"
            aria-hidden="true"
          />

          {steps.map((step) => (
            <motion.div
              key={step.number}
              className="relative text-center space-y-6"
              variants={itemVariants}
            >
              {/* Step number */}
              <div className="mx-auto size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold relative z-10">
                {step.number}
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>

              {/* Placeholder screenshot */}
              <div className="rounded-xl bg-surface border aspect-[16/10] flex items-center justify-center">
                <div className="text-xs text-muted-foreground font-medium">
                  Paso {step.number}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
