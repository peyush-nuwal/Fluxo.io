"use client";

import { Image, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

type FileUploadProps = {
  name: string;
  accept?: string;
  initialPreview?: string | null;
};

export function FileUpload({
  name,
  accept = "image/*",
  initialPreview,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialPreview ?? null);

  useEffect(() => {
    setPreview(initialPreview ?? null);
  }, [initialPreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const removeImage = () => {
    setPreview(null);

    const input = document.getElementById(
      `fileInput-${name}`,
    ) as HTMLInputElement;

    if (input) input.value = "";
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative group">
          <label htmlFor={`fileInput-${name}`} className="cursor-pointer">
            <img
              src={preview}
              alt="Preview"
              className="h-36 w-full object-cover rounded-md border"
            />
          </label>

          {/* Remove button */}
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={`fileInput-${name}`}
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
        id={`fileInput-${name}`}
        name={name}
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
