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

  const [editingDescItem, setEditingDescItem] = useState<{
    id: string;
    text: string;
  } | null>(null);

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

  const handleSaveDescription = () => {
    if (editingDescItem) {
      handleUpdateDescription(editingDescItem.id, editingDescItem.text);
      setEditingDescItem(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 auto-rows-fr">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex w-full flex-row gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-brand/30 md:flex-col md:p-4"
          >
            {/* --- LEFT SIDE (Mobile) / TOP SIDE (Desktop): Image --- */}
            <div className="w-28 flex-shrink-0 md:mb-4 md:w-full">
              {item.image ? (
                <div className="relative h-28 w-full md:h-32">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full rounded-md border border-slate-100 object-cover"
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
                <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 md:h-32">
                  {loadingIds.includes(item.id) ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <CloudUpload className="mb-1 h-6 w-6" />
                  )}
                  <span className="text-[10px] font-medium md:text-xs">
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

            {/* --- RIGHT SIDE (Mobile) / BOTTOM SIDE (Desktop): Info --- */}
            <div className="flex flex-1 flex-col justify-between overflow-hidden">
              {/* Row 1: Name & Delete */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="line-clamp-1 font-bold text-slate-900 md:line-clamp-none">
                    {item.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="ml-2 text-slate-400 transition-colors hover:text-red-500"
                  title="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Row 2: Controls (Size & Quantity) */}
              <div className="my-2 flex flex-col gap-2 sm:flex-row sm:items-center md:my-3 md:gap-3">
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

                <div className="flex items-center self-start rounded-md border border-slate-200 bg-white sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, -1)}
                    disabled={item.quantity <= 1}
                    className="flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#2f7d4a] disabled:opacity-30 md:w-8"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-900 md:w-8">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, 1)}
                    className="flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#2f7d4a] md:w-8"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Row 3: Description */}
              <div className="pt-1">
                {item.description ? (
                  <div className="group flex w-full items-start justify-between gap-2 text-left">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingDescItem({
                          id: item.id,
                          text: item.description || "",
                        })
                      }
                      className="flex flex-1 items-start gap-2 overflow-hidden"
                    >
                      <Pencil className="mt-0.5 h-3 w-3 flex-shrink-0 text-[#3F7253]" />
                      <span className="line-clamp-2 break-all text-xs text-slate-700 group-hover:text-slate-900 group-hover:underline">
                        {item.description}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateDescription(item.id, "")}
                      className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-red-500"
                      title="Clear description"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingDescItem({ id: item.id, text: "" })
                    }
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600"
                  >
                    <Pencil
                      className="h-3 w-3 flex-shrink-0"
                      fill="currentColor"
                    />
                    <span className="whitespace-nowrap text-xs font-medium md:text-sm">
                      Add a description
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Item Button */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-full min-h-[140px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:border-[#2f7d4a] hover:bg-slate-50 md:min-h-[300px]"
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

      {editingDescItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-center text-lg font-bold text-slate-900">
              Add Description
            </h3>

            <textarea
              value={editingDescItem.text}
              onChange={(e) =>
                setEditingDescItem({
                  ...editingDescItem,
                  text: e.target.value,
                })
              }
              className="mb-6 h-32 w-full resize-none rounded-md border border-slate-300 p-3 text-sm focus:border-[#2f7d4a] focus:ring-1 focus:ring-[#2f7d4a] focus:outline-none"
              placeholder=""
            />

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setEditingDescItem(null)}
                className="flex-1 rounded-md border border-[#3F7253] bg-white py-2.5 text-sm font-semibold text-[#3F7253] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDescription}
                className="flex-1 rounded-md bg-[#3F7253] py-2.5 text-sm font-semibold text-white hover:bg-[#2d523b]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
