import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import LandingPage from './landing/LandingPage';
import SchoolLandingPage from './landing/SchoolLandingPage';
import type { SchoolPublicInfo } from './landing/SchoolLandingPage';

export const metadata: Metadata = {
  title: "Klass - Plataforma de Gestion Escolar",
  description: "Sistema integral de gestion academica para colegios argentinos.",
  robots: { index: true, follow: true },
};

async function fetchSchoolInfo(slug: string): Promise<SchoolPublicInfo | null> {
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:3001';
    const res = await fetch(`${backendUrl}/api/school/${slug}/`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const subdomainMatch = host.match(/^([a-z0-9-]+)\.goschool\./);

  if (subdomainMatch) {
    const slug = subdomainMatch[1];
    const school = await fetchSchoolInfo(slug);

    if (!school) {
      notFound();
    }

    return <SchoolLandingPage school={school} />;
  }

  // Sin subdominio: landing page de la empresa
  return <LandingPage />;
}
