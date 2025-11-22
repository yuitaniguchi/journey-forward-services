"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  value: string; // ISO 文字列
  onChange: (value: string) => void;
  error?: string;
};

const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => 9 + i); // 9:00〜21:00

function formatTimeLabel(hour: number) {
  const isPm = hour >= 12;
  const h12 = ((hour + 11) % 12) + 1;
  return `${h12}:00${isPm ? "pm" : "am"}`;
}

export default function DateTimePicker({ value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);

  const parsed = useMemo(() => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [value]);

  const [month, setMonth] = useState<Date>(parsed ?? new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    parsed
      ? new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
      : null
  );
  const [selectedHour, setSelectedHour] = useState<number | null>(
    parsed ? parsed.getHours() : null
  );

  // value が外から変わった時に state を同步
  useEffect(() => {
    if (!parsed) {
      setSelectedDate(null);
      setSelectedHour(null);
      return;
    }
    setMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    setSelectedDate(
      new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    );
    setSelectedHour(parsed.getHours());
  }, [parsed]);

  const minAllowed = useMemo(
    () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    []
  );

  const displayValue = parsed
    ? parsed.toLocaleString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const startWeekDay = startOfMonth.getDay(); // 0:Sun〜
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();

  const handleSelectDate = (day: number) => {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    setSelectedDate(d);
    // 日付だけ変えた場合、時間はそのまま保持
    if (selectedHour != null) {
      const dt = new Date(d);
      dt.setHours(selectedHour, 0, 0, 0);
      onChange(dt.toISOString());
    }
  };

  const handleSelectTime = (hour: number) => {
    if (!selectedDate) return;
    const dt = new Date(selectedDate);
    dt.setHours(hour, 0, 0, 0);

    // 24 時間より前の枠は押しても何もしない
    if (dt.getTime() < minAllowed.getTime()) return;

    setSelectedHour(hour);
    onChange(dt.toISOString());
  };

  const handleResetAndClose = () => {
    if (!parsed) {
      setSelectedDate(null);
      setSelectedHour(null);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-800">
        Pickup Date <span className="text-red-500">*</span>
      </label>

      {/* 入力欄＋カレンダーアイコン */}
      <div className="relative">
        <Input
          readOnly
          placeholder="YYYY-MM-DD, 9:00am"
          value={displayValue}
          onClick={() => setOpen((o) => !o)}
          className="cursor-pointer pr-10"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-700"
        >
          <CalendarIcon className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* カレンダーパネル */}
      {open && (
        <div className="mt-3 w-full rounded-xl border border-[#e0e7e2] bg-white p-4 shadow-lg">
          {/* カレンダー & 時間リスト：SP では縦1列、md 以上で2列 */}
          <div className="grid gap-4 md:grid-cols-[2fr,1.4fr]">
            {/* カレンダー */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setMonth(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                    )
                  }
                  className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-semibold text-slate-900">
                  {month.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setMonth(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                    )
                  }
                  className="rounded-full p-1 text-slate-600 hover:bg-slate-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* 曜日ヘッダー */}
              <div className="mb-1 grid grid-cols-7 text-center text-xs font-medium text-[#2f7d4a]">
                {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* 日付グリッド */}
              <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
                {/* 先頭の空白マス */}
                {Array.from({ length: startWeekDay }).map((_, i) => (
                  <div key={`blank-${i}`} />
                ))}
                {/* 当月の日付 */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const d = new Date(
                    month.getFullYear(),
                    month.getMonth(),
                    day
                  );

                  const isSelected =
                    selectedDate &&
                    d.getFullYear() === selectedDate.getFullYear() &&
                    d.getMonth() === selectedDate.getMonth() &&
                    d.getDate() === selectedDate.getDate();

                  const isPast =
                    d <
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      new Date().getDate()
                    );

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isPast}
                      onClick={() => handleSelectDate(day)}
                      className={
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm " +
                        (isSelected
                          ? "bg-[#2f7d4a] text-white"
                          : isPast
                          ? "text-slate-300"
                          : "text-slate-800 hover:bg-[#e8f3ec]")
                      }
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 時間帯：SP は 2 列グリッド、md 以上は1列縦並び */}
            <div className="flex flex-col">
              <p className="mb-2 text-sm font-medium text-slate-800">
                Select a time
              </p>
              {!selectedDate && (
                <p className="mb-2 text-xs text-slate-500">
                  Please select a date first.
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-2">
                {TIME_SLOTS.map((hour) => {
                  const label = formatTimeLabel(hour);
                  const dt =
                    selectedDate &&
                    new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate(),
                      hour,
                      0,
                      0,
                      0
                    );
                  const disabled =
                    !selectedDate || !dt || dt.getTime() < minAllowed.getTime();

                  const isActive =
                    !disabled && selectedHour != null && selectedHour === hour;

                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectTime(hour)}
                      className={
                        "rounded-md border px-3 py-2 text-sm " +
                        (disabled
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          : isActive
                          ? "border-[#2f7d4a] bg-[#2f7d4a] text-white"
                          : "border-[#2f7d4a] bg-white text-[#22503B] hover:bg-[#eaf5ef]")
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* フッターボタン：SP では縦並び、sm 以上で横並び右寄せ */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetAndClose}
              className="w-full sm:w-32 border-[#2f7d4a] text-[#2f7d4a] hover:bg-[#e7f0eb]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedDate || selectedHour == null}
              onClick={() => setOpen(false)}
              className="w-full sm:w-32 bg-[#2f7d4a] text-white hover:bg-[#25633b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
