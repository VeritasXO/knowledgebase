import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useDepartmentImageDelete,
  useDepartmentImageUpload,
} from "@/hooks/use-department-image-upload";
import { ImageIcon, Trash2Icon, UploadIcon } from "lucide-react";
import React, { useState } from "react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (imageUrl: string | null) => void;
}

export function DepartmentImageUpload({ value, onChange }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

  const upload = useDepartmentImageUpload();
  const deleteImage = useDepartmentImageDelete();

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Create local preview
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    try {
      // Upload the file
      const result = await upload.mutateAsync(file);

      // Pass the URL to parent component
      onChange(result.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      // Revert to previous image on error
      setPreviewUrl(value || null);
    }
  };

  const handleDeleteImage = async () => {
    if (!value) return;

    // Extract filename from the URL
    const filename = value.split("/").pop();
    if (!filename) return;

    try {
      await deleteImage.mutateAsync(filename);
      setPreviewUrl(null);
      onChange(null);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative">
          <div className="border rounded-md overflow-hidden bg-muted flex justify-center items-center h-40">
            {value && value.endsWith(".svg") ? (
              <img
                src={previewUrl}
                alt="Department icon"
                className="max-h-32 max-w-32 object-contain"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Department icon"
                className="max-h-40 max-w-full object-contain"
              />
            )}
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleDeleteImage}
            disabled={deleteImage.isPending}
          >
            {deleteImage.isPending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Trash2Icon className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center h-40 ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/20"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          {upload.isPending ? (
            <Spinner className="h-8 w-8 text-muted-foreground/50" />
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag & drop an image here, or click to select
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex items-center"
                asChild
              >
                <label>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Image
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    disabled={upload.isPending}
                  />
                </label>
              </Button>
            </>
          )}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, GIF, SVG, WEBP, AVIF
      </p>
    </div>
  );
}
