"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * Single-image picker for the storefront section editor.
 *
 * Replaces the earlier plain "Image URL" text input with an actual
 * file uploader — admins pick a file from disk, we push it to
 * Cloudinary via `/api/admin/upload`, and the returned CDN URL lands in
 * the section item's `image` field. A small "paste a URL" escape hatch
 * remains for the rare case where the admin already has a hosted image
 * (e.g. a Cloudinary URL they generated elsewhere) — matches the pattern
 * the product image uploader uses.
 */
export function SectionImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const push = useToast((s) => s.push);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        push({
          title: "Couldn't upload",
          description: data?.error ?? "Please try again.",
          tone: "error",
        });
        return;
      }
      onChange(data.url);
      push({ title: "Image uploaded", tone: "success" });
    } catch {
      push({ title: "Upload failed", tone: "error" });
    } finally {
      setUploading(false);
    }
  }

  function commitUrlPaste() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setUrlInput("");
    setShowUrlInput(false);
  }

  return (
    <div className="space-y-2">
      {/* Preview + remove button when an image is already set */}
      {value ? (
        <div className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted">
          <Image
            src={value}
            alt=""
            fill
            sizes="240px"
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            aria-label="Remove image"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-background/90 text-foreground hover:bg-background border border-border transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Drop zone / picker when there's no image yet */
        <label
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-lg p-6 cursor-pointer transition",
            uploading
              ? "border-gold/60 bg-gold/5"
              : "border-border hover:border-foreground/30 bg-muted/20"
          )}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
          )}
          <p className="text-xs font-medium">
            {uploading ? "Uploading…" : "Click to upload image"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            JPEG, PNG, WebP · up to 10MB
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
              e.currentTarget.value = "";
            }}
            disabled={uploading}
          />
        </label>
      )}

      {/* Escape hatch: paste an external URL (existing Cloudinary asset, etc.) */}
      {showUrlInput ? (
        <div className="flex gap-1.5">
          <Input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://res.cloudinary.com/…"
            className="h-8 text-xs flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitUrlPaste();
              }
            }}
          />
          <button
            type="button"
            onClick={commitUrlPaste}
            className="text-[11px] px-2 rounded-md border border-border hover:bg-muted"
          >
            Use
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUrlInput(false);
              setUrlInput("");
            }}
            aria-label="Cancel"
            className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowUrlInput(true)}
          className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <Upload className="h-3 w-3" />
          Or paste a URL
        </button>
      )}
    </div>
  );
}
