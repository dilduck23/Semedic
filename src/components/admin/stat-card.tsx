"use client";

import { MaterialIcon } from "@/components/shared/material-icon";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string };
}

export function StatCard({ label, value, icon, iconColor = "text-[#2A388F]", iconBg = "bg-blue-50 dark:bg-blue-900/20", trend }: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.value >= 0 ? "text-green-600" : "text-red-600"}`}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          <MaterialIcon name={icon} className={`text-lg ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
