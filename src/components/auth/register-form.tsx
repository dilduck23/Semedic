"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    toast.success("Cuenta creada exitosamente");
    router.push(ROUTES.AUTH.LOGIN);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input
          id="full_name"
          type="text"
          placeholder="Juan Perez"
          {...register("full_name")}
          className="h-12 rounded-xl"
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">
            {errors.full_name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electronico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          {...register("email")}
          className="h-12 rounded-xl"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contrasena</Label>
        <Input
          id="password"
          type="password"
          placeholder="Minimo 6 caracteres"
          {...register("password")}
          className="h-12 rounded-xl"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirmar contrasena</Label>
        <Input
          id="confirm_password"
          type="password"
          placeholder="Repite tu contrasena"
          {...register("confirm_password")}
          className="h-12 rounded-xl"
        />
        {errors.confirm_password && (
          <p className="text-sm text-destructive">
            {errors.confirm_password.message}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-[#2A388F] hover:bg-[#1D2770] text-white font-semibold text-base"
      >
        {loading ? "Creando cuenta..." : "Crear Cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ya tienes una cuenta?{" "}
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="text-[#2A388F] font-semibold hover:underline"
        >
          Inicia Sesion
        </Link>
      </p>
    </form>
  );
}
