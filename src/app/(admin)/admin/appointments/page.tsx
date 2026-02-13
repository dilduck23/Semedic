"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MaterialIcon } from "@/components/shared/material-icon";
import { useAdminAppointments, useUpdateAppointmentStatus } from "@/hooks/use-admin";
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import type { Appointment, AppointmentStatus, Profile } from "@/types";
import { toast } from "sonner";

type AppointmentRow = Appointment & { patient?: Profile };

export default function AdminAppointmentsPage() {
  const { data: appointments = [], isLoading } = useAdminAppointments();
  const updateStatus = useUpdateAppointmentStatus();
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAppointments = statusFilter === "all"
    ? appointments
    : appointments.filter((a) => a.status === statusFilter);

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const columns: ColumnDef<AppointmentRow>[] = [
    {
      accessorKey: "patient",
      header: "Paciente",
      cell: ({ row }) => {
        const patient = row.original.patient as unknown as { full_name: string; email: string } | undefined;
        return (
          <div>
            <p className="font-medium">{patient?.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{patient?.email || ""}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "doctor",
      header: "Doctor",
      cell: ({ row }) => {
        const doctor = row.original.doctor as unknown as { full_name: string; specialty?: { name: string } } | undefined;
        return (
          <div>
            <p className="font-medium">{doctor?.full_name || "—"}</p>
            <p className="text-xs text-muted-foreground">{doctor?.specialty?.name || ""}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">
            {new Date(row.original.date).toLocaleDateString("es", {
              day: "numeric",
              month: "short",
            })}
          </p>
          <p className="text-xs text-muted-foreground">{row.original.start_time}</p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type === "virtual" ? "Virtual" : "Presencial"}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
    },
    {
      accessorKey: "payment_status",
      header: "Pago",
      cell: ({ row }) => (
        <span className="text-xs">{PAYMENT_STATUS_LABELS[row.original.payment_status] || row.original.payment_status}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge className={APPOINTMENT_STATUS_COLORS[row.original.status] || ""}>
          {APPOINTMENT_STATUS_LABELS[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MaterialIcon name="more_vert" className="text-base" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(["pending", "confirmed", "completed", "cancelled"] as AppointmentStatus[])
              .filter((s) => s !== row.original.status)
              .map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(row.original.id, status)}
                >
                  Cambiar a {APPOINTMENT_STATUS_LABELS[status]}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminPageShell title="Citas" description="Gestion de citas medicas">
      <DataTable
        columns={columns}
        data={filteredAppointments}
        isLoading={isLoading}
        searchKey="patient"
        searchPlaceholder="Buscar..."
        filterComponent={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="confirmed">Confirmadas</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </AdminPageShell>
  );
}
