import LoginForm from "./components/LoginForm";
import Image from "next/image";
import "./login.css";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left side - Image */}
      <div className="hidden md:flex md:w-2/5 items-center py-10 relative flex-col border-r border-border login-bg-container">
        {/* Background image with better overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/aside_login.webp"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 login-bg-overlay" />
        </div>
        
        {/* Content over background */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
          <div className="mb-6 w-40">
            <Image
              src="/images/logo.webp"
              alt="Colegio Stella Maris Rosario"
              width={160}
              height={80}
              className="w-full h-auto"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Stella Maris Alumnos
          </h1>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-3/5 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md space-y-6 bg-card p-6 sm:p-8 rounded-lg shadow-lg border border-border login-container">
          {/* Mobile logo */}
          <div className="md:hidden mb-6 text-center">
            <div className="w-32 mx-auto mb-4">
              <Image
                src="/images/logo.webp"
                alt="Colegio Stella Maris Rosario"
                width={128}
                height={64}
                className="w-full h-auto"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Stella Maris Alumnos
            </h1>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Iniciar sesión
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
