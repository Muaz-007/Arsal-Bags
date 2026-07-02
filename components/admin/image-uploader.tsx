"use client";

import { useState } from "react";
import Image from "next/image";
import { GripVertical, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * Admin image uploader — writes uploaded URLs into a hidden `<input name="images">`
 * (newline-separated) so it plugs into the existing ProductForm submit path
 * without changing the API contract.
 *
 * Users can still paste external URLs (Unsplash placeholders, existing
 * Cloudinary assets) alongside newly uploaded ones.
 */
export function ImageUploader({
  name,
  initialUrls,
}: {
  name: string;
  initialUrls?: string[];
}) {
  const push = useToast((s) => s.push);
  const [urls, setUrls] = useState<string[]>(initialUrls ?? []);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of list) {
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
    if (uploaded.length > 0) setUrls((u) => [...u, ...uploaded]);
    setUploading(false);
  }

  function remove(url: string) {
    setUrls((u) => u.filter((x) => x !== url));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= urls.length) return;
    setUrls((u) => {
      const next = [...u];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function addPastedUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setUrls((u) => [...u, trimmed]);
    setUrlInput("");
  }

  return (
    <div className="space-y-4">
      {/* Serialized value that hits our POST/PATCH endpoint */}
      <input type="hidden" name={name} value={urls.join("\n")} />

      {/* Drop zone / picker */}
      <label
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition",
          dragOver
            ? "border-gold bg-gold/5"
            : "border-border hover:border-foreground/30 bg-muted/20"
        )}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-5 w-5 text-muted-foreground" />
        )}
        <p className="text-sm font-medium">
          {uploading ? "Uploading…" : "Drop images here or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP, AVIF · up to 10MB each
        </p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </label>

      {/* Paste-a-URL escape hatch — for existing Unsplash / hosted assets */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste an image URL"
          className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPastedUrl();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPastedUrl}
          disabled={!urlInput.trim()}
        >
          Add URL
        </Button>
      </div>

      {/* Existing thumbnails */}
      {urls.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {urls.length} image{urls.length === 1 ? "" : "s"} · first one is the
            cover
          </p>
          <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {urls.map((url, i) => (
              <li
                key={`${url}-${i}`}
                className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                  unoptimized
                />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-gold px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-black">
                    Cover
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-between p-1.5 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      aria-label="Move left"
                      onClick={() => move(i, i - 1)}
                      className="h-6 w-6 grid place-items-center rounded bg-background/90 text-foreground hover:bg-background disabled:opacity-40"
                      disabled={i === 0}
                    >
                      <GripVertical className="h-3 w-3 -rotate-90" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move right"
                      onClick={() => move(i, i + 1)}
                      className="h-6 w-6 grid place-items-center rounded bg-background/90 text-foreground hover:bg-background disabled:opacity-40"
                      disabled={i === urls.length - 1}
                    >
                      <GripVertical className="h-3 w-3 rotate-90" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => remove(url)}
                    className="h-6 w-6 grid place-items-center rounded bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
