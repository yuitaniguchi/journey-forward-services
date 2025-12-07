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
    <div className="space-y-6">
      <p className="font-semibold text-[#22503B]">Step 4</p>
      <h2 className="text-xl font-semibold text-[#22503B]">Size of Items</h2>
      <p className="text-xs text-slate-500">Uploading Pictures is optional</p>
      <ItemList
        items={items}
        onChange={(updatedItems) => {
          setItems(updatedItems);
          if (updatedItems.length > 0) setItemsError("");
        }}
      />
      {itemsError && <p className="text-sm text-red-600">{itemsError}</p>}
    </div>
  );
}
