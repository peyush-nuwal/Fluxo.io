"use client";
import { Image } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

type FileUploadProps = {
  name: string;
  accept?: string;
};

export function FileUpload({ name, accept = "image/*" }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="h-36 w-full object-cover rounded-md border"
        />
      ) : (
        <label
          htmlFor="fileInput"
          className="h-36 w-full flex flex-col items-center justify-center gap-2 bg-input/30 rounded-md border border-dashed border-border cursor-pointer hover:bg-muted/40 transition"
        >
          <Image className="size-6 text-muted-foreground" />

          <p className="text-sm font-medium">Click to upload thumbnail</p>

          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP • Max size 2MB
          </p>
        </label>
      )}

      <Input
        type="file"
        id="fileInput"
        name={name}
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
