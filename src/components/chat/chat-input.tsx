"use client";

import { useState, useRef, useCallback } from "react";
import { MaterialIcon } from "@/components/shared/material-icon";
import { FileUploadButton } from "./file-upload-button";
import { useSendMessage } from "@/hooks/use-chat";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";

interface ChatInputProps {
  roomId: string;
  disabled?: boolean;
  onTyping?: () => void;
}

export function ChatInput({ roomId, disabled, onTyping }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useSendMessage();
  const { upload, isUploading } = useFileUpload();

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || sendMessage.isPending) return;

    setText("");
    try {
      await sendMessage.mutateAsync({ room_id: roomId, content });
    } catch {
      toast.error("Error al enviar mensaje");
    }
    inputRef.current?.focus();
  }, [text, roomId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      const result = await upload(file, "chat-files", roomId);
      await sendMessage.mutateAsync({
        room_id: roomId,
        content: "",
        type: "file",
        file_url: result.url,
        file_name: result.fileName,
        file_size: result.fileSize,
        file_type: result.fileType,
      });
    } catch {
      toast.error("Error al subir archivo");
    }
  };

  const handleInput = () => {
    onTyping?.();
  };

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <div className="flex items-end gap-2">
        <FileUploadButton
          onFileSelect={handleFileSelect}
          disabled={disabled || isUploading}
        />

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            disabled={disabled || isUploading}
            rows={1}
            className="w-full resize-none rounded-2xl bg-muted px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#2A388F]/20 max-h-32 disabled:opacity-50"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMessage.isPending || disabled || isUploading}
          className="p-2.5 rounded-full bg-[#2A388F] text-white hover:bg-[#1e2a6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <MaterialIcon
            name={isUploading ? "hourglass_empty" : "send"}
            className="text-lg"
          />
        </button>
      </div>
    </div>
  );
}
