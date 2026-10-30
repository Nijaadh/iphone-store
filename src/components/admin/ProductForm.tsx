"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Condition, FormState, Product } from "@/lib/types";

const MODELS = [
  "iPhone 8", "iPhone 8 Plus", "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max", "iPhone SE (2nd gen)", "iPhone SE (3rd gen)",
  "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16e", "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone 17", "iPhone Air", "iPhone 17 Pro", "iPhone 17 Pro Max",
];
const STORAGES = [64, 128, 256, 512, 1024];
const BUCKET = "phone-images";
const MAX_PHOTOS = 10;

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900";
const labelClass = "mb-1 block text-sm font-medium";

// Shrinks big camera photos to max 1600px JPEG so uploads are fast and the shop loads quickly.
async function resizeToJpeg(file: File, maxSize = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not process image"))),
      "image/jpeg",
      0.85
    )
  );
}

export default function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  product?: Product;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const [condition, setCondition] = useState<Condition>(
    product?.condition ?? "used"
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const room = MAX_PHOTOS - images.length;
    if (room <= 0) {
      setUploadError(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, room)) {
        const blob = await resizeToJpeg(file);
        const path = `${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, blob, {
            contentType: "image/jpeg",
            cacheControl: "31536000",
          });
        if (error) throw new Error(error.message);
        uploaded.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
      }
    } catch (e) {
      setUploadError(
        e instanceof Error
          ? `Upload failed: ${e.message}. Use JPG, PNG or WebP photos.`
          : "Upload failed."
      );
    } finally {
      if (uploaded.length) setImages((prev) => [...prev, ...uploaded]);
      setUploading(false);
    }
  }

  const makeMain = (url: string) =>
    setImages((prev) => [url, ...prev.filter((u) => u !== url)]);
  const removeImage = (url: string) =>
    setImages((prev) => prev.filter((u) => u !== url));

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5"
    >
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className={labelClass}>Title</label>
          <input
            id="title"
            name="title"
            required
            defaultValue={product?.title}
            placeholder="iPhone 13 Pro 256GB Sierra Blue"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="model" className={labelClass}>Model</label>
          <input
            id="model"
            name="model"
            list="iphone-models"
            required
            defaultValue={product?.model}
            placeholder="iPhone 13 Pro"
            className={inputClass}
          />
          <datalist id="iphone-models">
            {MODELS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="storage_gb" className={labelClass}>Storage</label>
          <select
            id="storage_gb"
            name="storage_gb"
            required
            defaultValue={product?.storage_gb ?? 128}
            className={inputClass}
          >
            {STORAGES.map((s) => (
              <option key={s} value={s}>
                {s >= 1024 ? "1TB" : `${s}GB`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="color" className={labelClass}>Color</label>
          <input
            id="color"
            name="color"
            defaultValue={product?.color ?? ""}
            placeholder="Sierra Blue"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="price_lkr" className={labelClass}>Price (LKR)</label>
          <input
            id="price_lkr"
            name="price_lkr"
            type="number"
            min={0}
            step="1"
            required
            defaultValue={product?.price_lkr}
            placeholder="245000"
            className={inputClass}
          />
        </div>

        <div>
          <span className={labelClass}>Condition</span>
          <div className="flex gap-4 pt-2 text-sm">
            {(["used", "new"] as const).map((c) => (
              <label key={c} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="condition"
                  value={c}
                  checked={condition === c}
                  onChange={() => setCondition(c)}
                />
                {c === "new" ? "Brand new" : "Used"}
              </label>
            ))}
          </div>
        </div>

        {condition === "used" && (
          <div>
            <label htmlFor="battery_health" className={labelClass}>
              Battery health (%)
            </label>
            <input
              id="battery_health"
              name="battery_health"
              type="number"
              min={1}
              max={100}
              defaultValue={product?.battery_health ?? ""}
              placeholder="87"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="imei" className={labelClass}>IMEI (optional)</label>
          <input
            id="imei"
            name="imei"
            defaultValue={product?.imei ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>Status</label>
          <select
            id="status"
            name="status"
            defaultValue={product?.status ?? "available"}
            className={inputClass}
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product?.description ?? ""}
            placeholder="Condition details, accessories in the box, warranty..."
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>
          Photos ({images.length}/{MAX_PHOTOS})
        </span>
        <p className="mb-2 text-xs text-neutral-500">
          The first photo is the main one. JPG, PNG or WebP.
        </p>

        {images.length > 0 && (
          <ul className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((url, i) => (
              <li key={url} className="space-y-1">
                <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  {i === 0 ? (
                    <span className="font-medium text-green-700">Main</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makeMain(url)}
                      className="text-neutral-600 underline"
                    >
                      Make main
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="text-red-600 underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading || images.length >= MAX_PHOTOS}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:text-white"
        />
        {uploading && (
          <p className="mt-2 text-sm text-neutral-500">Uploading photos...</p>
        )}
        {uploadError && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {uploadError}
          </p>
        )}
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href="/admin" className="text-sm text-neutral-600 underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
