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
import {
  useAdminDoctors,
  useCreateDoctor,
  useUpdateDoctor,
  useAdminSpecialties,
} from "@/hooks/use-admin";
import type { Doctor } from "@/types";
import { toast } from "sonner";

export default function AdminDoctorsPage() {
  const { data: doctors = [], isLoading } = useAdminDoctors();
  const { data: specialties = [] } = useAdminSpecialties();
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  const filteredDoctors = specialtyFilter === "all"
    ? doctors
    : doctors.filter((d) => d.specialty_id === specialtyFilter);

  const [form, setForm] = useState({
    full_name: "",
    specialty_id: "",
    consultation_price: "",
    license_number: "",
    bio: "",
  });

  const openCreate = () => {
    setEditingDoctor(null);
    setForm({ full_name: "", specialty_id: "", consultation_price: "", license_number: "", bio: "" });
    setShowForm(true);
  };

  const openEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setForm({
      full_name: doctor.full_name,
      specialty_id: doctor.specialty_id,
      consultation_price: doctor.consultation_price.toString(),
      license_number: doctor.license_number || "",
      bio: doctor.bio || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.specialty_id || !form.consultation_price) {
      toast.error("Completa los campos requeridos");
      return;
    }

    try {
      if (editingDoctor) {
        await updateDoctor.mutateAsync({
          id: editingDoctor.id,
          full_name: form.full_name,
          specialty_id: form.specialty_id,
          consultation_price: parseFloat(form.consultation_price),
          license_number: form.license_number || undefined,
          bio: form.bio || undefined,
        });
        toast.success("Doctor actualizado");
      } else {
        await createDoctor.mutateAsync({
          full_name: form.full_name,
          specialty_id: form.specialty_id,
          consultation_price: parseFloat(form.consultation_price),
          license_number: form.license_number || undefined,
          bio: form.bio || undefined,
        });
        toast.success("Doctor creado");
      }
      setShowForm(false);
    } catch {
      toast.error("Error al guardar doctor");
    }
  };

  const toggleActive = async (doctor: Doctor) => {
    try {
      await updateDoctor.mutateAsync({ id: doctor.id, is_active: !doctor.is_active });
      toast.success(doctor.is_active ? "Doctor desactivado" : "Doctor activado");
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: "full_name",
      header: "Nombre",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.full_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.license_number || "Sin licencia"}</p>
        </div>
      ),
    },
    {
      accessorKey: "specialty",
      header: "Especialidad",
      cell: ({ row }) => (row.original.specialty as unknown as { name: string })?.name || "—",
    },
    {
      accessorKey: "consultation_price",
      header: "Precio",
      cell: ({ row }) => `$${row.original.consultation_price.toFixed(2)}`,
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <MaterialIcon name="star" className="text-amber-500 text-sm" />
          <span>{row.original.rating}</span>
          <span className="text-xs text-muted-foreground">({row.original.total_reviews})</span>
        </div>
      ),
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

  const isPending = createDoctor.isPending || updateDoctor.isPending;

  return (
    <AdminPageShell
      title="Doctores"
      description="Gestion de doctores"
      actions={
        <Button onClick={openCreate} className="bg-[#2A388F] hover:bg-[#1e2a6e]">
          <MaterialIcon name="add" className="text-base mr-1" />
          Nuevo Doctor
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={filteredDoctors}
        isLoading={isLoading}
        searchKey="full_name"
        searchPlaceholder="Buscar por nombre..."
        filterComponent={
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Especialidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {specialties.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDoctor ? "Editar Doctor" : "Nuevo Doctor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nombre Completo *</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Dr. Juan Perez"
              />
            </div>
            <div>
              <Label>Especialidad *</Label>
              <Select value={form.specialty_id} onValueChange={(v) => setForm({ ...form, specialty_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Precio Consulta *</Label>
              <Input
                type="number"
                value={form.consultation_price}
                onChange={(e) => setForm({ ...form, consultation_price: e.target.value })}
                placeholder="50.00"
              />
            </div>
            <div>
              <Label>No. Licencia</Label>
              <Input
                value={form.license_number}
                onChange={(e) => setForm({ ...form, license_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Bio</Label>
              <Input
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Descripcion breve..."
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
