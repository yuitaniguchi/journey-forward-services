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

const HOURS = Array.from({ length: 13 }, (_, i) => 9 + i); // 9:00 - 21:00

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

  useEffect(() => {
    if (!value) return;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return;
    setSelectedDate(d);
    setSelectedHour(d.getHours());
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const leading = firstDay.getDay();
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
    return currentMonth.toLocaleDateString("en-US", {
      month: "long",
      // year: "numeric", // 画像では「August」だけなのでYearは隠す（必要なら戻してね）
    });
  }, [currentMonth]);

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

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
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
    <div className="relative">
      {/* トリガーボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          "flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-left text-sm shadow-sm transition-all " +
          (error
            ? "border-red-500 focus:ring-red-500"
            : "border-slate-300 hover:border-[#2f7d4a] focus:ring-[#2f7d4a]") +
          " focus:outline-none focus:ring-2"
        }
      >
        <span className={displayValue ? "text-slate-900" : "text-slate-400"}>
          {displayValue || "YYYY-MM-DD"}
        </span>
        <CalendarIcon className="h-5 w-5 text-slate-400" />
      </button>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-4">
          <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* 本体：デスクトップはカレンダー(左)と時間(右)を分割 */}
            <div className="flex flex-1 flex-col overflow-y-auto md:flex-row">
              {/* === 左側：カレンダー === */}
              <div className="w-full px-6 py-6 md:w-[60%] md:border-r border-slate-100">
                {/* 月ナビゲーション (画像に合わせてシンプルに) */}
                <div className="mb-6 flex items-center justify-between px-2">
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
                    className="p-1 text-[#2f7d4a] hover:bg-slate-50 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6 font-bold" />
                  </button>
                  <div className="text-xl font-bold text-slate-800">
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
                    className="p-1 text-[#2f7d4a] hover:bg-slate-50 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-6 w-6 font-bold" />
                  </button>
                </div>

                {/* 曜日ヘッダー */}
                <div className="mb-4 grid grid-cols-7 text-center text-sm font-medium text-[#2f7d4a]">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                    <div key={`weekday-${idx}`}>{d}</div>
                  ))}
                </div>

                {/* 日付グリッド */}
                <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-sm">
                  {daysInMonth.map((d, idx) => {
                    if (!d) {
                      return <div key={`empty-${idx}`} />;
                    }

                    const isSelected =
                      selectedDate &&
                      d.getFullYear() === selectedDate.getFullYear() &&
                      d.getMonth() === selectedDate.getMonth() &&
                      d.getDate() === selectedDate.getDate();

                    const isTodayDate = isToday(d);

                    return (
                      <div
                        key={d.toISOString()}
                        className="flex flex-col items-center justify-center relative"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedDate(d)}
                          className={
                            "flex h-9 w-9 items-center justify-center rounded-full transition-all text-[15px] " +
                            (isSelected
                              ? "bg-[#2f7d4a] font-semibold text-white shadow-md" // 選択中: 緑丸
                              : "text-slate-600 hover:bg-slate-100") // 通常
                          }
                        >
                          {d.getDate()}
                        </button>
                        {/* 今日の日付なら下に緑のアンダーラインを表示 */}
                        {!isSelected && isTodayDate && (
                          <div className="absolute -bottom-1 h-[3px] w-4 bg-[#2f7d4a] rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* === 右側：時間選択 === */}
              <div className="w-full bg-slate-50/30 px-6 py-6 md:w-[40%] flex flex-col">
                {/* 画像ではタイトルがない、またはリストだけなのでシンプルに */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-col gap-3">
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
                            "w-full rounded-md py-3 text-sm font-medium transition-all " +
                            (disabled
                              ? "cursor-not-allowed bg-slate-500 text-slate-300 opacity-80" // 無効: グレー背景+薄い文字
                              : isSelected
                                ? "bg-[#2f7d4a] text-white shadow-md" // 選択中: 緑背景
                                : "border border-[#2f7d4a] bg-white text-[#2f7d4a] hover:bg-[#f0fdf4]") // 選択可能: 白背景+緑枠
                          }
                        >
                          {formatTime(h)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* フッター (キャンセル/決定ボタン) */}
            <div className="flex items-center justify-center gap-6 border-t border-slate-100 p-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-32 rounded-md border border-[#2f7d4a] px-4 py-2.5 text-sm font-semibold text-[#2f7d4a] hover:bg-[#f0fdf4] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedDate || selectedHour === null}
                onClick={handleConfirm}
                className="w-32 rounded-md bg-[#2f7d4a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#25633b] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
