"use client";

import React, { useMemo, useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import type { Item } from "./ItemList";

// カテゴリ & アイテムのマスターデータ
const ITEM_CATALOG = [
  {
    category: "Living Room",
    items: ["Sofa", "Coffee Table", "TV", "TV Stand", "Bookshelf", "Recliner"],
  },
  {
    category: "Bedroom",
    items: ["Bed", "Nightstand", "Dresser", "Desk"],
  },
  {
    category: "Dining Room",
    items: ["Dining Table", "Dining Chair", "Sideboard"],
  },
  {
    category: "Kitchen & Appliance",
    items: ["Fridge", "Oven", "Microwave"],
  },
  {
    category: "Office",
    items: ["Office Chair", "Desk", "Filing Cabinet"],
  },
  {
    category: "Bathroom",
    items: ["Cabinet", "Mirror"],
  },
  {
    category: "Outdoor & Patio",
    items: ["Patio Chair", "BBQ Grill"],
  },
  {
    category: "Boxes & Miscellaneous",
    items: ["Small Box", "Medium Box", "Large Box"],
  },
  {
    category: "Others",
    items: ["Other"],
  },
] as const;

const SIZE_OPTIONS = [
  { id: "small", label: "Small", description: "up to 65 inches" },
  { id: "medium", label: "Medium", description: "66–85 inches" },
  { id: "large", label: "Large", description: "86+ inches" },
] as const;

type SizeId = (typeof SIZE_OPTIONS)[number]["id"];

// 「アイテム名 × サイズ」ごとの数量
type QuantityState = Record<string, Record<SizeId, number>>;

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (items: Item[]) => void;
};

export default function ItemPickerModal({ open, onClose, onAdd }: Props) {
  const [activeCategory, setActiveCategory] = useState<
    (typeof ITEM_CATALOG)[number]["category"]
  >(ITEM_CATALOG[0].category);

  const [activeItemName, setActiveItemName] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // 選択中のサイズ
  const [selectedSizeId, setSelectedSizeId] = useState<SizeId | null>("large");

  // ✅ アイテム × サイズごとの数量（デフォルトはすべて 0）
  const [quantities, setQuantities] = useState<QuantityState>({});

  // 数量取得ヘルパー
  const getQuantity = (itemName: string, sizeId: SizeId) =>
    quantities[itemName]?.[sizeId] ?? 0;

  // 数量変更ヘルパー（このアイテム・このサイズだけ変える）
  const changeQuantity = (itemName: string, sizeId: SizeId, delta: 1 | -1) => {
    setQuantities((prev) => {
      const itemQty = prev[itemName] ?? { small: 0, medium: 0, large: 0 };
      const current = itemQty[sizeId] ?? 0;
      const nextForItem = {
        ...itemQty,
        [sizeId]: Math.max(0, current + delta),
      };
      return {
        ...prev,
        [itemName]: nextForItem,
      };
    });
  };

  const filteredItems = useMemo(() => {
    const cat = ITEM_CATALOG.find((c) => c.category === activeCategory);
    if (!cat) return [];
    if (!search.trim()) return cat.items;
    const q = search.toLowerCase();
    return cat.items.filter((name) => name.toLowerCase().includes(q));
  }, [activeCategory, search]);

  if (!open) return null;

  const selectedQty =
    activeItemName && selectedSizeId
      ? getQuantity(activeItemName, selectedSizeId)
      : 0;

  const handleConfirmAdd = () => {
    if (!activeItemName || !selectedSizeId) return;
    const quantity = getQuantity(activeItemName, selectedSizeId);
    if (quantity <= 0) return;

    const newItem: Item = {
      id: `${activeItemName}-${selectedSizeId}-${Date.now()}`,
      category: activeCategory,
      name: activeItemName,
      size: selectedSizeId as Item["size"],
      quantity,
    };

    onAdd([newItem]);
    // 追加後のリセットはお好みで（ここでは数量は保持しておく）
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Please choose an item and size
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 検索 */}
        <div className="border-b px-6 py-3">
          <div className="flex items-center gap-2 rounded-full border bg-[#f7f9f8] px-4 py-2 text-sm text-slate-600">
            <span className="text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search items"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>

        {/* 本体 2 カラム */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左：カテゴリ */}
          <aside className="w-48 border-r bg-[#f7faf8]">
            <ul className="h-full overflow-y-auto text-sm">
              {ITEM_CATALOG.map((cat) => {
                const active = cat.category === activeCategory;
                return (
                  <li key={cat.category}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.category);
                        setActiveItemName(null);
                      }}
                      className={
                        "flex w-full items-center px-4 py-3 text-left " +
                        (active
                          ? "bg-white font-semibold text-[#2f7d4a] border-l-4 border-[#2f7d4a]"
                          : "text-slate-700 hover:bg-white")
                      }
                    >
                      {cat.category}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* 右：アイテム & サイズ */}
          <section className="flex-1 overflow-y-auto">
            <div className="divide-y">
              {filteredItems.map((name) => {
                const isActive = name === activeItemName;
                return (
                  <div key={name} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">
                        {name}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveItemName((prev) =>
                            prev === name ? null : name
                          );
                          setSelectedSizeId("large");
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
                      >
                        {isActive ? "−" : "+"}
                      </button>
                    </div>

                    {/* サイズ選択（アクティブなアイテムだけ） */}
                    {isActive && (
                      <div className="mt-3 space-y-2">
                        {SIZE_OPTIONS.map((size) => {
                          const sizeId = size.id as SizeId;
                          const active = sizeId === selectedSizeId;
                          const qty = getQuantity(name, sizeId); // ← このアイテム・このサイズだけ

                          return (
                            <button
                              key={size.id}
                              type="button"
                              onClick={() => setSelectedSizeId(sizeId)}
                              className={
                                "flex w-full items-center justify-between rounded-lg border px-4 py-2 text-left text-sm " +
                                (active
                                  ? "border-[#2f7d4a] bg-[#eaf5ef] text-[#22503B]"
                                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
                              }
                            >
                              <div>
                                <span className="font-semibold">
                                  {size.label}
                                </span>
                                {size.description && (
                                  <span className="ml-2 text-xs text-slate-500">
                                    {size.description}
                                  </span>
                                )}
                              </div>

                              {/* 数量コントロール */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeQuantity(name, sizeId, -1);
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-4 text-center text-sm">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeQuantity(name, sizeId, 1);
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-500 hover:bg-slate-100"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <p className="px-4 py-6 text-sm text-slate-500">
                  No items found.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          {activeItemName && selectedSizeId ? (
            <div className="rounded-full bg-[#f1f5f2] px-4 py-2 text-xs text-slate-700">
              {activeItemName} ({selectedSizeId}) x {selectedQty}
            </div>
          ) : (
            <span className="text-xs text-slate-500">
              Select an item and size to add.
            </span>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[#2f7d4a] px-5 py-2 text-sm font-semibold text-[#2f7d4a] hover:bg-[#e7f0eb]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!activeItemName || !selectedSizeId || selectedQty <= 0}
              onClick={handleConfirmAdd}
              className="rounded-md bg-[#2f7d4a] px-6 py-2 text-sm font-semibold text-white hover:bg-[#25633b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {activeItemName && selectedSizeId
                ? `Add (${selectedQty})`
                : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
