"use client";

import React, { useEffect, useState } from "react";
// プロジェクトのパスに合わせて。今まで ../../components/ui/input を使っていたならそちらでもOK
import { Input } from "@/components/ui/input";

type AddressInputProps = {
  /** React Hook Form から渡される 1つの文字列値 */
  value: string;
  /** 親（BookingForm）に値を返す */
  onChange: (value: string) => void;
  /** Zod などからの外部エラー */
  error?: string;
};

const allowedCities = ["Vancouver", "Burnaby", "Richmond", "Surrey"];

type AddressState = {
  street: string;
  line2: string;
  city: string;
  province: string;
};

export default function AddressInput({
  value,
  onChange,
  error,
}: AddressInputProps) {
  const [addr, setAddr] = useState<AddressState>({
    street: "",
    line2: "",
    city: "",
    province: "",
  });

  const [cityError, setCityError] = useState("");

  // 親から渡ってきた value を 4つのフィールドに分解
  useEffect(() => {
    if (!value) {
      setAddr({ street: "", line2: "", city: "", province: "" });
      return;
    }

    // "street||line2||city||province" という形式で保持する想定
    const parts = value.split("||").map((p) => p.trim());
    setAddr({
      street: parts[0] ?? "",
      line2: parts[1] ?? "",
      city: parts[2] ?? "",
      province: parts[3] ?? "",
    });
  }, [value]);

  // 任意のフィールドが変わったときに state 更新＆ 1つの文字列にまとめて親へ返す
  const handleFieldChange = (field: keyof AddressState, val: string) => {
    setAddr((prev) => {
      const next = { ...prev, [field]: val };
      const combined = [next.street, next.line2, next.city, next.province].join(
        "||"
      );
      onChange(combined);
      return next;
    });
  };

  // City のバリデーション（Vancouver / Burnaby / Richmond / Surrey のみ）
  const handleCityBlur = () => {
    if (addr.city && !allowedCities.includes(addr.city)) {
      setCityError(
        "Service is only available in: Vancouver, Burnaby, Richmond, Surrey."
      );
    } else {
      setCityError("");
    }
  };

  return (
    <div className="mt-4 space-y-2">
      {/* 4つの入力欄を 2列×2行で配置 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 1段目 */}
        <div className="space-y-1">
          <Input
            placeholder="Street Address"
            value={addr.street}
            onChange={(e) => handleFieldChange("street", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Input
            placeholder="Address Line2"
            value={addr.line2}
            onChange={(e) => handleFieldChange("line2", e.target.value)}
          />
        </div>

        {/* 2段目 */}
        <div className="space-y-1">
          <Input
            placeholder="Vancouver"
            value={addr.city}
            onChange={(e) => handleFieldChange("city", e.target.value)}
            onBlur={handleCityBlur}
          />
        </div>
        <div className="space-y-1">
          <Input
            placeholder="British Columbia"
            value={addr.province}
            onChange={(e) => handleFieldChange("province", e.target.value)}
          />
        </div>
      </div>

      {/* エラーメッセージ（Zod か city バリデーションのどちらか） */}
      {(error || cityError) && (
        <p className="text-sm text-red-600">{error || cityError}</p>
      )}
    </div>
  );
}
