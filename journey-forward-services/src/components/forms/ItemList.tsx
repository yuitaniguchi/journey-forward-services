"use client";

import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface Item {
  id: string;
  name: string;
  image?: string; // object URL
  public_id?: string;
}

interface ItemListProps {
  /** Current list of items */
  items: Item[];
  /** Callback when the list changes */
  onChange: (items: Item[]) => void;
}

export default function ItemList({ items, onChange }: ItemListProps) {
  const [newItemName, setNewItemName] = useState("");
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem: Item = {
      id: crypto.randomUUID(),
      name: newItemName,
      image: undefined,
    };

    onChange([...items, newItem]);
    setNewItemName("");
  };

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleImageUpload = async (id: string, file: File | null) => {
    if (!file) {
      console.warn("No file selected for upload");
      return;
    }
  
    setLoadingIds((prev) => [...prev, id]);
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
  
      console.log("Upload response status:", res.status);
      const data = await res.json();
      console.log("Upload response data:", data);
  
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

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-[#22503B]">Items</h3>

      {/* Add item section */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label
            htmlFor="item-name"
            className="block text-sm font-medium text-[#22503B]"
          >
            Item name
          </label>
          <Input
            id="item-name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="e.g., Sofa, Bed Frame"
          />
        </div>
        <Button type="button" onClick={handleAddItem}>
          Add
        </Button>
      </div>

      {/* Items list */}
      <div className="space-y-4">
        {items.length === 0 && (
          <p className="text-[#367D5E]">No items added yet.</p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 border border-[#BFEEEE] rounded-lg flex justify-between items-center bg-white shadow-sm"
          >
            <div>
              <p className="font-medium text-[#22503B]">{item.name}</p>
              {item.image && (
                <img
                  src={item.image}
                  alt="Item"
                  className="mt-2 w-24 h-24 object-cover rounded-md border"
                />
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageUpload(item.id, e.target.files?.[0] || null)
                }
                className="text-sm"
              />
              {loadingIds.includes(item.id) && (
                <span className="text-sm text-[#367D5E]">Uploading...</span>
              )}

              {item.image && (
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      if (item.public_id) {
                        await fetch("/api/upload", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ public_id: item.public_id }),
                        });
                      }

                      onChange(
                        items.map((it) =>
                          it.id === item.id
                            ? { ...it, image: undefined, public_id: undefined }
                            : it
                        )
                      );
                    } catch (err) {
                      console.error("Delete image error:", err);
                    }
                  }}
                >
                  Delete Image
                </Button>
              )}

              <Button type="button" onClick={() => handleRemoveItem(item.id)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
