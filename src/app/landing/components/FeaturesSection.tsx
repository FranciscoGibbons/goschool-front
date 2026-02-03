"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  GraduationCap,
  ClipboardCheck,
  MessageCircle,
  Calendar,
  FileText,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  fadeUp,
  viewportConfig,
  instantVariants,
} from "../lib/animations";

const features = [
  {
    icon: GraduationCap,
    title: "Calificaciones",
    description:
      "Registro y consulta de notas por materia y trimestre. Boletines digitales accesibles para familias.",
  },
  {
    icon: ClipboardCheck,
    title: "Asistencia",
    description:
      "Control diario con notificaciones automaticas a padres. Reportes de inasistencias y tardanzas.",
  },
  {
    icon: MessageCircle,
    title: "Comunicaciones",
    description:
      "Mensajeria en tiempo real entre docentes, alumnos y familias. Cuaderno de comunicaciones digital.",
  },
  {
    icon: Calendar,
    title: "Horarios y Agenda",
    description:
      "Organizacion de materias, turnos y divisiones. Calendario de eventos y examenes integrado.",
  },
  {
    icon: FileText,
    title: "Examenes",
    description:
      "Creacion y gestion de examenes con fechas. Autoevaluaciones con correccion automatica.",
  },
  {
    icon: Shield,
    title: "Seguridad",
    description:
      "Autenticacion JWT con firma ES256. Base de datos exclusiva por colegio. HTTPS obligatorio.",
  },
];

export default function FeaturesSection() {
  const prefersReducedMotion = useReducedMotion();

  const itemVariants = prefersReducedMotion ? instantVariants : fadeUp;
  const cardVariants = prefersReducedMotion
    ? instantVariants
    : {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
        },
      };

  return (
    <section
      id="funcionalidades"
      aria-labelledby="features-heading"
      className="py-20 lg:py-28 bg-surface"
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
            Funcionalidades
          </p>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          >
            Todo lo que necesitas para gestionar tu colegio
          </h2>
          <p className="text-muted-foreground text-lg">
            Una plataforma completa que simplifica la administracion academica y
            conecta a toda la comunidad educativa.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 },
            },
          }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card className="h-full hover:-translate-y-1 transition-transform duration-200">
                <CardContent className="p-6 space-y-4">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
