import { Suspense } from "react";
import { headers } from "next/headers";
import LoginForm from "./components/LoginForm";
import Image from "next/image";
import { branding, brandingMeta } from "@/config/branding";
import "./login.css";

interface SchoolPublicInfo {
  name: string;
  slug: string;
  primary_color: string | null;
  logo_url: string | null;
  hero_image: string | null;
}

async function fetchSchoolInfo(slug: string): Promise<SchoolPublicInfo | null> {
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';
    const res = await fetch(`${backendUrl}/api/school/${slug}/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function LoginPage() {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const subdomainMatch = host.match(/^([a-z0-9-]+)\.goschool\./);

  let schoolInfo: SchoolPublicInfo | null = null;
  if (subdomainMatch) {
    schoolInfo = await fetchSchoolInfo(subdomainMatch[1]);
  }

  const primaryColor = schoolInfo?.primary_color || null;
  const heroImage = schoolInfo?.hero_image || "/images/aside_login.webp";
  const schoolLogo = schoolInfo?.logo_url || branding.logoPath;
  const schoolName = schoolInfo?.name || branding.schoolFullName;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Left side - Branded Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background image */}
        {schoolInfo?.hero_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            src={heroImage}
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        )}
        {/* Dark branded overlay */}
        <div className="absolute inset-0 login-hero-overlay" />

        {/* Content over background */}
        <div className="relative z-10 flex flex-col justify-between w-full h-full p-10 xl:p-14">
          {/* Top - Logo and school name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-1.5">
              {schoolInfo?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={schoolLogo}
                  alt={schoolName}
                  className="w-full h-auto object-contain"
                />
              ) : (
                <Image
                  src={schoolLogo}
                  alt={brandingMeta.logoAlt}
                  width={48}
                  height={48}
                  className="w-full h-auto"
                  priority
                />
              )}
            </div>
            <div>
              <p className="text-white/90 font-semibold text-lg tracking-tight">
                {schoolName}
              </p>
              <p className="text-white/50 text-sm">
                Plataforma educativa
              </p>
            </div>
          </div>

          {/* Center - Main message */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Bienvenido a<br />
              <span className="login-hero-accent">
                {branding.appName}
              </span>
            </h1>
            <p className="mt-5 text-white/65 text-lg leading-relaxed">
              Accede a calificaciones, asistencia, comunicaciones y toda la
              gestión escolar en un solo lugar.
            </p>
            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="login-pill">Calificaciones</span>
              <span className="login-pill">Asistencia</span>
              <span className="login-pill">Comunicaciones</span>
              <span className="login-pill">Horarios</span>
            </div>
          </div>

          {/* Bottom - Footer */}
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} {schoolName}. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-10 sm:px-10 md:px-16 lg:px-12 xl:px-20 min-h-screen lg:min-h-0">
        {/* Mobile header */}
        <div className="lg:hidden mb-10 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center p-2">
            {schoolInfo?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={schoolLogo}
                alt={schoolName}
                className="w-full h-auto object-contain"
              />
            ) : (
              <Image
                src={schoolLogo}
                alt={brandingMeta.logoAlt}
                width={64}
                height={64}
                className="w-full h-auto"
                priority
              />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {branding.appName}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {schoolName}
          </p>
        </div>

        {/* Form card */}
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Iniciar sesion
            </h2>
            <p className="text-text-secondary mt-2 text-[15px]">
              Ingresa tus credenciales para acceder a la plataforma
            </p>
          </div>

          {/* Login Form */}
          <Suspense fallback={null}>
            <LoginForm primaryColor={primaryColor} />
          </Suspense>

          {/* Footer on desktop */}
          <p className="hidden lg:block mt-10 text-center text-xs text-text-muted">
            &copy; {new Date().getFullYear()} {schoolName}
          </p>
        </div>

        {/* Mobile footer */}
        <p className="lg:hidden mt-auto pt-8 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} {schoolName}
        </p>
      </div>
    </div>
  );
}
