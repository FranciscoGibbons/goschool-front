import Link from "next/link";
import Image from "next/image";
import {
  HomeIcon,
  EnvelopeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ClockIcon,
  PencilIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import ProfileAccount from "./ProfileAccount";

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
  { name: "Mi Perfil", icon: UserCircleIcon, href: "/perfil" },
];

export default function Sidebar() {
  return (
    <aside
      className="flex flex-col justify-between py-10 h-screen w-64 bg-sidebar border-r border-sidebar-border p-4"
      aria-label="Menú principal"
    >
      <div>
        <div className="mb-8">
          <Link href="/" aria-label="Ir al inicio">
            <Image
              src="/images/logo.webp"
              alt="Logo de la plataforma"
              width={100}
              height={100}
            />
          </Link>
        </div>

        <nav className="space-y-2" role="navigation">
          <ul>
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sidebar-foreground rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <item.icon className="size-5" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="space-y-4">
        <ProfileAccount />
      </div>
    </aside>
  );
}
