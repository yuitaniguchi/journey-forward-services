"use client";

import React, { useState } from "react";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";

interface Item {
  id: string;
  name: string;
  image?: string; // object URL
}

interface ItemListProps {
  /** Current list of items */
  items: Item[];
  /** Callback when the list changes */
  onChange: (items: Item[]) => void;
}

export default function ItemList({ items, onChange }: ItemListProps) {
  const [newItemName, setNewItemName] = useState("");

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

  const handleImageUpload = (id: string, file: File | null) => {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);

    onChange(
      items.map((item) =>
        item.id === id ? { ...item, image: imageUrl } : item
      )
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-[#22503B]">Items</h3>

      {/* Add item section */}
      <div className="flex items-center gap-3">
        <Input
          label="Item name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="e.g., Sofa, Bed Frame"
        />
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
