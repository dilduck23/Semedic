"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { promotionFormSchema, type PromotionFormData } from "@/lib/validations";
import { useCreatePromotion } from "@/hooks/use-promotions";
import { useSpecialties } from "@/hooks/use-specialties";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PromotionFormDialogProps {
  open: boolean;
  onClose: () => void;
}

export function PromotionFormDialog({ open, onClose }: PromotionFormDialogProps) {
  const createPromotion = useCreatePromotion();
  const { data: specialties } = useSpecialties();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      type: "percentage",
      gradient_from: "#3B82F6",
      gradient_to: "#4F46E5",
      icon_name: "medical_services",
    },
  });

  async function onSubmit(data: PromotionFormData) {
    setIsSubmitting(true);
    try {
      await createPromotion.mutateAsync({
        title: data.title,
        description: data.description,
        type: data.type,
        discount_value: data.discount_value,
        coupon_code: data.coupon_code,
        specialty_id: data.specialty_id || undefined,
        valid_from: data.valid_from,
        valid_to: data.valid_to,
        max_uses: data.max_uses,
        gradient_from: data.gradient_from || "#3B82F6",
        gradient_to: data.gradient_to || "#4F46E5",
        icon_name: data.icon_name || "medical_services",
      });
      toast.success("Promocion creada exitosamente");
      reset();
      onClose();
    } catch {
      toast.error("Error al crear la promocion");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold">Nueva Promocion</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <MaterialIcon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Titulo *</Label>
            <Input {...register("title")} placeholder="Ej: Descuento en Dermatologia" className="rounded-xl" />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Descripcion</Label>
            <textarea
              {...register("description")}
              placeholder="Descripcion de la promocion..."
              className="w-full p-3 bg-background border border-border rounded-xl text-sm resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <select
                {...register("type")}
                className="w-full p-2 bg-background border border-border rounded-xl text-sm"
              >
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
                <option value="bundle">Paquete</option>
                <option value="first_visit">Primera visita</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Valor descuento *</Label>
              <Input
                type="number"
                step="0.01"
                {...register("discount_value", { valueAsNumber: true })}
                placeholder="15"
                className="rounded-xl"
              />
              {errors.discount_value && <p className="text-xs text-red-500">{errors.discount_value.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Codigo de cupon *</Label>
              <Input
                {...register("coupon_code")}
                placeholder="DESCUENTO20"
                className="rounded-xl uppercase"
              />
              {errors.coupon_code && <p className="text-xs text-red-500">{errors.coupon_code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Especialidad</Label>
              <select
                {...register("specialty_id")}
                className="w-full p-2 bg-background border border-border rounded-xl text-sm"
              >
                <option value="">Todas</option>
                {specialties?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha inicio *</Label>
              <Input type="date" {...register("valid_from")} className="rounded-xl" />
              {errors.valid_from && <p className="text-xs text-red-500">{errors.valid_from.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Fecha fin *</Label>
              <Input type="date" {...register("valid_to")} className="rounded-xl" />
              {errors.valid_to && <p className="text-xs text-red-500">{errors.valid_to.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Usos maximos (opcional)</Label>
            <Input
              type="number"
              {...register("max_uses", { valueAsNumber: true })}
              placeholder="Sin limite"
              className="rounded-xl"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-[#2A388F] hover:bg-[#1D2770]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear Promocion"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
