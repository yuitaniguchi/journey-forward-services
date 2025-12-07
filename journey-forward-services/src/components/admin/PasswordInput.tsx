"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * 共通のパスワード入力コンポーネント
 * - 右側に「目」アイコン
 * - クリックで表示 / 非表示をトグル
 */
export default function PasswordInput(props: PasswordInputProps) {
  const { className, ...rest } = props;
  const [show, setShow] = useState(false);

  const type = show ? "text" : "password";

  return (
    <div className="relative">
      <input
        {...rest}
        type={type}
        className={
          "w-full rounded-xl border border-slate-300 px-4 py-2 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 " +
          (className ?? "")
        }
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-900 focus:outline-none"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          // 目が開いたアイコン（パスワード表示中）
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          // 目にスラッシュ（パスワード非表示）
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 3l18 18" />
            <path d="M10.58 10.58A3 3 0 0113.42 13.4" />
            <path d="M9.88 4.62A9.77 9.77 0 0112 4c6.5 0 10 6 10 6a17.3 17.3 0 01-3 4.35" />
            <path d="M6.61 6.61C3.6 8.06 2 12 2 12a17.4 17.4 0 004.49 5.11" />
          </svg>
        )}
      </button>
    </div>
  );
}
