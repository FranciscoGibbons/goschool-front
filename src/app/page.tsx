import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  // Si hay subdominio, redirigir al login del colegio
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const hasSubdomain = /^[a-z0-9-]+\.goschool\./.test(host);

  if (hasSubdomain) {
    redirect('/login');
  }

  // Sin subdominio: landing page
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.webp"
              alt="GoSchool"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="font-semibold text-lg tracking-tight">GoSchool</span>
          </div>
          <Link
            href="/superadmin-login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Administracion
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-medium text-primary tracking-wide uppercase">
                  Academia Grafica
                </p>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
                  Gestion escolar
                  <span className="text-primary"> simplificada</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  GoSchool es una plataforma integral para la gestion academica.
                  Calificaciones, asistencia, comunicaciones y horarios en un solo lugar,
                  accesible para docentes, alumnos y familias.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://stellamaris.goschool.ar"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6"
                >
                  Ingresar a Stella Maris
                </a>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard
                title="Calificaciones"
                description="Registro y consulta de notas por materia y trimestre"
              />
              <FeatureCard
                title="Asistencia"
                description="Control diario con notificaciones automaticas"
              />
              <FeatureCard
                title="Comunicaciones"
                description="Mensajeria en tiempo real entre la comunidad educativa"
              />
              <FeatureCard
                title="Horarios"
                description="Organizacion de materias, turnos y divisiones"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <Stat value="Multi-tenant" label="Base de datos por colegio" />
              <Stat value="Tiempo real" label="Chat via WebSocket" />
              <Stat value="Seguro" label="JWT + HTTPS + HSTS" />
              <Stat value="Roles" label="Admin, docente, alumno, padre" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Academia Grafica. Todos los derechos reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Hecho con Rust, Next.js y mucho mate.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-2 hover:shadow-sm transition-shadow">
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
