"use client";

import React, { useState } from "react";
import {
  Plus,
  X,
  CloudUpload,
  Pencil,
  Loader2,
  Minus,
  Trash2,
} from "lucide-react";
import ItemPickerModal, { SIZE_OPTIONS } from "./ItemPickerModal";

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

  const handleUpdateQuantity = (id: string, delta: number) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      })
    );
  };

  const handleUpdateSize = (id: string, newSize: string) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, size: newSize } : item))
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 auto-rows-fr">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex h-full flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-brand/30"
          >
            <div className="mb-4 w-full">
              {item.image ? (
                <div className="relative h-32 w-full">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full rounded-md object-cover border border-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(item)}
                    className="absolute -right-2 -top-2 rounded-full border border-slate-200 bg-white p-1 text-slate-500 shadow hover:text-red-600"
                    title="Delete Image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
                  {loadingIds.includes(item.id) ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <CloudUpload className="mb-1 h-6 w-6" />
                  )}
                  <span className="text-xs font-medium">
                    {loadingIds.includes(item.id)
                      ? "Uploading..."
                      : "Add Photo"}
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
              )}
            </div>

            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">{item.name}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between gap-3 mt-auto">
              <div className="flex-1">
                <select
                  value={item.size}
                  onChange={(e) => handleUpdateSize(item.id, e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#2f7d4a]"
                >
                  {SIZE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center rounded-md border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => handleUpdateQuantity(item.id, -1)}
                  disabled={item.quantity <= 1}
                  className="flex h-7 w-8 items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#2f7d4a] disabled:opacity-30"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateQuantity(item.id, 1)}
                  className="flex h-7 w-8 items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#2f7d4a]"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
              <Pencil className="h-3 w-3 text-slate-400" />
              <input
                type="text"
                placeholder="Add a description..."
                value={item.description || ""}
                onChange={(e) =>
                  handleUpdateDescription(item.id, e.target.value)
                }
                className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-[300px] h-full flex-col items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:border-[#2f7d4a] hover:bg-slate-50"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#2f7d4a] text-[#2f7d4a]">
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
