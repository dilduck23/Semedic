"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MaterialIcon } from "@/components/shared/material-icon";
import { useAdminLabOrders, useUpdateLabOrderStatus } from "@/hooks/use-admin";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import type { LabOrder, OrderStatus, Profile } from "@/types";
import { toast } from "sonner";

type LabOrderRow = LabOrder & { patient?: Profile };

export default function AdminLabOrdersPage() {
  const { data: orders = [], isLoading } = useAdminLabOrders();
  const updateStatus = useUpdateLabOrderStatus();
  const [statusFilter, setStatusFilter] = useState("all");
  const [resultsDialog, setResultsDialog] = useState<{ id: string; url: string } | null>(null);

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al actualizar estado");
    }
  };

  const handleUploadResults = async () => {
    if (!resultsDialog?.url) {
      toast.error("Ingresa la URL de resultados");
      return;
    }
    try {
      await updateStatus.mutateAsync({
        id: resultsDialog.id,
        status: "completed",
        results_url: resultsDialog.url,
      });
      toast.success("Resultados subidos");
      setResultsDialog(null);
    } catch {
      toast.error("Error al subir resultados");
    }
  };

  const columns: ColumnDef<LabOrderRow>[] = [
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
      accessorKey: "lab_test_type",
      header: "Examen",
      cell: ({ row }) => {
        const type = row.original.lab_test_type as unknown as { name: string; category: string } | undefined;
        return (
          <div>
            <p className="font-medium">{type?.name || "—"}</p>
            <p className="text-xs text-muted-foreground">{type?.category || ""}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "scheduled_date",
      header: "Fecha",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">
            {new Date(row.original.scheduled_date).toLocaleDateString("es", {
              day: "numeric",
              month: "short",
            })}
          </p>
          <p className="text-xs text-muted-foreground">{row.original.scheduled_time}</p>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge className={ORDER_STATUS_COLORS[row.original.status] || ""}>
          {ORDER_STATUS_LABELS[row.original.status] || row.original.status}
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
            {(["pending", "confirmed", "in_progress", "completed", "cancelled"] as OrderStatus[])
              .filter((s) => s !== row.original.status)
              .map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(row.original.id, status)}
                >
                  Cambiar a {ORDER_STATUS_LABELS[status]}
                </DropdownMenuItem>
              ))}
            <DropdownMenuItem onClick={() => setResultsDialog({ id: row.original.id, url: "" })}>
              Subir Resultados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminPageShell title="Ordenes de Laboratorio" description="Gestion de ordenes de laboratorio">
      <DataTable
        columns={columns}
        data={filteredOrders}
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
              <SelectItem value="confirmed">Confirmados</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={!!resultsDialog} onOpenChange={() => setResultsDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir Resultados</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>URL del Documento de Resultados</Label>
            <Input
              value={resultsDialog?.url || ""}
              onChange={(e) => setResultsDialog((prev) => prev ? { ...prev, url: e.target.value } : null)}
              placeholder="https://..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResultsDialog(null)}>Cancelar</Button>
            <Button onClick={handleUploadResults} disabled={updateStatus.isPending} className="bg-[#2A388F] hover:bg-[#1e2a6e]">
              {updateStatus.isPending ? "Subiendo..." : "Subir y Completar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}
