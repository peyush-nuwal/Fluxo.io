"use client";

import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Image as ImageIcon, X } from "lucide-react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadUserAvatar } from "@/lib/auth";
import { toast } from "sonner";

type ImageUploadProps = {
  userName: string;
  userAvatar?: string;
  isEditMode: boolean;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = url;
  });
}

async function getCroppedImageDataUrl(
  imageSrc: string,
  crop: Area,
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not initialize image canvas");
  }

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

const ImageUploadInput = ({
  userName,
  userAvatar,
  isEditMode,
}: ImageUploadProps) => {
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(
    userAvatar ?? null,
  );
  const [isChangePhoto, setIsChangePhoto] = useState<boolean>(false);

  useEffect(() => {
    setPreviewAvatar(userAvatar ?? null);
  }, [userAvatar]);

  const userInitial = useMemo(() => {
    const firstChar = userName?.trim()?.[0];
    return firstChar ? firstChar.toUpperCase() : "U";
  }, [userName]);

  const onClickUploadAvatar = async (avatar: string) => {
    const avatarBlob = await dataUrlToBlob(avatar);
    const avatarFile = new File([avatarBlob], "avatar.jpg", {
      type: avatarBlob.type || "image/jpeg",
    });

    const formData = new FormData();
    formData.append("avatar", avatarFile);
    setPreviewAvatar(avatar);
    const res = await uploadUserAvatar(formData);
    console.log(res);
  };
  return (
    <div className=" space-y-4">
      {previewAvatar ? (
        <div className="size-30 overflow-hidden rounded-full border border-border">
          <img
            src={previewAvatar}
            alt={`${userName?.trim()?.[0]} `}
            className="h-full w-full object-cover flex items-center justify-center"
          />
        </div>
      ) : (
        <div className="flex size-30 items-center justify-center rounded-full border border-border bg-muted text-2xl font-semibold text-muted-foreground">
          {userInitial}
        </div>
      )}

      {isEditMode && (
        <Button
          onClick={() => setIsChangePhoto(true)}
          size="default"
          className="mt-1"
        >
          Change Photo
        </Button>
      )}

      <EditImageDialog
        open={isChangePhoto}
        setOpen={setIsChangePhoto}
        initialImage={previewAvatar}
        onSave={(croppedImage) => onClickUploadAvatar(croppedImage)}
      />
    </div>
  );
};

export default ImageUploadInput;

const EditImageDialog = ({
  open,
  setOpen,
  initialImage,
  onSave,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  initialImage: string | null;
  onSave: (image: string) => void;
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setImageSrc(initialImage);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [open, initialImage]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const onCropComplete = (_croppedArea: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setImageSrc(nextUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsSaving(true);
    try {
      const croppedImage = await getCroppedImageDataUrl(
        imageSrc,
        croppedAreaPixels,
      );
      onSave(croppedImage);
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const clearSelectedImage = () => {
    if (objectUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-160">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Change photo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!imageSrc && (
            <label
              htmlFor="avatar-image-upload"
              className="h-36 w-full cursor-pointer rounded-md border border-dashed border-border bg-input/30 transition hover:bg-muted/40 flex flex-col items-center justify-center gap-2"
            >
              <ImageIcon className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">
                Click here to upload Profile Pic.
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP - Max size 2MB
              </p>
            </label>
          )}

          <input
            id="avatar-image-upload"
            type="file"
            accept="image/*"
            onChange={handleSelectFile}
            className="hidden"
          />

          {imageSrc && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Adjust your crop
                </p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="avatar-image-upload"
                    className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted/40 transition"
                  >
                    Change image
                  </label>
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="rounded-full bg-black/70 p-1 text-white hover:bg-black/80 transition"
                    aria-label="Remove selected image"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="relative h-72 w-full overflow-hidden rounded-lg border bg-muted/40">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  objectFit="horizontal-cover"
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="avatarZoomRange"
                >
                  Zoom
                </label>
                <input
                  id="avatarZoomRange"
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number.parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-6 flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!imageSrc || !croppedAreaPixels || isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
