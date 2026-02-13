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
  useAdminPromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useAdminSpecialties,
} from "@/hooks/use-admin";
import type { Promotion } from "@/types";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  percentage: "Porcentaje",
  fixed: "Monto fijo",
  bundle: "Paquete",
  first_visit: "Primera visita",
};

function getStatusInfo(promo: Promotion) {
  const now = new Date();
  const validTo = new Date(promo.valid_to);
  if (!promo.is_active) return { label: "Inactiva", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
  if (validTo < now) return { label: "Expirada", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" };
  if (promo.max_uses && promo.current_uses >= promo.max_uses) return { label: "Agotada", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" };
  return { label: "Activa", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" };
}

export default function AdminPromotionsPage() {
  const { data: promotions = [], isLoading } = useAdminPromotions();
  const { data: specialties = [] } = useAdminSpecialties();
  const createPromo = useCreatePromotion();
  const updatePromo = useUpdatePromotion();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "percentage",
    discount_value: "",
    coupon_code: "",
    specialty_id: "",
    valid_from: "",
    valid_to: "",
    max_uses: "",
    gradient_from: "#3B82F6",
    gradient_to: "#4F46E5",
    icon_name: "local_offer",
  });

  const openCreate = () => {
    setForm({
      title: "", description: "", type: "percentage", discount_value: "",
      coupon_code: "", specialty_id: "", valid_from: "", valid_to: "",
      max_uses: "", gradient_from: "#3B82F6", gradient_to: "#4F46E5", icon_name: "local_offer",
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.discount_value || !form.coupon_code || !form.valid_from || !form.valid_to) {
      toast.error("Completa los campos requeridos");
      return;
    }

    try {
      await createPromo.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        type: form.type,
        discount_value: parseFloat(form.discount_value),
        coupon_code: form.coupon_code,
        specialty_id: form.specialty_id || undefined,
        valid_from: form.valid_from,
        valid_to: form.valid_to,
        max_uses: form.max_uses ? parseInt(form.max_uses) : undefined,
        gradient_from: form.gradient_from,
        gradient_to: form.gradient_to,
        icon_name: form.icon_name,
      });
      toast.success("Promocion creada");
      setShowForm(false);
    } catch {
      toast.error("Error al crear promocion");
    }
  };

  const toggleActive = async (promo: Promotion) => {
    try {
      await updatePromo.mutateAsync({ id: promo.id, is_active: !promo.is_active });
      toast.success(promo.is_active ? "Promocion desactivada" : "Promocion activada");
    } catch {
      toast.error("Error al cambiar estado");
    }
  };

  const columns: ColumnDef<Promotion>[] = [
    {
      accessorKey: "title",
      header: "Titulo",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${row.original.gradient_from}, ${row.original.gradient_to})` }}
          >
            <MaterialIcon name={row.original.icon_name} className="text-sm" />
          </div>
          <div>
            <p className="font-medium">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">{TYPE_LABELS[row.original.type]}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "coupon_code",
      header: "Codigo",
      cell: ({ row }) => (
        <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
          {row.original.coupon_code}
        </code>
      ),
    },
    {
      accessorKey: "discount_value",
      header: "Descuento",
      cell: ({ row }) =>
        row.original.type === "percentage"
          ? `${row.original.discount_value}%`
          : `$${row.original.discount_value}`,
    },
    {
      accessorKey: "current_uses",
      header: "Usos",
      cell: ({ row }) =>
        `${row.original.current_uses}${row.original.max_uses ? `/${row.original.max_uses}` : ""}`,
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = getStatusInfo(row.original);
        return <Badge className={status.color}>{status.label}</Badge>;
      },
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
            <DropdownMenuItem onClick={() => toggleActive(row.original)}>
              {row.original.is_active ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <AdminPageShell
      title="Promociones"
      description="Gestion de promociones y cupones"
      actions={
        <Button onClick={openCreate} className="bg-[#2A388F] hover:bg-[#1e2a6e]">
          <MaterialIcon name="add" className="text-base mr-1" />
          Nueva Promocion
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={promotions}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="Buscar promocion..."
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Promocion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Titulo *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Descripcion</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentaje</SelectItem>
                    <SelectItem value="fixed">Monto fijo</SelectItem>
                    <SelectItem value="bundle">Paquete</SelectItem>
                    <SelectItem value="first_visit">Primera visita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descuento *</Label>
                <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Codigo Cupon *</Label>
                <Input value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value.toUpperCase() })} placeholder="CODIGO20" />
              </div>
              <div>
                <Label>Max. Usos</Label>
                <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Especialidad (opcional)</Label>
              <Select value={form.specialty_id} onValueChange={(v) => setForm({ ...form, specialty_id: v })}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {specialties.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valido Desde *</Label>
                <Input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
              </div>
              <div>
                <Label>Valido Hasta *</Label>
                <Input type="date" value={form.valid_to} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createPromo.isPending} className="bg-[#2A388F] hover:bg-[#1e2a6e]">
              {createPromo.isPending ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}
