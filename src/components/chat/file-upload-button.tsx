"use client";

import { useRef } from "react";
import { MaterialIcon } from "@/components/shared/material-icon";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileUploadButton({ onFileSelect, disabled }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Tipo de archivo no permitido. Usa imagenes, PDF o documentos Word.");
      return;
    }

    if (file.size > MAX_SIZE) {
      alert("El archivo es muy grande. Maximo 10MB.");
      return;
    }

    onFileSelect(file);

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={cn(
          "p-2 rounded-full hover:bg-muted transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <MaterialIcon name="attach_file" className="text-xl text-muted-foreground" />
      </button>
    </>
  );
}
