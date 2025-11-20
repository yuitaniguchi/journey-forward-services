"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DateTimePickerProps = {
  value: string; // ISO 文字列 or ""
  onChange: (value: string) => void;
  error?: string;
};

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

const MIN_DIFF_MS = 24 * 60 * 60 * 1000; // 24時間

export default function DateTimePicker({
  value,
  onChange,
  error,
}: DateTimePickerProps) {
  // モーダルの開閉
  const [open, setOpen] = useState(false);

  // 選択中の年月（日付パネル用）
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return value ? new Date(value) : new Date();
  });

  // モーダル内で編集中の値（Confirm するまでは親には渡さない）
  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    value ? new Date(value) : null
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(() => {
    if (!value) return null;
    const d = new Date(value);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  });

  // 親から value が変わった時にも同期しておく
  useEffect(() => {
    if (!value) {
      setSelectedDate(null);
      setSelectedTime(null);
      return;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return;
    setSelectedDate(d);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    setSelectedTime(`${h}:${m}`);
    setCurrentMonth(d);
  }, [value]);

  // UI用：入力欄に表示する文字
  const displayValue = useMemo(() => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, [value]);

  // カレンダーのための情報
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-11
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekDay = firstDayOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayPlus24h = useMemo(() => new Date(Date.now() + MIN_DIFF_MS), []);

  // 指定された日付＋時間の Date を作るヘルパー
  const buildDateTime = (date: Date, time: string) => {
    const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hh,
      mm,
      0,
      0
    );
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;
    const dt = buildDateTime(selectedDate, selectedTime);

    // ISO文字列で親フォームに渡す
    onChange(dt.toISOString());
    setOpen(false);
  };

  // 時間スロットの disabled 判定（24時間ルール）
  const isTimeDisabled = (time: string) => {
    if (!selectedDate) return true;
    const dt = buildDateTime(selectedDate, time);
    return dt.getTime() < todayPlus24h.getTime();
  };

  return (
    <div className="space-y-1">
      {/* 入力欄（クリックでモーダル表示） */}
      <label className="text-sm font-medium text-slate-800">
        Pickup Date <span className="text-red-500">*</span>
      </label>
      <div className="relative flex items-center" onClick={() => setOpen(true)}>
        <Input
          value={displayValue}
          placeholder="YYYY-MM-DD – 9:00AM"
          readOnly
          className="cursor-pointer pr-10"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="absolute right-3 flex h-5 w-5 items-center justify-center text-slate-500 hover:text-slate-700"
        >
          <CalendarIcon className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* モーダル本体 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 flex max-w-3xl flex-col rounded-xl bg-white p-6 shadow-xl md:flex-row md:p-8">
            {/* 左：カレンダー */}
            <div className="w-full border-b border-slate-200 pb-4 md:w-[360px] md:border-b-0 md:border-r md:pb-0 md:pr-6">
              {/* 月切替ヘッダー */}
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                  className="rounded-full p-1 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-base font-semibold text-slate-900">
                  {currentMonth.toLocaleString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                  className="rounded-full p-1 hover:bg-slate-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* 曜日ヘッダー */}
              <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-slate-500">
                {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* 日付グリッド */}
              <div className="grid grid-cols-7 gap-y-1 text-sm">
                {/* 前の月の空白 */}
                {Array.from({ length: startWeekDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* 実際の日付 */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const cellDate = new Date(year, month, day);
                  const isSelected =
                    selectedDate &&
                    cellDate.toDateString() === selectedDate.toDateString();

                  const isPast =
                    cellDate.getTime() <
                    new Date(
                      todayPlus24h.getFullYear(),
                      todayPlus24h.getMonth(),
                      todayPlus24h.getDate()
                    ).getTime(); // 24hルールのため、過去日は全部NG

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isPast}
                      onClick={() => setSelectedDate(cellDate)}
                      className={
                        "mx-auto my-1 flex h-9 w-9 items-center justify-center rounded-full text-sm " +
                        (isSelected
                          ? "bg-[#2f7d4a] text-white"
                          : isPast
                          ? "text-slate-300"
                          : "text-slate-800 hover:bg-slate-100")
                      }
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 右：時間スロット */}
            <div className="mt-4 w-full md:mt-0 md:w-[220px] md:pl-6">
              <p className="mb-3 text-sm font-medium text-slate-800">Time</p>
              <div className="flex flex-col gap-2">
                {TIME_SLOTS.map((slot) => {
                  const disabled = isTimeDisabled(slot);
                  const active = selectedTime === slot && !disabled;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return;
                        setSelectedTime(slot);
                      }}
                      className={
                        "w-full rounded-md border py-2 text-sm " +
                        (active
                          ? "border-[#2f7d4a] bg-[#e5f3ea] text-[#22503B]"
                          : disabled
                          ? "border-transparent bg-slate-200 text-slate-400"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
                      }
                    >
                      {formatTimeLabel(slot)}
                    </button>
                  );
                })}
              </div>

              {/* モーダルのフッターボタン */}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-md border-[#3F7253] bg-white px-6 text-[#3F7253] hover:bg-[#e7f0eb]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selectedDate || !selectedTime}
                  className="rounded-md bg-[#3F7253] px-6 text-white hover:bg-[#315e45] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// "09:00" -> "9:00am"
function formatTimeLabel(slot: string) {
  const [hh, mm] = slot.split(":").map((n) => parseInt(n, 10));
  const ampm = hh >= 12 ? "pm" : "am";
  const hour12 = ((hh + 11) % 12) + 1;
  return `${hour12}:${mm.toString().padStart(2, "0")}${ampm}`;
}
