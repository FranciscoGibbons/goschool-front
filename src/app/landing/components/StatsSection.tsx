"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useCountUp } from "../lib/useCountUp";
import {
  fadeUp,
  staggerContainer,
  viewportConfig,
  instantVariants,
  instantContainer,
} from "../lib/animations";

interface StatItemProps {
  end: number;
  suffix: string;
  label: string;
  inView: boolean;
  prefersReducedMotion: boolean | null;
}

function StatItem({ end, suffix, label, inView, prefersReducedMotion }: StatItemProps) {
  const value = useCountUp(end, prefersReducedMotion ? true : inView);

  return (
    <motion.div
      className="text-center"
      variants={prefersReducedMotion ? instantVariants : fadeUp}
    >
      <p className="text-4xl sm:text-5xl font-bold text-white mb-2">
        {value}
        {suffix}
      </p>
      <p className="text-white/70 text-sm sm:text-base">{label}</p>
    </motion.div>
  );
}

const stats = [
  { end: 500, suffix: "+", label: "Alumnos gestionados" },
  { end: 100, suffix: "%", label: "Disponibilidad" },
  { end: 5, suffix: "", label: "Roles diferenciados" },
  { end: 24, suffix: "/7", label: "Acceso total" },
];

export default function StatsSection() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const containerVariants = prefersReducedMotion
    ? instantContainer
    : staggerContainer;

  return (
    <section
      aria-label="Estadisticas"
      className="py-16 lg:py-20"
      style={{ backgroundColor: "hsl(155 35% 15%)" }}
    >
      <motion.div
        ref={ref}
        className="max-w-6xl mx-auto px-6"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={containerVariants}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatItem
              key={stat.label}
              end={stat.end}
              suffix={stat.suffix}
              label={stat.label}
              inView={inView}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
