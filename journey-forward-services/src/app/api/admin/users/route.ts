// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const MIN_PASSWORD_LENGTH = 8;
const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    // 1. JSON を読む
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { username, email, password } = (body ?? {}) as {
      username?: unknown;
      email?: unknown;
      password?: unknown;
    };

    // 2. バリデーション
    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "username, email and password are required." },
        { status: 400 }
      );
    }

    if (!username.trim() || !email.trim() || !password.trim()) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 3. username / email の重複チェック
    const existing = await prisma.admin.findFirst({
      where: {
        OR: [{ username: normalizedUsername }, { email: normalizedEmail }],
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (existing) {
      let msg = "Username or email already exists.";
      if (existing.username === normalizedUsername) {
        msg = "This username is already taken.";
      } else if (existing.email === normalizedEmail) {
        msg = "This email is already in use.";
      }

      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // 4. パスワードハッシュ化（bcrypt を auth と揃える）
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 5. Admin を作成（パスワードハッシュは返さない）
    const admin = await prisma.admin.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash, // schema.prisma のフィールド名と一致
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        admin,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
