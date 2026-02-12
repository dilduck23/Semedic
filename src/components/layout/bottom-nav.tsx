"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/shared/material-icon";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { href: ROUTES.DASHBOARD, icon: "home", label: "Inicio" },
  { href: ROUTES.APPOINTMENTS, icon: "calendar_month", label: "Citas" },
  { href: "__spacer__", icon: "", label: "" },
  { href: ROUTES.CHAT, icon: "chat_bubble", label: "Chat" },
  { href: ROUTES.PROFILE, icon: "person", label: "Perfil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 z-40 max-w-md mx-auto lg:hidden">
      <div className="flex justify-between items-center">
        {navItems.map((item, index) => {
          if (item.href === "__spacer__") {
            return <div key={index} className="w-8" />;
          }

          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center space-y-1 transition-colors",
                isActive
                  ? "text-[#2A388F]"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              <MaterialIcon name={item.icon} filled={isActive} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
