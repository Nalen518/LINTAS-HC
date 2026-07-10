"use client";

import { useRef, useState } from "react";
import { IconCheck, IconFile, IconUpload } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// Figma: "New declaration — Upload" frame (69:383) → Slots (69:407).
// PRD §5.1 FR-1.x. Three required slots, drag-and-drop + Browse picker.
// States per slot: empty (dashed + Browse), filled (green check + filename
// chip + Replace file), drag-over (emerald emphasis), error (destructive
// dashed + inline message — no dedicated Figma frame, styled with tokens).

// API_CONTRACT §1: field names are the multipart keys — do not rename.
export type DocumentSlot =
  | "commercial_invoice"
  | "packing_list"
  | "bill_of_lading";

export type SlotFiles = Record<DocumentSlot, File | null>;

export const EMPTY_SLOT_FILES: SlotFiles = {
  commercial_invoice: null,
  packing_list: null,
  bill_of_lading: null,
};

const SLOTS: { key: DocumentSlot; label: string }[] = [
  { key: "commercial_invoice", label: "Commercial Invoice" },
  { key: "packing_list", label: "Packing List" },
  { key: "bill_of_lading", label: "Bill of Lading" },
];

// API_CONTRACT §1: .pdf / .png / .jpg / .jpeg, max 10 MB
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(",");

function validateFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) =>
    name.endsWith(ext),
  );
  if (!hasValidExtension) return "Couldn't read this file. Try a clearer scan";
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    return `File is larger than ${MAX_FILE_SIZE_MB} MB`;
  return null;
}

export function UploadZone({
  files,
  onFileChange,
}: {
  files: SlotFiles;
  onFileChange: (slot: DocumentSlot, file: File | null) => void;
}) {
  const [errors, setErrors] = useState<Partial<Record<DocumentSlot, string>>>(
    {},
  );
  const [dragOver, setDragOver] = useState<DocumentSlot | null>(null);
  const inputRefs = useRef<Partial<Record<DocumentSlot, HTMLInputElement>>>(
    {},
  );

  function acceptFile(slot: DocumentSlot, file: File) {
    const error = validateFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, [slot]: error }));
      onFileChange(slot, null);
      return;
    }
    setErrors((prev) => ({ ...prev, [slot]: undefined }));
    onFileChange(slot, file);
  }

  return (
    <div className="flex items-start gap-5">
      {SLOTS.map(({ key, label }) => {
        const file = files[key];
        const error = errors[key];
        const isDragOver = dragOver === key;

        return (
          <div
            key={key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(key);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) acceptFile(key, dropped);
            }}
            className={cn(
              "flex h-60 flex-1 flex-col items-center justify-center gap-3 rounded-lg bg-card px-6 py-7 transition-colors duration-150 ease-out-expo",
              file
                ? "border border-border"
                : error
                  ? "border-[1.5px] border-dashed border-destructive"
                  : isDragOver
                    ? "border-[1.5px] border-dashed border-border-emphasis bg-accent-subtle"
                    : "border-[1.5px] border-dashed border-border-strong",
            )}
          >
            <input
              ref={(el) => {
                if (el) inputRefs.current[key] = el;
              }}
              type="file"
              accept={ACCEPT_ATTR}
              className="hidden"
              aria-label={`Upload ${label}`}
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) acceptFile(key, picked);
                e.target.value = "";
              }}
            />

            {file ? (
              <>
                <IconCheck size={28} stroke={2} className="text-success" />
                <p className="text-sm font-medium text-foreground">{label}</p>
                <div className="flex items-center gap-2 rounded border border-border bg-elevated px-2.5 py-2">
                  <IconFile size={16} stroke={1.75} className="text-muted-foreground" />
                  <span className="max-w-44 truncate text-body-sm text-foreground">
                    {file.name}
                  </span>
                  <IconCheck size={16} stroke={2} className="text-success" />
                </div>
                <button
                  type="button"
                  onClick={() => inputRefs.current[key]?.click()}
                  className="text-body-sm text-link hover:underline"
                >
                  Replace file
                </button>
              </>
            ) : (
              <>
                <IconUpload
                  size={32}
                  stroke={2}
                  className={error ? "text-destructive" : "text-faint"}
                />
                <p className="text-sm font-medium text-foreground">{label}</p>
                {error ? (
                  <p className="text-xs text-destructive">{error}</p>
                ) : (
                  <p className="text-xs text-faint">PDF, PNG, JPG</p>
                )}
                <button
                  type="button"
                  onClick={() => inputRefs.current[key]?.click()}
                  className="rounded border border-border px-3.5 py-1.5 text-body-sm text-foreground transition-colors duration-150 ease-out-expo hover:border-border-strong"
                >
                  Browse
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
