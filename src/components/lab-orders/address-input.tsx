"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/shared/material-icon";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function AddressInput({ value, onChange }: AddressInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="address" className="text-sm font-medium">
        Direccion de domicilio
      </Label>
      <div className="relative">
        <MaterialIcon
          name="location_on"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg"
        />
        <Input
          id="address"
          placeholder="Ingresa tu direccion completa"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Incluye calle, numero, colonia/barrio y referencias
      </p>
    </div>
  );
}
