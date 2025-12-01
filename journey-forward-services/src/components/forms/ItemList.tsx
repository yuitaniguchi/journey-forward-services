"use client";

import React, { useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Loader2, X } from "lucide-react";
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
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-56 w-64 items-center justify-center rounded-xl border border-slate-300 bg-[#fbfdfc] text-[#22503B] shadow-sm transition hover:border-[#2f7d4a] hover:bg-[#f2faf5]"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2f7d4a]">
            <Plus className="h-4 w-4 text-[#2f7d4a]" />
          </div>
          <span className="text-sm font-semibold">Add New Item</span>
        </div>
      </button>

      {items.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {item.name} <span className="text-slate-500">({item.size})</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.category} ・ Qty {item.quantity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 border-t border-slate-100 pt-3">
                {item.image ? (
                  <div className="relative inline-block">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 rounded-md object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(item)}
                      className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-slate-500 shadow hover:text-red-600 border border-slate-200"
                      title="Delete Image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-2 text-slate-600 hover:bg-slate-50 transition">
                      {loadingIds.includes(item.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                      <span className="text-xs">Add Photo</span>
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
            </div>
          ))}
        </div>
      )}

      <ItemPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onAdd={(newItems) => {
          if (newItems.length === 0) return;
          const itemsWithImageField = newItems.map(item => ({
            ...item,
            image: undefined,
            public_id: undefined
          }));
          onChange([...items, ...itemsWithImageField]);
          setOpen(false);
        }}
      />
    </div>
  );
}