"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024;

export function ProfilePhotoUpload({ hasPhoto }: { hasPhoto: boolean }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WEBP photo");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Photo must be smaller than 5MB");
      return;
    }
    setUploading(true);
    try {
      const blob = await upload(`profile/photo-${Date.now()}-${file.name}`, file, {
        access: "private",
        handleUploadUrl: "/api/upload",
      });
      const res = await fetch("/api/users/me/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: blob.url }),
      });
      if (!res.ok) throw new Error("save failed");
      toast.success("Profile photo updated");
      router.refresh();
    } catch {
      toast.error("Could not upload your photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="cursor-pointer inline-block">
      <div className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100">
        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
        {uploading ? "Uploading..." : hasPhoto ? "Change profile photo" : "Add profile photo"}
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </label>
  );
}
