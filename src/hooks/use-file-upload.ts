"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export function useFileUpload() {
  const supabase = createClient();
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (
    file: File,
    bucket: string,
    folder: string
  ): Promise<UploadResult> => {
    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const uniqueName = `${folder}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(uniqueName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uniqueName);

      return {
        url: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
}
