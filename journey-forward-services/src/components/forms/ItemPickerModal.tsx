"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Plus, Minus } from "lucide-react";

export type Item = {
  id: string;
  category: string;
  name: string;
  size: "small" | "medium" | "large";
  quantity: number;
};

const CATEGORY_ICONS: Record<string, string> = {
  "Living Room": "/icons/living-room.svg",
  Bedroom: "/icons/bedroom.svg",
  "Dining Room": "/icons/dining-room.svg",
  "Kitchen & Appliance": "/icons/kitchen.svg",
  Office: "/icons/office.svg",
  Bathroom: "/icons/bathroom.svg",
  "Outdoor & Patio": "/icons/outdoor.svg",
  "Boxes & Miscellaneous": "/icons/boxes.svg",
  Others: "/icons/others.svg",
};

const ITEM_CATALOG = [
  {
    category: "Living Room",
    items: ["Sofa", "Coffee Table", "TV", "TV Stand", "Bookshelf", "Recliner"],
  },
  { category: "Bedroom", items: ["Bed", "Nightstand", "Dresser", "Desk"] },
  {
    category: "Dining Room",
    items: ["Dining Room Table", "Dining Chair", "Sideboard"],
  },
  { category: "Kitchen & Appliance", items: ["Fridge", "Oven", "Microwave"] },
  { category: "Office", items: ["Office Chair", "Desk", "Filing Cabinet"] },
  { category: "Bathroom", items: ["Cabinet", "Mirror"] },
  { category: "Outdoor & Patio", items: ["Patio Chair", "BBQ Grill"] },
  {
    category: "Boxes & Miscellaneous",
    items: ["Small Box", "Medium Box", "Large Box"],
  },
  { category: "Others", items: ["Other"] },
] as const;

const SIZE_OPTIONS = [
  { id: "small", label: "Small", description: "up to 65 inches" },
  { id: "medium", label: "Medium", description: "66–85 inches" },
  { id: "large", label: "Large", description: "+ 86 inches" },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (items: Item[]) => void;
};

const makeKey = (category: string, name: string, sizeId: string) =>
  `${category}|${name}|${sizeId}`;

export default function ItemPickerModal({ open, onClose, onAdd }: Props) {
  if (!open) return null;

  const [activeCategory, setActiveCategory] = useState<string>(
    ITEM_CATALOG[0].category
  );
  const [activeItemName, setActiveItemName] = useState<string | null>(null);
  const [selection, setSelection] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const cat = ITEM_CATALOG.find((c) => c.category === activeCategory);
    if (!cat) return [];
    if (!search.trim()) return cat.items;
    return cat.items.filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeCategory, search]);

  const totalSelected = Object.values(selection).reduce(
    (sum, n) => sum + (n || 0),
    0
  );

  const increase = (name: string, sizeId: string) => {
    const key = makeKey(activeCategory, name, sizeId);
    setSelection((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  };

  const decrease = (name: string, sizeId: string) => {
    const key = makeKey(activeCategory, name, sizeId);
    setSelection((prev) => {
      const next = Math.max(0, (prev[key] ?? 0) - 1);
      if (next === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });
  };

  const getQty = (name: string, sizeId: string) =>
    selection[makeKey(activeCategory, name, sizeId)] ?? 0;

  const handleConfirmAdd = () => {
    if (totalSelected <= 0) return;
    const itemsToAdd: Item[] = [];
    Object.entries(selection).forEach(([key, qty]) => {
      if (!qty) return;
      const [category, name, sizeId] = key.split("|");
      itemsToAdd.push({
        id: `${name}-${sizeId}-${Date.now()}`,
        category,
        name,
        size: sizeId as Item["size"],
        quantity: qty,
      });
    });
    onAdd(itemsToAdd);
    onClose();
    setSelection({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:h-[85vh]">
        <div className="relative flex items-center justify-center border-b border-slate-100 py-5">
          <h2 className="text-xl font-bold text-slate-900">
            Please choose an item and size
          </h2>
          <button
            onClick={onClose}
            className="absolute right-6 top-1/2 -translate-y-1/2 hover:opacity-70"
          >
            <Image src="/icons/x.svg" alt="Close" width={24} height={24} />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search items"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-base outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <aside className="w-64 flex-none overflow-y-auto border-r border-slate-100 bg-white">
            <ul>
              {ITEM_CATALOG.map((cat) => {
                const active = cat.category === activeCategory;
                return (
                  <li key={cat.category}>
                    <button
                      onClick={() => {
                        setActiveCategory(cat.category);
                        setActiveItemName(null);
                      }}
                      className={`flex w-full items-center gap-4 px-6 py-4 text-left transition-colors
                        ${active ? "bg-[#EAF5EF] text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <span className="flex h-6 w-6 items-center justify-center">
                        <Image
                          src={
                            CATEGORY_ICONS[cat.category] ||
                            "/icons/item-others.svg"
                          }
                          alt={cat.category}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </span>
                      <span
                        className={`text-sm font-medium ${active ? "font-bold" : ""}`}
                      >
                        {cat.category}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="flex-1 overflow-y-auto bg-white px-8 py-2">
            <div className="space-y-0 divide-y divide-slate-100">
              {filteredItems.map((name) => {
                const isActive = name === activeItemName;
                return (
                  <div key={name} className="py-4">
                    <div
                      className="flex cursor-pointer items-center justify-between"
                      onClick={() => setActiveItemName(isActive ? null : name)}
                    >
                      <span className="text-base font-medium text-slate-900">
                        {name}
                      </span>
                      <button className="flex h-6 w-6 items-center justify-center">
                        {isActive ? (
                          <Image
                            src="/icons/minus.svg"
                            alt="Collapse"
                            width={24}
                            height={24}
                          />
                        ) : (
                          <Image
                            src="/icons/plus.svg"
                            alt="Expand"
                            width={24}
                            height={24}
                          />
                        )}
                      </button>
                    </div>

                    {isActive && (
                      <div className="mt-4 space-y-3">
                        {SIZE_OPTIONS.map((size) => {
                          const qty = getQty(name, size.id);
                          const isSelected = qty > 0;
                          return (
                            <div
                              key={size.id}
                              className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-all
                                ${
                                  isSelected
                                    ? "border-brand bg-[#EAF5EF]"
                                    : "border-slate-300 bg-white"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900">
                                  {size.label}
                                </span>
                                <span className="text-sm text-slate-400">
                                  {size.description}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => decrease(name, size.id)}
                                  className="flex h-6 w-6 items-center justify-center text-slate-900 hover:opacity-70"
                                >
                                  <Minus className="h-4 w-4" strokeWidth={3} />
                                </button>

                                <div className="flex h-8 w-10 items-center justify-center rounded border border-slate-300 bg-white text-base font-medium text-slate-900">
                                  {qty}
                                </div>

                                <button
                                  onClick={() => increase(name, size.id)}
                                  className="flex h-6 w-6 items-center justify-center text-slate-900 hover:opacity-70"
                                >
                                  <Plus className="h-4 w-4" strokeWidth={3} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="border-t border-slate-100 bg-[#F8FAF9] px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1">
              {Object.entries(selection).map(([key, qty]) => {
                if (!qty) return null;
                const [, name, sizeId] = key.split("|");
                const sizeLabel = SIZE_OPTIONS.find(
                  (s) => s.id === sizeId
                )?.label;
                return (
                  <div
                    key={key}
                    className="flex flex-shrink-0 items-center gap-2 rounded-full border border-brand bg-[#EAF5EF] px-4 py-1.5 text-sm font-medium text-brand-dark"
                  >
                    <span className="whitespace-nowrap">
                      {name} ({sizeLabel} {qty})
                    </span>
                    <button
                      onClick={() =>
                        setSelection((prev) => {
                          const { [key]: _, ...rest } = prev;
                          return rest;
                        })
                      }
                      className="ml-1 hover:opacity-70"
                    >
                      <Image
                        src="/icons/x.svg"
                        alt="Remove"
                        width={10}
                        height={10}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleConfirmAdd}
              disabled={totalSelected === 0}
              className="flex-shrink-0 rounded-md bg-brand px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-dark disabled:opacity-50"
            >
              Add ({totalSelected})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
