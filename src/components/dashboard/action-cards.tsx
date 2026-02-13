"use client";

import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/shared/material-icon";
import { ROUTES } from "@/lib/constants";

const actions = [
  {
    label: "Agendar\nCita",
    icon: "calendar_today",
    colors: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    hoverColors: "group-hover:bg-blue-600 group-hover:text-white",
    href: ROUTES.SPECIALTIES,
  },
  {
    label: "Cita\nVirtual",
    icon: "videocam",
    colors: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
    hoverColors: "group-hover:bg-teal-600 group-hover:text-white",
    href: ROUTES.SPECIALTIES,
  },
  {
    label: "Laboratorio",
    icon: "science",
    colors:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    hoverColors: "group-hover:bg-purple-600 group-hover:text-white",
    href: ROUTES.LAB_ORDERS,
  },
  {
    label: "Examenes",
    icon: "biotech",
    colors:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    hoverColors: "group-hover:bg-orange-600 group-hover:text-white",
    href: ROUTES.EXAM_ORDERS,
  },
];

export function ActionCards() {
  const router = useRouter();

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 px-1">Que necesitas hoy?</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.icon}
            onClick={() => router.push(action.href)}
            className="p-4 bg-card rounded-2xl shadow-soft hover:shadow-lg transition-all transform hover:-translate-y-1 text-left flex flex-col justify-between h-32 group"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${action.colors} ${action.hoverColors}`}
            >
              <MaterialIcon name={action.icon} />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm whitespace-pre-line">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
