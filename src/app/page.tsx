import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import LandingPage from './landing/LandingPage';

export const metadata: Metadata = {
  title: "Klass - Plataforma de Gestion Escolar",
  description: "Sistema integral de gestion academica para colegios argentinos.",
  robots: { index: true, follow: true },
};

export default async function Home() {
  // Si hay subdominio, redirigir al login del colegio
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const hasSubdomain = /^[a-z0-9-]+\.goschool\./.test(host);

  if (hasSubdomain) {
    redirect('/login');
  }

  // Sin subdominio: landing page
  return <LandingPage />;
}
