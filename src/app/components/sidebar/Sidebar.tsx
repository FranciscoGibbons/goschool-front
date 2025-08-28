import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  EnvelopeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ClockIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ProfileAccount from "./ProfileAccount";
import ChildSelector from "./ChildSelector";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "Inicio", icon: HomeIcon, href: "/dashboard" },
  { name: "Mensajes", icon: EnvelopeIcon, href: "/mensajes" },
  { name: "Asignaturas", icon: BookOpenIcon, href: "/asignaturas" },
  { name: "Exámenes", icon: AcademicCapIcon, href: "/examenes" },
  {
    name: "Calificaciones",
    icon: ClipboardDocumentListIcon,
    href: "/calificaciones",
  },
  { name: "Conducta", icon: UserGroupIcon, href: "/conducta" },
  { name: "Horario", icon: ClockIcon, href: "/horario" },
  { name: "Asistencia", icon: PencilIcon, href: "/asistencia" },
];

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  
  // Close sidebar on mobile when a link is clicked
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar && overlay) {
        sidebar.classList.remove('translate-x-0');
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
      }
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full w-full bg-background overflow-y-auto",
        className
      )}
      style={{ height: '100vh' }}
      aria-label="Menú principal"
    >
      <div className="flex-1 flex flex-col overflow-y-auto py-4">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 pb-4 mb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="w-32">
            <Image
              src="/images/logo.webp"
              alt="Logo de la plataforma"
              width={128}
              height={64}
              className="w-full h-auto"
              priority
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => {
              const sidebar = document.getElementById('sidebar');
              const overlay = document.getElementById('sidebar-overlay');
              if (sidebar && overlay) {
                sidebar.classList.remove('translate-x-0');
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
              }
            }}
          >
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
        {/* Desktop Logo */}
        <div className="hidden lg:block mb-6 px-4">
          <Link href="/" aria-label="Ir al inicio" className="block">
            <div className="w-32">
              <Image
                src="/images/logo.webp"
                alt="Logo de la plataforma"
                width={128}
                height={64}
                className="w-full h-auto"
                priority
              />
            </div>
          </Link>
        </div>

        <ChildSelector />
        
        <nav className="space-y-1 p-2 ml-0.5" role="navigation">
          <ul>
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} 
                      aria-hidden="true" 
                    />
                    <span className="text-[15px] ">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mb-15">
        <ProfileAccount />
      </div>
    </aside>
  );
}
