"use client";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { StatCard } from "@/components/admin/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useAdminStats,
  useAppointmentsChart,
  useRevenueChart,
  useAdminRecentActivity,
} from "@/hooks/use-admin";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "@/lib/constants";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: appointmentsChart } = useAppointmentsChart(30);
  const { data: revenueChart } = useRevenueChart(12);
  const { data: activity } = useAdminRecentActivity();

  return (
    <AdminPageShell title="Dashboard" description="Vista general del sistema">
      {/* Stats Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Usuarios"
            value={stats.total_users}
            icon="group"
            iconColor="text-blue-600"
            iconBg="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard
            label="Doctores"
            value={stats.total_doctors}
            icon="stethoscope"
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          />
          <StatCard
            label="Citas Hoy"
            value={stats.appointments_today}
            icon="calendar_today"
            iconColor="text-purple-600"
            iconBg="bg-purple-50 dark:bg-purple-900/20"
          />
          <StatCard
            label="Ingresos del Mes"
            value={`$${Number(stats.revenue_this_month).toLocaleString("es", { minimumFractionDigits: 2 })}`}
            icon="payments"
            iconColor="text-green-600"
            iconBg="bg-green-50 dark:bg-green-900/20"
            trend={
              stats.revenue_last_month > 0
                ? {
                    value: Math.round(
                      ((Number(stats.revenue_this_month) - Number(stats.revenue_last_month)) /
                        Number(stats.revenue_last_month)) *
                        100
                    ),
                    label: "vs mes anterior",
                  }
                : undefined
            }
          />
          <StatCard
            label="Lab Pendientes"
            value={stats.lab_orders_pending}
            icon="science"
            iconColor="text-amber-600"
            iconBg="bg-amber-50 dark:bg-amber-900/20"
          />
          <StatCard
            label="Examenes Pendientes"
            value={stats.exam_orders_pending}
            icon="biotech"
            iconColor="text-orange-600"
            iconBg="bg-orange-50 dark:bg-orange-900/20"
          />
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Appointments Chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-bold text-sm mb-4">Citas (ultimos 30 dias)</h3>
          <div className="h-[250px]">
            {appointmentsChart && appointmentsChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={appointmentsChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).getDate().toString()}
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(v) =>
                      new Date(v).toLocaleDateString("es", { day: "numeric", month: "short" })
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Citas"
                    stroke="#2A388F"
                    fill="#2A388F"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Sin datos disponibles
              </div>
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-bold text-sm mb-4">Ingresos (ultimos 12 meses)</h3>
          <div className="h-[250px]">
            {revenueChart && revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => [`$${Number(v).toLocaleString("es")}`, "Ingresos"]} />
                  <Bar dataKey="revenue" name="Ingresos" fill="#2A388F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Sin datos disponibles
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-bold text-sm mb-4">Citas Recientes</h3>
          <div className="space-y-3">
            {activity?.appointments?.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {(apt.patient as unknown as { full_name: string })?.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dr. {(apt.doctor as unknown as { full_name: string })?.full_name}
                  </p>
                </div>
                <Badge
                  className={`text-[10px] shrink-0 ml-2 ${APPOINTMENT_STATUS_COLORS[apt.status] || ""}`}
                >
                  {APPOINTMENT_STATUS_LABELS[apt.status] || apt.status}
                </Badge>
              </div>
            ))}
            {!activity?.appointments?.length && (
              <p className="text-sm text-muted-foreground">Sin citas recientes</p>
            )}
          </div>
        </div>

        {/* Recent Lab Orders */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-bold text-sm mb-4">Ordenes Lab Recientes</h3>
          <div className="space-y-3">
            {activity?.labOrders?.map((order) => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {(order.lab_test_type as unknown as { name: string })?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(order.patient as unknown as { full_name: string })?.full_name}
                  </p>
                </div>
                <Badge
                  className={`text-[10px] shrink-0 ml-2 ${ORDER_STATUS_COLORS[order.status] || ""}`}
                >
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </Badge>
              </div>
            ))}
            {!activity?.labOrders?.length && (
              <p className="text-sm text-muted-foreground">Sin ordenes recientes</p>
            )}
          </div>
        </div>

        {/* Recent Exam Orders */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-bold text-sm mb-4">Ordenes Examenes Recientes</h3>
          <div className="space-y-3">
            {activity?.examOrders?.map((order) => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">
                    {(order.exam_type as unknown as { name: string })?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(order.patient as unknown as { full_name: string })?.full_name}
                  </p>
                </div>
                <Badge
                  className={`text-[10px] shrink-0 ml-2 ${ORDER_STATUS_COLORS[order.status] || ""}`}
                >
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </Badge>
              </div>
            ))}
            {!activity?.examOrders?.length && (
              <p className="text-sm text-muted-foreground">Sin ordenes recientes</p>
            )}
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
