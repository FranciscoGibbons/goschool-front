const fs = require('fs').promises;
const path = require('path');

const protectedRoutes = [
  'asignaturas',
  'calificaciones',
  'examenes',
  'horario',
  'mensajes',
  'perfil'
];

const template = `"use client";

import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function Page() {
  const { isLoading } = useAuthRedirect();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Título de la Página</h1>
      {/* Contenido de la página */}
    </div>
  );
}`;

async function updateRoute(routeName) {
  const routePath = path.join(
    __dirname,
    '..',
    'src',
    'app',
    '(main)',
    routeName,
    'page.tsx'
  );

  try {
    await fs.writeFile(routePath, template, 'utf8');
    console.log(`✅ Updated: ${routePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${routePath}:`, error);
  }
}

async function main() {
  for (const route of protectedRoutes) {
    await updateRoute(route);
  }
}

main().catch(console.error);
