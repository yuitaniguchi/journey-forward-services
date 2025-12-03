"use client";

import React, { useState } from "react";
import { Plus, X, CloudUpload, Pencil, Loader2 } from "lucide-react";
import ItemPickerModal from "./ItemPickerModal";

export type ItemSize = "small" | "medium" | "large";

export interface Item {
  id: string;
  category: string;
  name: string;
  size: ItemSize | string;
  quantity: number;
  image?: string;
  public_id?: string;
  description?: string;
}

interface ItemListProps {
  items: Item[];
  onChange: (items: Item[]) => void;
}

export default function ItemList({ items, onChange }: ItemListProps) {
  const [open, setOpen] = useState(false);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleUpdateDescription = (id: string, description: string) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, description } : item))
    );
  };

  const handleImageUpload = async (id: string, file: File | null) => {
    if (!file) return;

    setLoadingIds((prev) => [...prev, id]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(`Upload failed: ${data.error || "Unknown error"}`);
      }

      onChange(
        items.map((item) =>
          item.id === id
            ? { ...item, image: data.url, public_id: data.public_id }
            : item
        )
      );
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Failed to upload image:\n${err.message}`);
    } finally {
      setLoadingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const handleDeleteImage = async (item: Item) => {
    if (!item.public_id) return;

    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: item.public_id }),
      });

      onChange(
        items.map((it) =>
          it.id === item.id
            ? { ...it, image: undefined, public_id: undefined }
            : it
        )
      );
    } catch (err) {
      console.error("Delete image error:", err);
      alert("Failed to delete image.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            {/* 写真アップロードエリア */}
            <div className="mb-4">
              {item.image ? (
                <div className="relative h-32 w-full">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full rounded-md object-cover border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(item)}
                    className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-slate-500 shadow hover:text-red-600 border border-slate-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="relative h-32 w-full">
                  <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
                    {loadingIds.includes(item.id) ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <CloudUpload className="mb-1 h-6 w-6" />
                    )}
                    <span className="text-xs font-medium">
                      {loadingIds.includes(item.id)
                        ? "Uploading..."
                        : "Add photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={loadingIds.includes(item.id)}
                      onChange={(e) =>
                        handleImageUpload(item.id, e.target.files?.[0] || null)
                      }
                    />
                  </label>
                </div>
              )}
            </div>

            {/* アイテム情報 */}
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="text-xs font-semibold text-slate-500">
                      x{item.quantity}
                    </span>
                  )}
                </div>
                <span className="inline-block rounded-full border border-brand/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-dark">
                  {item.size}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-slate-400">
                <button
                  type="button"
                  className="underline decoration-slate-300 underline-offset-2 hover:text-brand"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="underline decoration-slate-300 underline-offset-2 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* 説明文入力 */}
            <div className="mt-4 flex items-center gap-2 border-b border-slate-200 pb-1">
              <Pencil className="h-3 w-3 text-slate-400" />
              <input
                type="text"
                placeholder="Add a description"
                value={item.description || ""}
                onChange={(e) =>
                  handleUpdateDescription(item.id, e.target.value)
                }
                className="w-full text-xs text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>
        ))}

        {/* 追加ボタン */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-50"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-brand text-brand">
            <Plus className="h-5 w-5" />
          </div>
          <span className="font-medium text-slate-700">Add New Item</span>
        </button>
      </div>

      <ItemPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onAdd={(newItems) => {
          if (newItems.length === 0) return;
          // ItemPickerModalからのデータには image/description がないので初期化して追加
          const formattedItems = newItems.map((item) => ({
            ...item,
            image: undefined,
            public_id: undefined,
            description: "",
          }));
          onChange([...items, ...formattedItems]);
          setOpen(false);
        }}
      />
    </>
  );
}
