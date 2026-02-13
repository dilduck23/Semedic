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
import { useAdminPayments, useUpdatePaymentStatus } from "@/hooks/use-admin";
import { PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import type { Payment, Profile } from "@/types";
import { toast } from "sonner";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

type PaymentRow = Payment & { patient?: Profile };

export default function AdminPaymentsPage() {
  const { data: payments = [], isLoading } = useAdminPayments();
  const updateStatus = useUpdatePaymentStatus();
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPayments = statusFilter === "all"
    ? payments
    : payments.filter((p) => p.status === statusFilter);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Estado de pago actualizado");
    } catch {
      toast.error("Error al actualizar pago");
    }
  };

  const columns: ColumnDef<PaymentRow>[] = [
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
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => (
        <span className="font-bold text-[#2A388F]">${row.original.amount.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "method",
      header: "Metodo",
      cell: ({ row }) => PAYMENT_METHOD_LABELS[row.original.method] || row.original.method,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge className={PAYMENT_STATUS_COLORS[row.original.status] || ""}>
          {PAYMENT_STATUS_LABELS[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "paid_at",
      header: "Fecha Pago",
      cell: ({ row }) =>
        row.original.paid_at
          ? new Date(row.original.paid_at).toLocaleDateString("es", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
    {
      accessorKey: "created_at",
      header: "Creado",
      cell: ({ row }) =>
        new Date(row.original.created_at).toLocaleDateString("es", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
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
            {row.original.status === "pending" && (
              <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "completed")}>
                Marcar como Pagado
              </DropdownMenuItem>
            )}
            {row.original.status === "completed" && (
              <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, "refunded")}>
                Reembolsar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminPageShell title="Pagos" description="Gestion de pagos y transacciones">
      <DataTable
        columns={columns}
        data={filteredPayments}
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
              <SelectItem value="completed">Pagados</SelectItem>
              <SelectItem value="failed">Fallidos</SelectItem>
              <SelectItem value="refunded">Reembolsados</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </AdminPageShell>
  );
}
