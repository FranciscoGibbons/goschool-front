"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export interface SchoolPublicInfo {
  name: string;
  slug: string;
  description: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  hero_image: string | null;
  hero_title: string | null;
  hero_description: string | null;
  about_title: string | null;
  about_description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
}

export default function SchoolLandingPage({ school }: { school: SchoolPublicInfo }) {
  const primaryColor = school.primary_color || "#1a73e8";
  const secondaryColor = school.secondary_color || primaryColor;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {school.logo_url && (
              <img
                src={school.logo_url}
                alt={school.name}
                className="h-10 w-10 rounded-md object-contain"
              />
            )}
            <span className="text-lg font-semibold tracking-tight">{school.name}</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 text-white transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            Iniciar sesion
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        {school.hero_image ? (
          <section
            className="relative py-24 sm:py-36 bg-cover bg-center"
            style={{ backgroundImage: `url(${school.hero_image})` }}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
              {school.logo_url && (
                <img
                  src={school.logo_url}
                  alt={school.name}
                  className="mx-auto mb-8 h-24 w-24 rounded-xl object-contain bg-white/10 backdrop-blur p-2"
                />
              )}
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                {school.hero_title || `Bienvenidos a ${school.name}`}
              </h1>
              {(school.hero_description || school.description) && (
                <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                  {school.hero_description || school.description}
                </p>
              )}
              <div className="mt-10">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg text-base font-medium h-12 px-8 text-white transition-colors shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  Acceder a la plataforma
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
              {school.logo_url && (
                <img
                  src={school.logo_url}
                  alt={school.name}
                  className="mx-auto mb-8 h-24 w-24 rounded-xl object-contain"
                />
              )}
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                {school.hero_title || `Bienvenidos a ${school.name}`}
              </h1>
              {(school.hero_description || school.description) && (
                <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {school.hero_description || school.description}
                </p>
              )}
              <div className="mt-10">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg text-base font-medium h-12 px-8 text-white transition-colors shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  Acceder a la plataforma
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* About section */}
        {(school.about_title || school.about_description) && (
          <section className="border-t py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="max-w-3xl mx-auto text-center">
                {school.about_title && (
                  <h2 className="text-2xl font-semibold mb-4" style={{ color: secondaryColor }}>
                    {school.about_title}
                  </h2>
                )}
                {school.about_description && (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {school.about_description}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Contact info */}
        {(school.contact_email || school.contact_phone || school.address) && (
          <section className="border-t py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <h2 className="text-2xl font-semibold text-center mb-10">Contacto</h2>
              <div className="grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
                {school.contact_email && (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${secondaryColor}15` }}
                    >
                      <Mail className="h-5 w-5" style={{ color: secondaryColor }} />
                    </div>
                    <span className="text-sm font-medium">Email</span>
                    <a href={`mailto:${school.contact_email}`} className="text-sm text-muted-foreground hover:underline">
                      {school.contact_email}
                    </a>
                  </div>
                )}
                {school.contact_phone && (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${secondaryColor}15` }}
                    >
                      <Phone className="h-5 w-5" style={{ color: secondaryColor }} />
                    </div>
                    <span className="text-sm font-medium">Telefono</span>
                    <a href={`tel:${school.contact_phone}`} className="text-sm text-muted-foreground hover:underline">
                      {school.contact_phone}
                    </a>
                  </div>
                )}
                {school.address && (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${secondaryColor}15` }}
                    >
                      <MapPin className="h-5 w-5" style={{ color: secondaryColor }} />
                    </div>
                    <span className="text-sm font-medium">Direccion</span>
                    <span className="text-sm text-muted-foreground">{school.address}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} {school.name}</span>
          <span>
            Plataforma{" "}
            <a href="https://goschool.ar" className="hover:underline font-medium" style={{ color: primaryColor }}>
              Klass
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
