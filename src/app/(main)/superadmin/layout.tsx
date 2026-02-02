'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Building2, LayoutDashboard, LogOut, Shield } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
  { name: 'Schools', href: '/superadmin/schools', icon: Building2 },
  { name: 'Security', href: '/superadmin/security', icon: Shield },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/superadmin' && pathname.startsWith(href));

  const handleLogout = async () => {
    try {
      await fetch('/api/proxy/superadmin/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      router.push('/superadmin-login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 fixed inset-y-0 left-0 z-30 bg-sidebar border-r flex-col">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">GoSchool</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-background border-b px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Super Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Logout
          </button>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
