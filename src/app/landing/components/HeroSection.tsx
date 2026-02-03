"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  fadeUp,
  scaleUp,
  staggerContainer,
  instantVariants,
  instantContainer,
} from "../lib/animations";

export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const containerVariants = prefersReducedMotion ? instantContainer : staggerContainer;
  const itemVariants = prefersReducedMotion ? instantVariants : fadeUp;
  const imageVariants = prefersReducedMotion ? instantVariants : scaleUp;

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)] py-16 lg:py-0 flex items-center"
    >
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center rounded-full border bg-surface px-4 py-1.5 text-xs font-medium text-primary">
                Plataforma educativa integral
              </span>
            </motion.div>

            <motion.div className="space-y-4" variants={itemVariants}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                La gestion escolar
                <br />
                <span className="text-primary">que tu colegio merece</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Calificaciones, asistencia, comunicaciones y mas en una sola
                plataforma. Accesible para docentes, alumnos y familias.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              variants={itemVariants}
            >
              <Button size="lg" asChild>
                <a
                  href="#contacto"
                  onClick={(e) => handleSmoothScroll(e, "#contacto")}
                >
                  Solicitar una demo
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="#funcionalidades"
                  onClick={(e) => handleSmoothScroll(e, "#funcionalidades")}
                >
                  Ver funcionalidades
                </a>
              </Button>
            </motion.div>

            <motion.p
              className="text-sm text-muted-foreground"
              variants={itemVariants}
            >
              Utilizado por{" "}
              <span className="font-medium text-foreground">
                Colegio Stella Maris Rosario
              </span>
            </motion.p>
          </motion.div>

          {/* Right column - Dashboard placeholder */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={imageVariants}
            style={prefersReducedMotion ? undefined : { y: parallaxY }}
            className="relative"
          >
            <div className="rounded-2xl bg-surface border aspect-[4/3] flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-3 p-8">
                <div className="mx-auto size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <svg
                    className="size-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Vista del dashboard
                </p>
              </div>
            </div>

            {/* Floating decorative elements */}
            {!prefersReducedMotion && (
              <>
                <motion.div
                  className="absolute -top-4 -right-4 size-20 rounded-xl bg-primary/5 border border-primary/10"
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 size-14 rounded-lg bg-primary/5 border border-primary/10"
                  animate={{ y: [0, 8, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
