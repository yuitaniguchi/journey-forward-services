"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  error?: string;
};

const HOURS = Array.from({ length: 13 }, (_, i) => 9 + i); // 9〜21

function formatTime(hour: number) {
  const h12 = hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? "pm" : "am";
  return `${h12}:00${ampm}`;
}

export default function DateTimePicker({ value, onChange, error }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const base = value ? new Date(value) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    value ? new Date(value) : null
  );
  const [selectedHour, setSelectedHour] = useState<number | null>(() => {
    if (!value) return null;
    const d = new Date(value);
    return d.getHours();
  });

  // value が外から変わったときに同期
  useEffect(() => {
    if (!value) return;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return;
    setSelectedDate(d);
    setSelectedHour(d.getHours());
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  // カレンダー用の日付配列
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const leading = firstDay.getDay(); // 0–6 (日曜始まり)
    const totalCells = leading + lastDay.getDate();
    const weeks = Math.ceil(totalCells / 7);
    const cells: (Date | null)[] = [];

    for (let i = 0; i < leading; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push(new Date(year, month, d));
    }
    while (cells.length < weeks * 7) {
      cells.push(null);
    }

    return cells;
  }, [currentMonth]);

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [currentMonth]);

  // 24時間以上先ならOK
  const isSlotDisabled = (date: Date | null, hour: number) => {
    if (!date) return true;
    const candidate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hour,
      0,
      0,
      0
    );
    const min = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return candidate.getTime() < min.getTime();
  };

  const handleConfirm = () => {
    if (!selectedDate || selectedHour === null) return;

    const combined = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedHour,
      0,
      0,
      0
    );
    onChange(combined.toISOString());
    setIsOpen(false);
  };

  const displayValue = useMemo(() => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const datePart = d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${datePart} – ${timePart}`;
  }, [value]);

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-800">
        Pickup Date <span className="text-red-500">*</span>
      </label>

      {/* 入力フィールド（モーダル起動） */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-800 shadow-sm hover:border-[#2f7d4a]/60 focus:outline-none focus:ring-2 focus:ring-[#2f7d4a]"
      >
        <span className={displayValue ? "" : "text-slate-400"}>
          {displayValue || "YYYY-MM-DD – Select time"}
        </span>
        <CalendarIcon className="h-4 w-4 text-slate-500" />
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
          <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl max-h-[90vh]">
            {/* ヘッダー */}
            <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
              <h3 className="text-base font-semibold text-slate-900">
                Choose date &amp; time
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* 本体：モバイルは縦並び + スクロール、デスクトップは左右並び */}
            <div className="flex flex-1 flex-col overflow-y-auto md:flex-row">
              {/* カレンダー部分 */}
              <div className="w-full border-b px-4 py-4 md:w-[60%] md:border-b-0 md:border-r md:px-6 md:py-6">
                {/* 月ナビ */}
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() - 1,
                          1
                        )
                      )
                    }
                    className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="text-base font-semibold text-slate-900">
                    {monthLabel}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth() + 1,
                          1
                        )
                      )
                    }
                    className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* 曜日ヘッダー */}
                <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-[#2f7d4a]">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                    <div key={`weekday-${idx}`}>{d}</div>
                  ))}
                </div>

                {/* 日付グリッド */}
                <div className="grid grid-cols-7 gap-1 text-sm">
                  {daysInMonth.map((d, idx) => {
                    if (!d) {
                      return <div key={`empty-${idx}`} />;
                    }

                    const isSelected =
                      selectedDate &&
                      d.getFullYear() === selectedDate.getFullYear() &&
                      d.getMonth() === selectedDate.getMonth() &&
                      d.getDate() === selectedDate.getDate();

                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={
                          "flex h-9 w-9 items-center justify-center rounded-full mx-auto " +
                          (isSelected
                            ? "bg-[#2f7d4a] text-white"
                            : "text-slate-800 hover:bg-slate-100")
                        }
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 時間帯部分 */}
              <div className="w-full px-4 py-4 md:w-[40%] md:px-6 md:py-6">
                <p className="mb-3 text-sm font-semibold text-slate-900">
                  Select a time
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {HOURS.map((h) => {
                    const disabled = isSlotDisabled(selectedDate, h);
                    const isSelected = selectedHour === h;

                    return (
                      <button
                        key={h}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && setSelectedHour(h)}
                        className={
                          "rounded-md border px-3 py-2 text-sm " +
                          (disabled
                            ? "border-slate-300 bg-slate-200 text-slate-400 cursor-not-allowed"
                            : isSelected
                            ? "border-[#2f7d4a] bg-[#2f7d4a] text-white"
                            : "border-[#2f7d4a] bg-white text-[#2f7d4a] hover:bg-[#eaf5ef]")
                        }
                      >
                        {formatTime(h)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* フッター */}
            <div className="flex justify-end gap-3 border-t px-4 py-3 md:px-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-[#2f7d4a] px-4 py-2 text-sm font-semibold text-[#2f7d4a] hover:bg-[#e7f0eb]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedDate || selectedHour === null}
                onClick={handleConfirm}
                className="rounded-md bg-[#2f7d4a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#25633b] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
