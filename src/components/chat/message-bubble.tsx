"use client";

import { cn } from "@/lib/utils";
import { FileMessage } from "./file-message";
import { MaterialIcon } from "@/components/shared/material-icon";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.created_at).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (message.type === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex mb-2",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5",
          isOwn
            ? "bg-[#2A388F] text-white rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        {message.type === "file" && message.file_url ? (
          <FileMessage
            fileUrl={message.file_url}
            fileName={message.file_name || "archivo"}
            fileSize={message.file_size || 0}
            fileType={message.file_type || ""}
            isOwn={isOwn}
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <span
            className={cn(
              "text-[10px]",
              isOwn ? "text-blue-200" : "text-muted-foreground"
            )}
          >
            {time}
          </span>
          {isOwn && (
            <MaterialIcon
              name={message.is_read ? "done_all" : "done"}
              className={cn(
                "text-xs",
                message.is_read ? "text-blue-200" : "text-blue-300"
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
