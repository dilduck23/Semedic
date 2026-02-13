"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MaterialIcon } from "@/components/shared/material-icon";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "Principal",
    items: [
      { href: ROUTES.ADMIN.DASHBOARD, icon: "dashboard", label: "Dashboard" },
    ],
  },
  {
    label: "Gestion",
    items: [
      { href: ROUTES.ADMIN.USERS, icon: "group", label: "Usuarios" },
      { href: ROUTES.ADMIN.DOCTORS, icon: "stethoscope", label: "Doctores" },
      { href: ROUTES.ADMIN.SPECIALTIES, icon: "medical_services", label: "Especialidades" },
      { href: ROUTES.ADMIN.CENTERS, icon: "local_hospital", label: "Centros Medicos" },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { href: ROUTES.ADMIN.APPOINTMENTS, icon: "calendar_month", label: "Citas" },
      { href: ROUTES.ADMIN.PAYMENTS, icon: "payments", label: "Pagos" },
      { href: ROUTES.ADMIN.PROMOTIONS, icon: "local_offer", label: "Promociones" },
    ],
  },
  {
    label: "Servicios",
    items: [
      { href: ROUTES.ADMIN.LAB_ORDERS, icon: "science", label: "Ordenes Lab" },
      { href: ROUTES.ADMIN.EXAM_ORDERS, icon: "biotech", label: "Ordenes Examenes" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="pt-6 pb-4 px-6 flex items-center gap-3 border-b border-border">
        <Image src="/logo.png" alt="Semedic" width={36} height={36} />
        <div>
          <h1 className="text-lg font-bold text-[#2A388F]">Semedic</h1>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Panel Admin
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === ROUTES.ADMIN.DASHBOARD
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#2A388F]/10 text-[#2A388F] dark:bg-blue-900/20 dark:text-blue-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <MaterialIcon name={item.icon} filled={isActive} className="text-lg" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <Link
          href={ROUTES.DASHBOARD}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
        >
          <MaterialIcon name="arrow_back" className="text-base" />
          <span>Volver al Portal</span>
        </Link>
      </div>
    </aside>
  );
}
