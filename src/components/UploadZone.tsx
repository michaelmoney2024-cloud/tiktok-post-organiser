"use client";

import { useCallback, useRef, useState } from "react";
import type { MediaPreview, UploadMediaType } from "@/lib/types";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

interface UploadZoneProps {
  media: MediaPreview | null;
  onMediaSelect: (media: MediaPreview) => void;
  onClear: () => void;
  disabled?: boolean;
}

function getMediaType(file: File): UploadMediaType | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

export function UploadZone({ media, onMediaSelect, onClear, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert("Please upload an image (JPG, PNG, WebP, GIF) or video (MP4, WebM, MOV).");
        return;
      }

      const type = getMediaType(file);
      if (!type) return;

      const previewUrl = URL.createObjectURL(file);
      onMediaSelect({ file, type, previewUrl });
    },
    [onMediaSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [disabled, processFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  if (media) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {media.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.previewUrl}
            alt="Upload preview"
            className="max-h-72 w-full object-contain sm:max-h-80"
          />
        ) : (
          <video
            src={media.previewUrl}
            controls
            className="max-h-72 w-full object-contain sm:max-h-80"
          />
        )}
        {!disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm transition hover:bg-black/80"
            aria-label="Remove media"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium capitalize text-white backdrop-blur-sm">
          {media.type}
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 transition-all sm:min-h-[260px] ${
        isDragging
          ? "border-[#fe2c55] bg-[#fe2c55]/10 scale-[1.01]"
          : "border-white/20 bg-white/5 hover:border-[#25f4ee]/50 hover:bg-white/[0.07]"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload image or video"
      />

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fe2c55] to-[#25f4ee] shadow-lg shadow-[#fe2c55]/20 transition group-hover:scale-105">
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-base font-semibold text-white">
          {isDragging ? "Drop it here!" : "Drag & drop your media"}
        </p>
        <p className="mt-1 text-sm text-white/50">
          or tap to browse · JPG, PNG, WebP, MP4, WebM
        </p>
      </div>
    </div>
  );
}
