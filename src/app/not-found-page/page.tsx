import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Pagina no encontrada
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          El colegio que buscas no existe o no esta disponible.
        </p>
        <Link
          href="https://goschool.ar"
          className="mt-8 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Ir a Klass
        </Link>
      </div>
    </div>
  );
}
