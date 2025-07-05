"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { uploadProfilePicture } from "@/lib/actions/profile-actions";

interface ProfileUploadProps {
  onUploadSuccess?: () => void;
  children: React.ReactNode;
}

export function ProfileUpload({
  onUploadSuccess,
  children,
}: ProfileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      await uploadProfilePicture(formData);
      toast.success("Foto de perfil actualizada correctamente");
      onUploadSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al subir la imagen";
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative group" onClick={handleClick}>
      {children}

      {/* Overlay with camera icon */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
        <Camera className="h-6 w-6 text-white" />
      </div>

      {/* Loading overlay */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
