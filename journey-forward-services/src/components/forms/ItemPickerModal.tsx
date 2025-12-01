"use client";

import React, { useMemo, useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import type { Item } from "./ItemList";

// --------------------------------------------------
// マスターデータ
// --------------------------------------------------
const ITEM_CATALOG = [
  {
    category: "Living Room",
    icon: "🛋️",
    items: ["Sofa", "Coffee Table", "TV", "TV Stand", "Bookshelf", "Recliner"],
  },
  {
    category: "Bedroom",
    icon: "🛏️",
    items: ["Bed", "Nightstand", "Dresser", "Desk"],
  },
  {
    category: "Dining Room",
    icon: "🍽️",
    items: ["Dining Room Table", "Dining Chair", "Sideboard"],
  },
  {
    category: "Kitchen & Appliance",
    icon: "🍳",
    items: ["Fridge", "Oven", "Microwave"],
  },
  {
    category: "Office",
    icon: "💼",
    items: ["Office Chair", "Desk", "Filing Cabinet"],
  },
  {
    category: "Bathroom",
    icon: "🛁",
    items: ["Cabinet", "Mirror"],
  },
  {
    category: "Outdoor & Patio",
    icon: "🌿",
    items: ["Patio Chair", "BBQ Grill"],
  },
  {
    category: "Boxes & Miscellaneous",
    icon: "📦",
    items: ["Small Box", "Medium Box", "Large Box"],
  },
  {
    category: "Others",
    icon: "⋯",
    items: ["Other"],
  },
] as const;

const SIZE_OPTIONS = [
  { id: "small", label: "Small", description: "up to 65 inches" },
  { id: "medium", label: "Medium", description: "66–85 inches" },
  { id: "large", label: "Large", description: "86+ inches" },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  // まとめて複数アイテムを返す
  onAdd: (items: Item[]) => void;
};

// category|item|size をキーにする
const makeKey = (category: string, name: string, sizeId: string) =>
  `${category}|${name}|${sizeId}`;

type ViewMode = "categories" | "items";

export default function ItemPickerModal({ open, onClose, onAdd }: Props) {
  // ★ 最初にガードを置く：以降で Hooks を定義
  if (!open) return null;

  const [activeCategory, setActiveCategory] = useState<
    (typeof ITEM_CATALOG)[number]["category"]
  >(ITEM_CATALOG[0].category);

  const [activeItemName, setActiveItemName] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>("large");

  // 数量をキーごとに保存（デフォルト 0）
  const [selection, setSelection] = useState<Record<string, number>>({});

  // モバイル用: 「カテゴリ一覧」or「アイテム一覧」
  const [view, setView] = useState<ViewMode>("categories");

  const [search, setSearch] = useState("");

  // 選択中のカテゴリ＋検索に応じたアイテム一覧
  const filteredItems = useMemo(() => {
    const cat = ITEM_CATALOG.find((c) => c.category === activeCategory);
    if (!cat) return [];
    if (!search.trim()) return cat.items;
    const q = search.toLowerCase();
    return cat.items.filter((name) => name.toLowerCase().includes(q));
  }, [activeCategory, search]);

  // 合計数量
  const totalSelected = Object.values(selection).reduce(
    (sum, n) => sum + (n || 0),
    0
  );

  // selection から Item[] を作って親に渡す
  const handleConfirmAdd = () => {
    if (totalSelected <= 0) return;

    const itemsToAdd: Item[] = [];
    Object.entries(selection).forEach(([key, quantity]) => {
      if (!quantity || quantity <= 0) return;
      const [category, name, sizeId] = key.split("|");

      itemsToAdd.push({
        id: `${name}-${sizeId}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        category,
        name,
        size: sizeId as Item["size"],
        quantity,
      });
    });

    if (itemsToAdd.length === 0) return;

    onAdd(itemsToAdd);

    // リセットして閉じる
    setSelection({});
    setActiveItemName(null);
    setSelectedSizeId("large");
    setView("categories");
    onClose();
  };

  // 数量を 1 増やす
  const increase = (category: string, name: string, sizeId: string) => {
    const key = makeKey(category, name, sizeId);
    setSelection((prev) => ({
      ...prev,
      [key]: (prev[key] ?? 0) + 1,
    }));
  };

  // 数量を 1 減らす（0 で削除）
  const decrease = (category: string, name: string, sizeId: string) => {
    const key = makeKey(category, name, sizeId);
    setSelection((prev) => {
      const current = prev[key] ?? 0;
      const next = Math.max(0, current - 1);
      if (next === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });
  };

  // 指定サイズの現在数量（無ければ 0）
  const getQty = (category: string, name: string, sizeId: string) => {
    const key = makeKey(category, name, sizeId);
    return selection[key] ?? 0;
  };

  // フッター用の簡易ラベル（最初の 1 つだけ）
  const summaryLabel = useMemo(() => {
    const entry = Object.entries(selection).find(([, qty]) => (qty ?? 0) > 0);
    if (!entry) return "";
    const [key, qty] = entry;
    const [, name, sizeId] = key.split("|");
    const sizeLabel =
      SIZE_OPTIONS.find((s) => s.id === sizeId)?.label ?? sizeId;
    return `${name} (${sizeLabel}) x ${qty}`;
  }, [selection]);

  // --------------------------------------------------
  // モバイルレイアウト（< md）
  // --------------------------------------------------
  const renderMobileBody = () => {
    // 画面 1: カテゴリ一覧
    if (view === "categories") {
      return (
        <div className="flex h-full flex-col md:hidden">
          <div className="flex-1 overflow-y-auto">
            <ul className="divide-y">
              {ITEM_CATALOG.map((cat) => (
                <li key={cat.category}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.category);
                      setActiveItemName(null);
                      setSelectedSizeId("large");
                      setView("items");
                    }}
                    className="flex w-full items-center justify-between px-4 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-sm font-medium text-slate-900">
                        {cat.category}
                      </span>
                    </div>
                    <span className="text-lg text-slate-400">→</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    // 画面 2: アイテム一覧 + サイズ選択
    return (
      <div className="flex h-full flex-col md:hidden">
        {/* 戻るバー */}
        <div className="flex items-center border-b px-4 py-3">
          <button
            type="button"
            onClick={() => {
              setView("categories");
              setActiveItemName(null);
              setSelectedSizeId("large");
            }}
            className="mr-2 rounded-full p-1 text-slate-700 hover:bg-slate-100"
          >
            <span className="text-lg">←</span>
          </button>
          <p className="text-sm font-medium text-slate-900">{activeCategory}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="divide-y">
            {filteredItems.map((name) => {
              const isActive = name === activeItemName;
              return (
                <div key={name} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{name}</p>
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

                  {isActive && (
                    <div className="mt-3 space-y-2">
                      {SIZE_OPTIONS.map((size) => {
                        const active = size.id === selectedSizeId;
                        const qty = getQty(activeCategory, name, size.id);

                        return (
                          <button
                            key={size.id}
                            type="button"
                            onClick={() => setSelectedSizeId(size.id)}
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

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  decrease(activeCategory, name, size.id);
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
                                  increase(activeCategory, name, size.id);
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
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // デスクトップレイアウト（md 以上）
  // --------------------------------------------------
  const renderDesktopBody = () => (
    <div className="hidden h-full md:flex md:flex-1 md:overflow-hidden">
      {/* 左：カテゴリ */}
      <aside className="w-56 border-r bg-[#f7faf8]">
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
                    setSelectedSizeId("large");
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
                  <p className="text-sm font-medium text-slate-900">{name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveItemName((prev) =>
                        prev === name ? null : name
                      );
                      setSelectedSizeId("large");
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-s
late-300 text-slate-600 hover:bg-slate-100"
                  >
                    {isActive ? "−" : "+"}
                  </button>
                </div>

                {isActive && (
                  <div className="mt-3 space-y-2">
                    {SIZE_OPTIONS.map((size) => {
                      const active = size.id === selectedSizeId;
                      const qty = getQty(activeCategory, name, size.id);

                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setSelectedSizeId(size.id)}
                          className={
                            "flex w-full items-center justify-between rounded-lg border px-4 py-2 text-left text-sm " +
                            (active
                              ? "border-[#2f7d4a] bg-[#eaf5ef] text-[#22503B]"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
                          }
                        >
                          <div>
                            <span className="font-semibold">{size.label}</span>
                            {size.description && (
                              <span className="ml-2 text-xs text-slate-500">
                                {size.description}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                decrease(activeCategory, name, size.id);
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
                                increase(activeCategory, name, size.id);
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
            <p className="px-4 py-6 text-sm text-slate-500">No items found.</p>
          )}
        </div>
      </section>
    </div>
  );

  // --------------------------------------------------
  // レンダリング
  // --------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="
        flex h-full w-full max-w-full flex-col bg-white shadow-xl
        sm:h-[80vh] sm:max-w-3xl sm:rounded-xl
      "
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Please choose an item and size
          </h2>
          <button
            type="button"
            onClick={() => {
              setSelection({});
              setActiveItemName(null);
              setSelectedSizeId("large");
              setView("categories");
              onClose();
            }}
            className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 検索バー（共通） */}
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

        {/* 本体 */}
        <div className="flex h-full w-full flex-col">
          {renderMobileBody()}
          {renderDesktopBody()}
        </div>

        {/* フッター */}
        <div className="border-t px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* 選択中の要約 */}
            {totalSelected > 0 && summaryLabel ? (
              <div className="rounded-full bg-[#f1f5f2] px-4 py-2 text-xs text-slate-700">
                {summaryLabel}
              </div>
            ) : (
              <span className="text-xs text-slate-500">
                Select an item and size to add.
              </span>
            )}

            <div className="flex w-full gap-3 md:w-auto">
              <button
                type="button"
                onClick={() => {
                  setSelection({});
                  setActiveItemName(null);
                  setSelectedSizeId("large");
                  setView("categories");
                  onClose();
                }}
                className="flex-1 rounded-md border border-[#2f7d4a] px-5 py-2 text-sm font-semibold text-[#2f7d4a] hover:bg-[#e7f0eb] md:flex-none"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={totalSelected === 0}
                onClick={handleConfirmAdd}
                className="flex-1 rounded-md bg-[#2f7d4a] px-6 py-2 text-sm font-semibold text-white hover:bg-[#25633b] disabled:cursor-not-allowed disabled:opacity-40 md:flex-none"
              >
                {totalSelected > 0 ? `Add (${totalSelected})` : "Add (0)"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
