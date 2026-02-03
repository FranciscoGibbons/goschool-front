"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { branding } from "@/config/branding";
import { Separator } from "@/components/ui/separator";
import {
  fadeUp,
  staggerContainer,
  viewportConfig,
  instantVariants,
  instantContainer,
} from "../lib/animations";

const columns = [
  {
    title: "Producto",
    links: ["Funcionalidades", "Seguridad", "Integraciones", "Novedades"],
  },
  {
    title: "Recursos",
    links: ["Documentacion", "Soporte", "FAQ", "Estado del servicio"],
  },
  {
    title: "Legal",
    links: ["Privacidad", "Terminos de uso", "Contacto"],
  },
];

export default function LandingFooter() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = prefersReducedMotion
    ? instantContainer
    : staggerContainer;
  const itemVariants = prefersReducedMotion ? instantVariants : fadeUp;

  return (
    <footer
      className="pt-16 pb-8"
      style={{ backgroundColor: "hsl(155 35% 15%)" }}
    >
      <motion.div
        className="max-w-6xl mx-auto px-6"
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        variants={containerVariants}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="flex items-center gap-3">
              <Image
                src={branding.logoPath}
                alt={branding.appName}
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold text-lg text-white">
                {branding.appName}
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Plataforma integral de gestion academica para colegios argentinos.
            </p>
          </motion.div>

          {/* Link columns */}
          {columns.map((col) => (
            <motion.div key={col.title} className="space-y-4" variants={itemVariants}>
              <h3 className="font-semibold text-sm text-white">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="text-sm text-white/60 hover:text-white/90 transition-colors cursor-default">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <Separator className="bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} Klass. Todos los derechos
            reservados.
          </p>
          <p className="text-sm text-white/50">
            Hecho con Rust, Next.js y mucho mate.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
