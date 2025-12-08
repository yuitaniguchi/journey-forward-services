"use client";

import ItemList, { Item } from "../ItemList";

type Props = {
  items: Item[];
  setItems: (items: Item[]) => void;
  itemsError: string;
  setItemsError: (error: string) => void;
};

export default function StepItems({
  items,
  setItems,
  itemsError,
  setItemsError,
}: Props) {
  return (
    <div className="flex w-full flex-col">
      {/* ヘッダー部分 */}
      <div className="mb-6">
        <p className="text-lg font-bold text-[#22503B]">Step 4</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Size of items</h2>
        <p className="mt-1 text-sm text-slate-500">
          Uploading Pictures is optional
        </p>
      </div>

      {/* アイテムリストコンポーネント */}
      <ItemList
        items={items}
        onChange={(updatedItems) => {
          setItems(updatedItems);
          if (updatedItems.length > 0) setItemsError("");
        }}
      />

      {/* エラーメッセージ */}
      {itemsError && <p className="mt-4 text-sm text-red-600">{itemsError}</p>}
    </div>
  );
}
