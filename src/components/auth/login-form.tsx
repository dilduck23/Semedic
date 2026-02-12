"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Correo o contrasena incorrectos"
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push(ROUTES.DASHBOARD);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="******"
          {...register("password")}
          className="h-12 rounded-xl"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
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
        {loading ? "Iniciando sesion..." : "Iniciar Sesion"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No tienes una cuenta?{" "}
        <Link
          href={ROUTES.AUTH.REGISTER}
          className="text-[#2A388F] font-semibold hover:underline"
        >
          Registrate
        </Link>
      </p>
    </form>
  );
}
