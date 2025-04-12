import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  EnvelopeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ClockIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
// import ProfilePictureUploader from '../dashboard/components/ProfilePictureUploader';


const menuItems = [
  { name: 'Inicio', icon: HomeIcon, href: '/dashboard' },
  { name: 'Mensajes', icon: EnvelopeIcon, href: '/mensajes' },
  { name: 'Asignaturas', icon: BookOpenIcon, href: '/asignaturas' },
  { name: 'Exámenes', icon: AcademicCapIcon, href: '/examenes' },
  { name: 'Calificaciones', icon: ClipboardDocumentListIcon, href: '/calificaciones' },
  { name: 'Conducta', icon: UserGroupIcon, href: '/conducta' },
  { name: 'Horario', icon: ClockIcon, href: '/horario' },
  { name: 'Asistencia', icon: PencilIcon, href: '/asistencia' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4" aria-label="Menú principal">
      <div className="mb-8">
        <Link href="/" aria-label="Ir al inicio">
          <Image src="/images/logo.webp" alt="Logo de la plataforma" width={100} height={100}/>
        </Link>
      </div>

      <nav className="space-y-2" role="navigation">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* <ProfilePictureUploader /> */}
    </aside>
  );
}
