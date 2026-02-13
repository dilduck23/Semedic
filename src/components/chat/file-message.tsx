"use client";

import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/shared/material-icon";

interface FileMessageProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  isOwn: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function FileMessage({
  fileUrl,
  fileName,
  fileSize,
  fileType,
  isOwn,
}: FileMessageProps) {
  const isImage = fileType.startsWith("image/");

  if (isImage) {
    return (
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fileUrl}
          alt={fileName}
          className="rounded-lg max-w-full max-h-52 object-cover"
        />
        <p className={cn("text-xs mt-1", isOwn ? "text-blue-200" : "text-muted-foreground")}>
          {fileName}
        </p>
      </a>
    );
  }

  const icon = fileType.includes("pdf") ? "picture_as_pdf" : "description";

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-colors",
        isOwn
          ? "bg-blue-800/30 hover:bg-blue-800/50"
          : "bg-background/50 hover:bg-background/80"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          isOwn ? "bg-blue-700" : "bg-muted"
        )}
      >
        <MaterialIcon name={icon} className="text-lg" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{fileName}</p>
        <p className={cn("text-xs", isOwn ? "text-blue-200" : "text-muted-foreground")}>
          {formatFileSize(fileSize)}
        </p>
      </div>
      <MaterialIcon
        name="download"
        className={cn("text-lg shrink-0", isOwn ? "text-blue-200" : "text-muted-foreground")}
      />
    </a>
  );
}
