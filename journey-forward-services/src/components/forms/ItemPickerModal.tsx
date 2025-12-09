"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Plus, Minus, ArrowLeft, ChevronRight, X } from "lucide-react";

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

export const SIZE_OPTIONS = [
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
  const [isMobileItemView, setIsMobileItemView] = useState(false);

  const [activeItemName, setActiveItemName] = useState<string | null>(null);
  const [selection, setSelection] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    const normalize = (str: string) => str.toLowerCase();
    const query = normalize(search);

    if (!query.trim()) {
      const cat = ITEM_CATALOG.find((c) => c.category === activeCategory);
      return cat ? [{ category: cat.category, items: cat.items }] : [];
    }

    return ITEM_CATALOG.map((cat) => ({
      category: cat.category,
      items: cat.items.filter((name) => normalize(name).includes(query)),
    })).filter((group) => group.items.length > 0);
  }, [activeCategory, search]);

  const totalSelected = Object.values(selection).reduce(
    (sum, n) => sum + (n || 0),
    0
  );

  const increase = (category: string, name: string, sizeId: string) => {
    const key = makeKey(category, name, sizeId);
    setSelection((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  };

  const decrease = (category: string, name: string, sizeId: string) => {
    const key = makeKey(category, name, sizeId);
    setSelection((prev) => {
      const next = Math.max(0, (prev[key] ?? 0) - 1);
      if (next === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });
  };

  const getQty = (category: string, name: string, sizeId: string) =>
    selection[makeKey(category, name, sizeId)] ?? 0;

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

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setActiveItemName(null);
    setSearch("");
    setIsMobileItemView(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[85vh] sm:max-w-4xl sm:rounded-xl">
        {/* Header */}
        <div className="relative flex items-center justify-center border-b border-slate-100 py-4 sm:py-5">
          <h2 className="px-10 text-center text-lg font-bold text-slate-900 sm:text-xl">
            Please choose an item and size
          </h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 sm:right-6"
          >
            <Image src="/icons/x.svg" alt="Close" width={24} height={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search items"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-base outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex min-h-0 flex-1 relative">
          {/* Sidebar: Categories */}
          <aside
            className={`
              flex-none overflow-y-auto border-r border-slate-100 bg-white
              ${
                isMobileItemView || search
                  ? "hidden sm:block"
                  : "w-full sm:w-64"
              }
            `}
          >
            <ul>
              {ITEM_CATALOG.map((cat) => {
                const active = !search && cat.category === activeCategory;
                return (
                  <li key={cat.category}>
                    <button
                      onClick={() => handleCategoryClick(cat.category)}
                      className={`flex w-full items-center justify-between px-6 py-4 text-left transition-colors sm:justify-start sm:gap-4
                        ${
                          active
                            ? "bg-[#EAF5EF] text-slate-900"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <div className="flex items-center gap-4">
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
                          className={`text-sm font-medium ${
                            active ? "font-bold" : ""
                          }`}
                        >
                          {cat.category}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-900 sm:hidden" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Main Section: Items */}
          <section
            className={`
              flex-1 overflow-y-auto bg-white px-4 py-2 sm:px-8
              ${!isMobileItemView && !search ? "hidden sm:block" : "w-full"}
            `}
          >
            {/* Mobile Back Button */}
            {!search && (
              <div className="mb-2 flex items-center border-b border-slate-100 pb-2 sm:hidden">
                <button
                  onClick={() => setIsMobileItemView(false)}
                  className="mr-2 p-1 hover:opacity-70"
                >
                  <ArrowLeft className="h-6 w-6 text-slate-900" />
                </button>
              </div>
            )}

            <div className="space-y-6">
              {filteredGroups.map((group) => (
                <div
                  key={group.category}
                  className="space-y-0 divide-y divide-slate-100"
                >
                  {search && (
                    <h3 className="bg-slate-50 px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                      {group.category}
                    </h3>
                  )}

                  {group.items.map((name) => {
                    const itemKey = `${group.category}-${name}`;
                    const isActive = itemKey === activeItemName;

                    return (
                      <div key={itemKey} className="py-4">
                        <div
                          className="flex cursor-pointer items-center justify-between"
                          onClick={() =>
                            setActiveItemName(isActive ? null : itemKey)
                          }
                        >
                          <span className="text-base font-medium text-slate-900">
                            {name}
                          </span>
                          <button className="flex h-6 w-6 items-center justify-center text-[#22503B]">
                            {isActive ? (
                              <div className="rounded-full bg-[#22503B] p-0.5 text-white">
                                <Minus className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="rounded-full border border-[#22503B] p-0.5 text-[#22503B]">
                                <Plus className="h-4 w-4" />
                              </div>
                            )}
                          </button>
                        </div>

                        {isActive && (
                          <div className="mt-4 space-y-3">
                            {SIZE_OPTIONS.map((size) => {
                              const qty = getQty(group.category, name, size.id);
                              const isSelected = qty > 0;

                              return (
                                <div
                                  key={size.id}
                                  onClick={() => {
                                    if (qty === 0)
                                      increase(group.category, name, size.id);
                                  }}
                                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition-all sm:px-4 sm:py-3
                                    ${
                                      isSelected
                                        ? "border-[#3F7253] bg-[#EAF5EF]"
                                        : "border-slate-300 bg-white hover:border-[#3F7253]"
                                    }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                    <span className="text-sm font-bold text-slate-900 sm:text-base">
                                      {size.label}
                                    </span>
                                    <span className="text-xs text-slate-400 sm:text-sm">
                                      {size.description}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        decrease(group.category, name, size.id);
                                      }}
                                      className="flex h-8 w-8 items-center justify-center text-slate-900 hover:opacity-70"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>

                                    <div className="flex h-8 w-8 items-center justify-center rounded border border-slate-300 bg-white text-base font-medium text-slate-900">
                                      {qty}
                                    </div>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        increase(group.category, name, size.id);
                                      }}
                                      className="flex h-8 w-8 items-center justify-center text-slate-900 hover:opacity-70"
                                    >
                                      <Plus className="h-4 w-4" />
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
              ))}

              {filteredGroups.length === 0 && (
                <div className="py-8 text-center text-slate-500">
                  No items found.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 bg-[#F8FAF9] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Selected Chips Area */}
            <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {Object.entries(selection).map(([key, qty]) => {
                if (!qty) return null;
                const [, name, sizeId] = key.split("|");
                const sizeLabel = SIZE_OPTIONS.find(
                  (s) => s.id === sizeId
                )?.label;
                return (
                  <div
                    key={key}
                    className="flex flex-shrink-0 items-center gap-2 rounded border border-[#3F7253] bg-[#EAF5EF] px-3 py-1 text-sm font-medium text-[#3F7253]"
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
                        style={{
                          filter:
                            "brightness(0) saturate(100%) invert(35%) sepia(12%) saturate(1900%) hue-rotate(97deg) brightness(96%) contrast(90%)",
                        }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add Button */}
            <button
              onClick={handleConfirmAdd}
              disabled={totalSelected === 0}
              className="w-full flex-shrink-0 rounded-md bg-[#3F7253] px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#2d523b] disabled:opacity-50 sm:w-auto"
            >
              Add ({totalSelected})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
