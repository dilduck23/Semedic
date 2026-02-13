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
import { useAdminCenters, useCreateCenter, useUpdateCenter } from "@/hooks/use-admin";
import type { MedicalCenter } from "@/types";
import { toast } from "sonner";

export default function AdminCentersPage() {
  const { data: centers = [], isLoading } = useAdminCenters();
  const createCenter = useCreateCenter();
  const updateCenter = useUpdateCenter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MedicalCenter | null>(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    hours: "",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", address: "", phone: "", hours: "" });
    setShowForm(true);
  };

  const openEdit = (center: MedicalCenter) => {
    setEditing(center);
    setForm({
      name: center.name,
      address: center.address,
      phone: center.phone || "",
      hours: center.hours || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.address) {
      toast.error("Nombre y direccion son requeridos");
      return;
    }

    try {
      if (editing) {
        await updateCenter.mutateAsync({
          id: editing.id,
          name: form.name,
          address: form.address,
          phone: form.phone || undefined,
          hours: form.hours || undefined,
        });
        toast.success("Centro actualizado");
      } else {
        await createCenter.mutateAsync({
          name: form.name,
          address: form.address,
          phone: form.phone || undefined,
          hours: form.hours || undefined,
        });
        toast.success("Centro creado");
      }
      setShowForm(false);
    } catch {
      toast.error("Error al guardar centro");
    }
  };

  const toggleActive = async (center: MedicalCenter) => {
    try {
      await updateCenter.mutateAsync({ id: center.id, is_active: !center.is_active });
      toast.success(center.is_active ? "Centro desactivado" : "Centro activado");
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const columns: ColumnDef<MedicalCenter>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "address",
      header: "Direccion",
      cell: ({ row }) => (
        <span className="text-sm max-w-[200px] truncate block">{row.original.address}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Telefono",
      cell: ({ row }) => row.original.phone || "—",
    },
    {
      accessorKey: "hours",
      header: "Horario",
      cell: ({ row }) => row.original.hours || "—",
    },
    {
      accessorKey: "is_active",
      header: "Estado",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }
        >
          {row.original.is_active ? "Activo" : "Inactivo"}
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
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleActive(row.original)}>
              {row.original.is_active ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const isPending = createCenter.isPending || updateCenter.isPending;

  return (
    <AdminPageShell
      title="Centros Medicos"
      description="Gestion de centros medicos"
      actions={
        <Button onClick={openCreate} className="bg-[#2A388F] hover:bg-[#1e2a6e]">
          <MaterialIcon name="add" className="text-base mr-1" />
          Nuevo Centro
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={centers}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Buscar centro..."
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Centro" : "Nuevo Centro"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Hospital Central"
              />
            </div>
            <div>
              <Label>Direccion *</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Av. Principal #123"
              />
            </div>
            <div>
              <Label>Telefono</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 809-555-0000"
              />
            </div>
            <div>
              <Label>Horario</Label>
              <Input
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                placeholder="Lun-Vie 8:00-17:00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isPending} className="bg-[#2A388F] hover:bg-[#1e2a6e]">
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}
