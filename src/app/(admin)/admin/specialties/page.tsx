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
import { Checkbox } from "@/components/ui/checkbox";
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
import { useAdminSpecialties, useCreateSpecialty, useUpdateSpecialty } from "@/hooks/use-admin";
import type { Specialty } from "@/types";
import { toast } from "sonner";

export default function AdminSpecialtiesPage() {
  const { data: specialties = [], isLoading } = useAdminSpecialties();
  const createSpecialty = useCreateSpecialty();
  const updateSpecialty = useUpdateSpecialty();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Specialty | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    icon_name: "stethoscope",
    is_popular: false,
    sort_order: "0",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", icon_name: "stethoscope", is_popular: false, sort_order: "0" });
    setShowForm(true);
  };

  const openEdit = (s: Specialty) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || "",
      icon_name: s.icon_name,
      is_popular: s.is_popular,
      sort_order: s.sort_order.toString(),
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.icon_name) {
      toast.error("Nombre e icono son requeridos");
      return;
    }

    try {
      if (editing) {
        await updateSpecialty.mutateAsync({
          id: editing.id,
          name: form.name,
          description: form.description || undefined,
          icon_name: form.icon_name,
          is_popular: form.is_popular,
          sort_order: parseInt(form.sort_order) || 0,
        });
        toast.success("Especialidad actualizada");
      } else {
        await createSpecialty.mutateAsync({
          name: form.name,
          description: form.description || undefined,
          icon_name: form.icon_name,
          is_popular: form.is_popular,
          sort_order: parseInt(form.sort_order) || 0,
        });
        toast.success("Especialidad creada");
      }
      setShowForm(false);
    } catch {
      toast.error("Error al guardar especialidad");
    }
  };

  const columns: ColumnDef<Specialty & { doctor_count: number }>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <MaterialIcon name={row.original.icon_name} className="text-[#2A388F] text-sm" />
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "doctor_count",
      header: "Doctores",
    },
    {
      accessorKey: "is_popular",
      header: "Popular",
      cell: ({ row }) =>
        row.original.is_popular ? (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            Popular
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      accessorKey: "sort_order",
      header: "Orden",
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const isPending = createSpecialty.isPending || updateSpecialty.isPending;

  return (
    <AdminPageShell
      title="Especialidades"
      description="Gestion de especialidades medicas"
      actions={
        <Button onClick={openCreate} className="bg-[#2A388F] hover:bg-[#1e2a6e]">
          <MaterialIcon name="add" className="text-base mr-1" />
          Nueva Especialidad
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={specialties}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Buscar especialidad..."
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Especialidad" : "Nueva Especialidad"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Cardiologia"
              />
            </div>
            <div>
              <Label>Descripcion</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Icono (Material Icon) *</Label>
              <Input
                value={form.icon_name}
                onChange={(e) => setForm({ ...form, icon_name: e.target.value })}
                placeholder="stethoscope"
              />
            </div>
            <div>
              <Label>Orden</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_popular"
                checked={form.is_popular}
                onCheckedChange={(v) => setForm({ ...form, is_popular: !!v })}
              />
              <Label htmlFor="is_popular">Marcar como popular</Label>
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
