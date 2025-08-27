import LoginForm from "./components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full">
      <div className="hidden md:flex md:w-2/5 items-center py-20 relative flex-col border-r-2 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/aside_login.webp')] bg-primary h-screen bg-center bg-no-repeat bg-cover z-0 opacity-40" />
        <div className="z-10 flex flex-col items-center text-center px-4">
          <Image
            src="/images/logo.webp"
            alt="Colegio Stella Maris Rosario"
            width={200}
            height={200}
            className="mb-6 rounded-md"
            style={{ width: 'auto', height: 'auto' }}
          />
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Stella Maris Alumnos
          </h1>
        </div>
      </div>

      <div className="w-full md:w-3/5 bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Iniciar sesión
            </h2>
          </div>

          {/* Formulario de Login */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
