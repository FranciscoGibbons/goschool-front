"use client";

import { motion, useReducedMotion } from "motion/react";
import { Mail, Zap, HeadphonesIcon, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fadeUp,
  scaleUp,
  viewportConfig,
  instantVariants,
} from "../lib/animations";

const badges = [
  { icon: Zap, label: "Sin costo de setup" },
  { icon: HeadphonesIcon, label: "Soporte incluido" },
  { icon: Database, label: "Base de datos exclusiva" },
];

export default function CTASection() {
  const prefersReducedMotion = useReducedMotion();

  const textVariants = prefersReducedMotion ? instantVariants : fadeUp;
  const buttonVariants = prefersReducedMotion ? instantVariants : scaleUp;

  return (
    <section
      id="contacto"
      aria-labelledby="cta-heading"
      className="py-20 lg:py-28 relative overflow-hidden"
    >
      {/* Radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(158 45% 32% / 0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-3xl mx-auto px-6 text-center relative">
        <motion.div
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <motion.h2
            id="cta-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            variants={textVariants}
          >
            Transforma la gestion de tu colegio hoy
          </motion.h2>

          <motion.p
            className="text-lg text-muted-foreground max-w-xl mx-auto"
            variants={textVariants}
          >
            Unite a los colegios que ya simplifican su administracion academica
            con Klass.
          </motion.p>

          <motion.div className="pt-4 space-y-4" variants={buttonVariants}>
            <Button size="lg" asChild>
              <a href="mailto:contacto@goschool.ar">
                <Mail className="size-5 mr-2" />
                Solicitar demo gratuita
              </a>
            </Button>
            <p className="text-sm text-muted-foreground">
              contacto@goschool.ar
            </p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 pt-6"
            variants={textVariants}
          >
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <badge.icon className="size-4 text-primary" />
                <span>{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
