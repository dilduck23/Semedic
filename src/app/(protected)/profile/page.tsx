"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { createClient } from "@/lib/supabase/client";
import { MaterialIcon } from "@/components/shared/material-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ROUTES, BLOOD_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { theme, setTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    blood_type: "",
  });

  function startEditing() {
    setFormData({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      date_of_birth: profile?.date_of_birth || "",
      blood_type: profile?.blood_type || "",
    });
    setEditing(true);
  }

  async function handleSave() {
    try {
      await updateProfile.mutateAsync({
        full_name: formData.full_name,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        blood_type: formData.blood_type || null,
      });
      toast.success("Perfil actualizado");
      setEditing(false);
    } catch {
      toast.error("Error al actualizar el perfil");
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(ROUTES.AUTH.LOGIN);
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="pt-12 px-6 space-y-6">
        <div className="flex flex-col items-center">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-6 w-40 mt-4" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
      </div>
    );
  }

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="pt-12 lg:pt-6 pb-4 px-6 bg-card sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-bold text-center">Mi Perfil</h1>
      </header>

      <main className="px-6 lg:px-8 pt-6 pb-8 space-y-6 lg:max-w-xl lg:mx-auto">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center">
          <Avatar className="w-24 h-24 border-4 border-[#2A388F] shadow-lg">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-[#2A388F] text-white text-2xl font-bold">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold mt-4">{profile?.full_name}</h2>
          <p className="text-gray-500 text-sm">{profile?.email}</p>
          <span className="mt-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-[#2A388F] dark:text-blue-300 px-3 py-1 rounded-full font-semibold capitalize">
            {profile?.role}
          </span>
        </div>

        <Separator />

        {/* Profile info */}
        <div className="bg-card rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Informacion Personal</h3>
            {!editing && (
              <button
                onClick={startEditing}
                className="text-[#2A388F] text-sm font-semibold"
              >
                Editar
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="809-555-0000"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de nacimiento</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de sangre</Label>
                <select
                  value={formData.blood_type}
                  onChange={(e) =>
                    setFormData({ ...formData, blood_type: e.target.value })
                  }
                  className="w-full p-2 bg-background border border-border rounded-xl text-sm"
                >
                  <option value="">Seleccionar</option>
                  {BLOOD_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-[#2A388F] hover:bg-[#1D2770]"
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <InfoRow
                icon="phone"
                label="Telefono"
                value={profile?.phone || "Sin registrar"}
              />
              <InfoRow
                icon="cake"
                label="Fecha de nacimiento"
                value={profile?.date_of_birth || "Sin registrar"}
              />
              <InfoRow
                icon="bloodtype"
                label="Tipo de sangre"
                value={profile?.blood_type || "Sin registrar"}
              />
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-card rounded-2xl p-5 shadow-soft space-y-4">
          <h3 className="font-bold">Configuracion</h3>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-between py-2"
          >
            <div className="flex items-center space-x-3">
              <MaterialIcon
                name={theme === "dark" ? "dark_mode" : "light_mode"}
                className="text-gray-600 dark:text-gray-300"
              />
              <span className="text-sm font-medium">Modo oscuro</span>
            </div>
            <div
              className={`w-12 h-6 rounded-full relative transition-colors ${theme === "dark" ? "bg-[#2A388F]" : "bg-gray-300"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-0.5"}`}
              />
            </div>
          </button>

          <Separator />

          <button
            onClick={() => router.push(ROUTES.PROMOTIONS)}
            className="w-full flex items-center justify-between py-2"
          >
            <div className="flex items-center space-x-3">
              <MaterialIcon
                name="local_offer"
                className="text-gray-600 dark:text-gray-300"
              />
              <span className="text-sm font-medium">Gestionar Promociones</span>
            </div>
            <MaterialIcon name="chevron_right" className="text-gray-400" />
          </button>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full rounded-xl h-12 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <MaterialIcon name="logout" className="mr-2" />
          Cerrar Sesion
        </Button>

        <p className="text-center text-xs text-gray-400">
          Semedic v1.0.0
        </p>
      </main>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center space-x-3">
      <MaterialIcon
        name={icon}
        className="text-gray-400 text-lg"
      />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
