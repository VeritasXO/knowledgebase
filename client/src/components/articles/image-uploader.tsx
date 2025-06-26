import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { ImageIcon, Loader2Icon } from "lucide-react";
import { useRef, useState } from "react";

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
}

export function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Images must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPG, PNG, GIF and WebP images are allowed",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("/api/admin/uploads/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Call the callback with the image URL
      onImageUploaded(response.data.url);

      toast({
        title: "Image uploaded",
        description: "Image successfully uploaded and inserted",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image",
        variant: "destructive",
      });
      console.error("Image upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isUploading}
        title="Upload image"
      >
        {isUploading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/gif, image/webp"
        className="hidden"
      />
    </>
  );
}
