"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 3;

/**
 * Compact photo picker for customer reviews. Deliberately smaller than the
 * admin uploader — 3 photos max, no reorder, and thumbnails are square so
 * layout stays predictable inside the review card sidebar.
 */
export function ReviewPhotoPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const push = useToast((s) => s.push);
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    const remaining = MAX_PHOTOS - value.length;
    if (remaining <= 0) {
      push({ title: `Up to ${MAX_PHOTOS} photos`, tone: "info" });
      return;
    }
    const toUpload = list.slice(0, remaining);
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of toUpload) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload/review", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          push({
            title: "Couldn't upload",
            description: data?.error ?? file.name,
            tone: "error",
          });
          continue;
        }
        uploaded.push(data.url);
      } catch {
        push({
          title: "Couldn't upload",
          description: file.name,
          tone: "error",
        });
      }
    }
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
    setUploading(false);
  }

  function remove(url: string) {
    onChange(value.filter((x) => x !== url));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div
            key={url}
            className="relative h-16 w-16 rounded-md overflow-hidden border border-border bg-muted group"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label="Remove photo"
              className="absolute inset-0 grid place-items-center bg-black/60 opacity-0 group-hover:opacity-100 transition"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}

        {value.length < MAX_PHOTOS && (
          <label
            className={cn(
              "h-16 w-16 rounded-md border border-dashed border-border cursor-pointer grid place-items-center text-muted-foreground hover:border-foreground/30 hover:text-foreground transition",
              uploading && "opacity-70 pointer-events-none"
            )}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) uploadFiles(e.target.files);
                e.currentTarget.value = "";
              }}
            />
          </label>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Up to {MAX_PHOTOS} photos · JPEG, PNG, WebP · max 5MB each
      </p>
    </div>
  );
}
