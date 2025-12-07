// src/app/api/admin/users/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getTokenFromCookies, verifyAdminJWT } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  try {
    // 1. リクエストボディを読む
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { currentPassword, newPassword, confirmPassword } = (body ?? {}) as {
      currentPassword?: unknown;
      newPassword?: unknown;
      confirmPassword?: unknown;
    };

    // 2. バリデーション（型＆必須チェック）
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "currentPassword, newPassword and confirmPassword are required.",
        },
        { status: 400 }
      );
    }

    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    // 3. クッキーからトークンを取得
    const token = await getTokenFromCookies();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 4. JWT を verify して AdminSession を取得
    let session;
    try {
      session = await verifyAdminJWT(token);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = Number(session.sub);
    if (!Number.isInteger(adminId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 5. DB から Admin を取得
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // 6. currentPassword が正しいかチェック
    const ok = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // 7. 新パスワードをハッシュ化して保存
    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: newHash,
      },
    });

    return NextResponse.json(
      { ok: true, message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/admin/users/change-password error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
