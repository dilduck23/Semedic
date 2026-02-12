"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MaterialIcon } from "@/components/shared/material-icon";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { href: ROUTES.DASHBOARD, icon: "home", label: "Inicio" },
  { href: ROUTES.APPOINTMENTS, icon: "calendar_month", label: "Mis Citas" },
  { href: ROUTES.SPECIALTIES, icon: "medical_services", label: "Especialidades" },
  { href: ROUTES.CHAT, icon: "chat_bubble", label: "Chat" },
  { href: ROUTES.PROFILE, icon: "person", label: "Mi Perfil" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      {/* Brand */}
      <div className="pt-8 pb-6 px-6 flex items-center gap-3">
        <Image src="/logo.png" alt="Semedic" width={40} height={40} />
        <div>
          <h1 className="text-xl font-bold text-[#2A388F]">Semedic</h1>
          <p className="text-xs text-muted-foreground">Centro Medico</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-[#2A388F] dark:text-blue-300"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              <MaterialIcon name={item.icon} filled={isActive} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Emergency button */}
      <div className="px-4 mb-4">
        <button
          onClick={() => window.open("tel:911", "_self")}
          className="w-full flex items-center justify-center gap-2 bg-[#ED1C24] hover:bg-red-700 text-white rounded-xl py-3 px-4 font-semibold text-sm transition-colors shadow-lg shadow-red-500/20"
        >
          <MaterialIcon name="emergency" className="text-lg" />
          <span>Emergencia</span>
        </button>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-gray-400 pb-4">Semedic v1.0.0</p>
    </aside>
  );
}
