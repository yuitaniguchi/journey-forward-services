"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import ItemPickerModal from "./ItemPickerModal";

export type ItemSize = "small" | "medium" | "large";

export type Item = {
  id: string;
  category: string;
  name: string;
  size: ItemSize | string;
  quantity: number;
  // 画像アップロードに備えておきたいなら:
  // imageFile?: File;
};

type Props = {
  items: Item[];
  onChange: (items: Item[]) => void;
};

export default function ItemList({ items, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const handleRemove = (id: string) => {
    onChange(items.filter((it) => it.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Add New Item カード */}
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

      {/* 追加済みアイテム一覧 */}
      {items.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {item.name} ({item.size})
                </p>
                <p className="text-xs text-slate-500">
                  {item.category} ・ Qty {item.quantity}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* モーダル */}
      <ItemPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onAdd={(newItems) => {
          if (newItems.length === 0) return;
          onChange([...items, ...newItems]);
          setOpen(false);
        }}
      />
    </div>
  );
}
