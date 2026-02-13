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
import { useAdminUsers, useUpdateUserRole } from "@/hooks/use-admin";
import type { Profile, UserRole } from "@/types";
import { toast } from "sonner";

const ROLE_COLORS: Record<string, string> = {
  patient: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  doctor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const ROLE_LABELS: Record<string, string> = {
  patient: "Paciente",
  doctor: "Doctor",
  admin: "Admin",
};

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = roleFilter === "all"
    ? users
    : users.filter((u) => u.role === roleFilter);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await updateRole.mutateAsync({ userId, role });
      toast.success("Rol actualizado");
    } catch {
      toast.error("Error al actualizar rol");
    }
  };

  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: "full_name",
      header: "Nombre",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.full_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.phone || "Sin telefono"}</p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => (
        <Badge className={ROLE_COLORS[row.original.role] || ""}>
          {ROLE_LABELS[row.original.role] || row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Registro",
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
            {(["patient", "doctor", "admin"] as UserRole[])
              .filter((r) => r !== row.original.role)
              .map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => handleRoleChange(row.original.id, role)}
                >
                  Cambiar a {ROLE_LABELS[role]}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminPageShell title="Usuarios" description="Gestion de usuarios del sistema">
      <DataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        searchKey="full_name"
        searchPlaceholder="Buscar por nombre..."
        filterComponent={
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="patient">Pacientes</SelectItem>
              <SelectItem value="doctor">Doctores</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </AdminPageShell>
  );
}
