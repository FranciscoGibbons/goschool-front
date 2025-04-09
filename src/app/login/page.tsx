import LoginForm from "../components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full">
      {/* Left side - Brand section with updated blue background */}
      <div className="hidden md:flex md:w-2/5 items-center py-20 relative flex-col border-r-2 overflow-hidden">
  {/* Fondo con imagen y blur azul más fuerte */}
  <div className="absolute inset-0 bg-[url('/images/xd.jpeg')] bg-[#162e76] bg-blend-soft-light h-screen bg-center bg-no-repeat bg-cover z-0" />

  {/* Contenido por encima del fondo */}
  <div className="z-10 flex flex-col items-center text-center px-4">
    <Image 
      src="/images/logo.webp" 
      alt="Colegio Stella Maris Rosario" 
      width={200} 
      height={200} 
      className="mb-6 rounded-md"
    />
    <h1 className="text-4xl font-bold text-white drop-shadow-lg">Stella Maris Alumnos</h1>
  </div>
</div>


      {/* Right side - Login form */}
      <div className="w-full md:w-3/5 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900">Iniciar sesión</h2>
          </div>

          {/* Client Component para la funcionalidad interactiva */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
